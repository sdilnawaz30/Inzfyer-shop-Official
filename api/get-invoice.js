import { z } from 'zod';
import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

const getInvoiceSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  contact: z.string().min(1, "Email or phone is required for authentication"),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const parsed = getInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.errors });
    }
    const { orderNumber, contact } = parsed.data;

    const db = getDb();

    // Fetch order
    const [existingOrder] = await db.select().from(schema.orders).where(eq(schema.orders.orderNumber, orderNumber)).limit(1);
    
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authenticate (Basic validation using email or mobile)
    const orderEmail = (existingOrder.email || existingOrder.customerEmail || '').toLowerCase().trim();
    const orderPhone = (existingOrder.phone || existingOrder.customerPhone || '').trim();
    const providedContact = contact.toLowerCase().trim();

    if (providedContact !== orderEmail && providedContact !== orderPhone) {
      return res.status(401).json({ message: 'Unauthorized access to this invoice.' });
    }

    // Fetch items
    const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, existingOrder.id));

    return res.status(200).json({
      success: true,
      data: {
        order: existingOrder,
        items: items
      }
    });

  } catch (error) {
    console.error('Error fetching invoice:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve invoice data' });
  }
}
