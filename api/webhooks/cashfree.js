import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const payload = JSON.stringify(req.body);

    const secretKey = process.env.CASHFREE_SECRET_KEY;

    // 1. Verify Cashfree Webhook Signature
    const dataToHash = timestamp + payload;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(dataToHash)
      .digest('base64');

    if (expectedSignature !== signature) {
      console.error('Webhook signature mismatch');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data, type } = req.body;

    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderId = data.order.order_id;
      const payment = data.payment;

      const db = getDb();
      
      // Update order status in database
      await db.update(schema.orders)
        .set({
          paymentStatus: 'Paid',
          transactionId: payment.cf_payment_id.toString(),
        })
        .where(eq(schema.orders.orderId, orderId));

      // Fetch the order to decrement stock
      const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderId, orderId));
      if (order) {
        for (const item of order.items) {
          // Decrement stock in DB
          // Note: a real app would use a transaction or raw SQL decrement
          const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.id));
          if (product) {
             await db.update(schema.products)
               .set({ stock: Math.max(0, product.stock - item.qty) })
               .where(eq(schema.products.id, item.id));
          }
        }
      }

      return res.status(200).json({ message: 'Webhook processed successfully' });
    }

    return res.status(200).json({ message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
