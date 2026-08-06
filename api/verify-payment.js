import axios from 'axios';
import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Missing order_id' });
  }

  const appId = process.env.VITE_CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX';
  
  const baseUrl = env === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

  try {
    const response = await axios.get(
      `${baseUrl}/orders/${orderId}/payments`,
      {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const payments = response.data;
    const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS');

    if (successfulPayment) {
      // Update DB if not already updated by webhook
      const db = getDb();
      const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderId, orderId));
      
      if (order && order.paymentStatus !== 'Paid') {
        await db.update(schema.orders)
          .set({
            paymentStatus: 'Paid',
            transactionId: successfulPayment.cf_payment_id.toString(),
          })
          .where(eq(schema.orders.orderId, orderId));

        // Decrement stock
        for (const item of order.items) {
          const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.id));
          if (product) {
            await db.update(schema.products)
              .set({ stock: Math.max(0, product.stock - item.qty) })
              .where(eq(schema.products.id, item.id));
          }
        }
      }

      // Fetch the updated order
      const [updatedOrder] = await db.select().from(schema.orders).where(eq(schema.orders.orderId, orderId));

      res.status(200).json({
        success: true,
        payment: successfulPayment,
        orderData: updatedOrder, // Return the verified order data to frontend
        message: 'Payment verified successfully'
      });
    } else {
      const latestPayment = payments[payments.length - 1];
      res.status(200).json({
        success: false,
        payment: latestPayment,
        message: 'Payment not successful'
      });
    }

  } catch (error) {
    console.error('Error verifying Cashfree payment:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment',
      error: error.response?.data || error.message
    });
  }
}

