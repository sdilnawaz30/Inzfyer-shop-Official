import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const admin_session = req.cookies?.admin_session;

  if (!admin_session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_please_change';
    jwt.verify(admin_session, jwtSecret);
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or invalid' });
  }

  try {
    const db = getDb();
    const allProducts = await db.select().from(schema.products);
    const allOrders = await db.select().from(schema.orders);

    return res.status(200).json({
      success: true,
      products: allProducts,
      orders: allOrders
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
