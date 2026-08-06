import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { admin_session } = req.cookies;

  if (!admin_session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_please_change';
    jwt.verify(admin_session, jwtSecret);
  } catch (error) {
    return res.status(401).json({ message: 'Session expired' });
  }

  const { action, payload } = req.body;
  const db = getDb();

  try {
    if (action === 'updateStock') {
      await db.update(schema.products)
        .set({ stock: payload.stock })
        .where(eq(schema.products.id, payload.id));
    } else if (action === 'updateOrderStatus') {
      await db.update(schema.orders)
        .set({ orderStatus: payload.status })
        .where(eq(schema.orders.orderId, payload.orderId));
    } else if (action === 'deleteProduct') {
      await db.delete(schema.products).where(eq(schema.products.id, payload.id));
    } else if (action === 'saveProduct') {
      // Upsert
      await db.insert(schema.products).values(payload).onConflictDoUpdate({
        target: schema.products.id,
        set: payload
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Admin action error:', error);
    return res.status(500).json({ message: 'Action failed' });
  }
}
