import axios from 'axios';
import { z } from 'zod';
import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { inArray } from 'drizzle-orm';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Zod schema for input validation
const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    qty: z.number().int().positive()
  })).min(1, "Cart is empty"),
  customerDetails: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
  })
});

// Setup Rate Limiting (10 requests per 10 seconds per IP)
let ratelimit;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Rate Limiting Check
  if (ratelimit) {
    const ip = req.headers['x-forwarded-for'] || '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
  }

  try {
    // 1. Validate Request Payload
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.errors });
    }
    const { items, customerDetails } = parsed.data;

    // 2. Fetch True Prices from DB (Never trust frontend price)
    const db = getDb();
    const productIds = items.map(item => item.id);
    const dbProducts = await db.select().from(schema.products).where(inArray(schema.products.id, productIds));
    
    if (dbProducts.length !== items.length) {
       return res.status(400).json({ message: 'Invalid items in cart' });
    }

    // 3. Calculate exact subtotal
    let subtotal = 0;
    const enrichedItems = items.map(item => {
      const dbProd = dbProducts.find(p => p.id === item.id);
      if (dbProd.stock < item.qty) {
        throw new Error(`Insufficient stock for ${dbProd.name}`);
      }
      subtotal += dbProd.price * item.qty;
      return { ...item, price: dbProd.price, name: dbProd.name };
    });

    const discount = 0; // Implement promo logic here on backend if needed
    const freeShipping = subtotal >= 1999;
    const shippingFee = freeShipping ? 0 : 149;
    const tax = Math.round((subtotal - discount) * 0.05);
    const totalAmount = subtotal - discount + tax + shippingFee;

    // 4. Init Cashfree Order
    const appId = process.env.VITE_CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX';
    const baseUrl = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

    const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const response = await axios.post(
      `${baseUrl}/orders`,
      {
        order_amount: totalAmount,
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: `CUST_${Date.now()}`,
          customer_name: customerDetails.name,
          customer_email: customerDetails.email || 'guest@inzfyer.com',
          customer_phone: customerDetails.phone,
        }
      },
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

    // 5. Save Pending Order to Database securely
    await db.insert(schema.orders).values({
      orderId: orderId,
      customer: customerDetails,
      items: enrichedItems,
      subtotal,
      discount,
      shippingFee,
      tax,
      total: totalAmount,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      paymentSessionId: response.data.payment_session_id
    });

    return res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: orderId,
      verified_total: totalAmount
    });

  } catch (error) {
    console.error('Error in create-order:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to initiate checkout securely'
    });
  }
}
