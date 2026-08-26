import { z } from 'zod';
import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, or, sql } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { enqueueNotification } from '../_utils/notifications.js';

// Setup admin Supabase client using Service Role to query profiles and verify user
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const updateStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  newStatus: z.string().min(1, "Status is required"),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. Authorize User
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header.' });
    }
    const token = authHeader.split(' ')[1];

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Verify Admin Role using Neon DB
    const db = getDb();
    const profile = await db.select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, user.id))
      .limit(1);

    if (profile.length === 0 || profile[0].role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    // 2. Validate Payload
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.errors });
    }
    const { orderId, newStatus } = parsed.data;

    // 3. Fetch current order
    const [existingOrder] = await db.select().from(schema.orders).where(
      or(eq(schema.orders.orderNumber, orderId), eq(schema.orders.id, orderId))
    ).limit(1);

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = existingOrder.orderStatus;
    const isCurrentlyCancelled = currentStatus === 'Cancelled' || currentStatus === 'CANCELLED' || currentStatus === 'Refunded' || currentStatus === 'REFUNDED';
    const isMovingToCancelled = newStatus.toUpperCase() === 'CANCELLED' || newStatus.toUpperCase() === 'REFUNDED';

    // 4. Update Database
    await db.transaction(async (tx) => {
      // Update the status
      await tx.update(schema.orders)
        .set({ orderStatus: newStatus })
        .where(eq(schema.orders.id, existingOrder.id));

      // Handle Stock Restoration if moving to Cancelled/Refunded for the first time
      if (!isCurrentlyCancelled && isMovingToCancelled) {
        const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, existingOrder.id));
        
        if (items.length > 0) {
          for (const item of items) {
            await tx.update(schema.products)
              .set({ stock: sql`${schema.products.stock} + ${item.quantity}` })
              .where(eq(schema.products.id, item.productId));
          }

          const inventoryMovementsToInsert = items.map(item => ({
            productId: item.productId,
            movementType: newStatus.toUpperCase(),
            quantity: item.quantity,
            referenceId: existingOrder.orderNumber,
            notes: `Order ${newStatus} by Admin`
          }));
          await tx.insert(schema.inventoryMovements).values(inventoryMovementsToInsert);
        }
      }
      
      // Enqueue notification based on new status
      const notificationType = newStatus.toUpperCase() === 'REFUNDED' ? 'REFUND_COMPLETED' : `ORDER_${newStatus.toUpperCase()}`;
      const contact = existingOrder.email || existingOrder.phone;
      if (['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(newStatus)) {
        await enqueueNotification(tx, existingOrder.id, contact, notificationType);
      }
    });

    return res.status(200).json({ success: true, message: `Order marked as ${newStatus}` });

  } catch (error) {
    console.error('Error updating order status:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
}
