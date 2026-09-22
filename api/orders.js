import { z } from 'zod';
import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq, sql, or, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const getInvoiceSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  contact: z.string().min(1, "Email or phone is required for authentication"),
});

const cancelSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const action = req.query?.action || req.body?.action || (req.body?.contact ? 'invoice' : 'cancel');

  try {
    const db = getDb();

    // 1. GET INVOICE / ORDER LOOKUP
    if (action === 'invoice' || action === 'getInvoice') {
      const parsed = getInvoiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid input', errors: parsed.error.errors });
      }
      const { orderNumber, contact } = parsed.data;

      // Fetch order
      const [existingOrder] = await db.select().from(schema.orders).where(eq(schema.orders.orderNumber, orderNumber)).limit(1);
      
      if (!existingOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // IDOR Protection: Authenticate using email or mobile registered with the order
      const orderEmail = (existingOrder.email || '').toLowerCase().trim();
      const orderPhone = (existingOrder.phone || '').trim();
      const providedContact = contact.toLowerCase().trim();

      if (providedContact !== orderEmail && providedContact !== orderPhone) {
        return res.status(401).json({ success: false, message: 'Unauthorized access to this invoice.' });
      }

      // Fetch line items
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, existingOrder.id));

      return res.status(200).json({
        success: true,
        data: {
          order: existingOrder,
          items: items
        }
      });
    }

    // 2. CANCEL ORDER & RESTOCK
    else if (action === 'cancel' || action === 'cancelOrder') {
      const parsed = cancelSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid input', errors: parsed.error.errors });
      }
      const { orderNumber } = parsed.data;

      // Fetch order
      const [existingOrder] = await db.select().from(schema.orders).where(eq(schema.orders.orderNumber, orderNumber)).limit(1);
      if (!existingOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (existingOrder.orderStatus === 'CANCELLED' || existingOrder.orderStatus === 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Order is already cancelled' });
      }

      // Database Transaction for Cancellation & Stock Restoration
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
            notes: 'Order cancelled'
          }));
          await tx.insert(schema.inventoryMovements).values(inventoryMovementsToInsert);
        }
      });

      return res.status(200).json({ success: true, message: 'Order successfully cancelled and stock restored' });
    }

    else if (action === 'myOrders') {
      const { customerToken } = req.body;
      if (!customerToken) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Token required.' });
      }

      let contact;
      try {
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_please_change';
        const decoded = jwt.verify(customerToken, jwtSecret);
        contact = decoded.contact;
      } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
      }

      if (!contact) {
        return res.status(400).json({ success: false, message: 'Contact information missing from token.' });
      }

      const userOrders = await db.select()
        .from(schema.orders)
        .where(or(
          eq(schema.orders.email, contact),
          eq(schema.orders.phone, contact)
        ))
        .orderBy(desc(schema.orders.createdAt));

      // Also fetch items for these orders so the frontend has full data
      const orderIds = userOrders.map(o => o.id);
      let items = [];
      if (orderIds.length > 0) {
        // Unfortunately inArray throws if array is empty, so we wrap it
        const { inArray } = await import('drizzle-orm');
        items = await db.select().from(schema.orderItems).where(inArray(schema.orderItems.orderId, orderIds));
      }

      // Group items by order
      const ordersWithItems = userOrders.map(order => ({
        ...order,
        items: items.filter(i => i.orderId === order.id).map(i => ({
          name: i.productName,
          qty: i.quantity,
          price: Number(i.unitPrice),
          gstRate: Number(i.gstRate || 18)
        }))
      }));

      return res.status(200).json({ success: true, data: ordersWithItems });
    }

    else {
      return res.status(400).json({ success: false, message: 'Invalid order action' });
    }

  } catch (error) {
    console.error('Error in /api/orders:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to process order request' });
  }
}
