import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase client to verify JWT and user identity
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 1. Authorize User
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid authorization header' });
    }
    const token = authHeader.split(' ')[1];

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    // 2. Fetch authoritative profile & role from Neon DB
    const db = getDb();
    const profile = await db.select({
      id: schema.profiles.id,
      role: schema.profiles.role,
      email: schema.profiles.email
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, user.id))
    .limit(1);

    if (profile.length === 0) {
      return res.status(403).json({ success: false, message: 'Forbidden: Profile not found in application database' });
    }

    // 3. CONSOLIDATED: Auth Check Only (Rewritten from /api/admin/check)
    if (req.query.checkOnly === 'true' || req.query.check === 'true') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return res.status(200).json({
        success: true,
        data: {
          is_admin: profile[0].role === 'admin',
          role: profile[0].role
        }
      });
    }

    // 4. Admin Dashboard Data Fetch (Strictly requires admin role)
    if (profile[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
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

    // Fetch order items (for PosView and OrderDetailsModal)
    const allOrderItems = await db.select().from(schema.orderItems);

    return res.status(200).json({
      success: true,
      products: productsWithImages,
      categories: allCategories,
      orders: allOrders,
      orderItems: allOrderItems
    });
    
  } catch (error) {
    console.error('Error in /api/admin/data:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
