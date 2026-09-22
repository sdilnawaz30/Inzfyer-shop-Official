import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, sql } from 'drizzle-orm';
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

      // Fetch the order to decrement stock
      const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderNumber, orderId));
      if (order && order.paymentStatus !== 'PAID') {
        // Update order status in database
        await db.update(schema.orders)
          .set({
            paymentStatus: 'PAID',
            orderStatus: 'PROCESSING',
            gatewayPaymentId: payment.cf_payment_id.toString(),
          })
          .where(eq(schema.orders.orderNumber, orderId));
      }

      return res.status(200).json({ message: 'Webhook processed successfully' });
    }
    
    if (type === 'PAYMENT_FAILED_WEBHOOK') {
      const orderId = data.order.order_id;
      const db = getDb();
      
      const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderNumber, orderId));
      if (order && order.paymentStatus === 'PENDING' && order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'FAILED') {
        
        await db.transaction(async (tx) => {
          // Mark as failed
          await tx.update(schema.orders)
            .set({ orderStatus: 'FAILED', paymentStatus: 'FAILED' })
            .where(eq(schema.orders.id, order.id));

          // Fetch items
          const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));

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
              movementType: 'RESTOCK',
              quantity: item.quantity,
              referenceId: orderId,
              notes: 'Payment failed webhook, stock restored'
            }));
            await tx.insert(schema.inventoryMovements).values(inventoryMovementsToInsert);
          }
        });
        console.log(`Order ${orderId} failed, stock restored.`);
      }
      return res.status(200).json({ message: 'Webhook processed successfully' });
    }

    return res.status(200).json({ message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
