import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// Setup admin Supabase client using Service Role to query profiles and verify user
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    // Verify Admin Role using Drizzle
    const db = getDb();
    const profile = await db.select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, user.id))
      .limit(1);

    if (profile.length === 0 || profile[0].role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    
    // Fetch all necessary data for the admin dashboard
    const allProducts = await db.select().from(schema.products);
    const allCategories = await db.select().from(schema.categories);
    const allOrders = await db.select().from(schema.orders);
    const allImages = await db.select().from(schema.productImages);
    
    // Attach images to products for the frontend to digest easily
    const productsWithImages = allProducts.map(p => ({
        ...p,
        images: allImages.filter(img => img.productId === p.id)
    }));

    // Fetch order items (useful for PosView and OrderDetailsModal without needing a separate request)
    const allOrderItems = await db.select().from(schema.orderItems);

    return res.status(200).json({
      success: true,
      products: productsWithImages,
      categories: allCategories,
      orders: allOrders,
      orderItems: allOrderItems
    });
    
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
