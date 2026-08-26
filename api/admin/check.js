import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// We must use the Supabase Auth to verify the JWT provided by the client.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Do NOT cache auth check routes
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];

    // 2. Validate token with Supabase Auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('Auth check failed:', authError?.message);
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    // 3. Check the role from the authoritative Neon DB using Drizzle
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

    const is_admin = profile[0].role === 'admin';
    
    // If we want this endpoint to strictly enforce admin (as the name /api/admin/check implies),
    // we can return 403 here for non-admins. But usually a "check" endpoint returns the status.
    // We'll return 200 with the role, so the frontend can route accordingly.
    
    // Do NOT return the full profile or any tokens.
    return res.status(200).json({
      success: true,
      data: {
        is_admin: is_admin,
        role: profile[0].role
      }
    });

  } catch (error) {
    console.error('Error in /api/admin/check:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
