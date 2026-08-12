import { z } from 'zod';
import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq, sql } from 'drizzle-orm';

const cancelSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const parsed = cancelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.errors });
    }
    const { orderNumber } = parsed.data;

    const db = getDb();

    // Fetch order
    const [existingOrder] = await db.select().from(schema.orders).where(eq(schema.orders.orderNumber, orderNumber)).limit(1);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (existingOrder.orderStatus === 'CANCELLED') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Database Transaction
    await db.transaction(async (tx) => {
      
      // Mark as cancelled
      await tx.update(schema.orders)
        .set({ orderStatus: 'CANCELLED' })
        .where(eq(schema.orders.id, existingOrder.id));

      // Fetch items
      const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, existingOrder.id));

      if (items.length > 0) {
        // Restore stock
        for (const item of items) {
          await tx.update(schema.products)
            .set({ stock: sql`${schema.products.stock} + ${item.quantity}` })
            .where(eq(schema.products.id, item.productId));
        }

        // Insert inventory movements
        const inventoryMovementsToInsert = items.map(item => ({
          productId: item.productId,
          movementType: 'CANCEL',
          quantity: item.quantity,
          referenceId: orderNumber,
          notes: `Order cancelled`
        }));
        await tx.insert(schema.inventoryMovements).values(inventoryMovementsToInsert);
      }
    });

    return res.status(200).json({ success: true, message: 'Order successfully cancelled and stock restored' });

  } catch (error) {
    console.error('Error cancelling order:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to cancel order' });
  }
}
