import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  const db = getDb();

  if (req.method === 'POST') {
    try {
      // 1. Authorize Admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
      }
      const token = authHeader.split(' ')[1];

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
      }

      const profile = await db.select({ role: schema.profiles.role })
        .from(schema.profiles)
        .where(eq(schema.profiles.id, user.id))
        .limit(1);

      if (profile.length === 0 || profile[0].role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
      }

      // 2. Validate & Update Settings
      const { tnRate, otherRate, freeThreshold } = req.body;
      
      if (tnRate === undefined || otherRate === undefined || freeThreshold === undefined) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
      }
  
      const current = await db.select().from(schema.shippingSettings).limit(1);
      
      if (current.length > 0) {
        await db.update(schema.shippingSettings)
          .set({ 
            tnRate: String(Number(tnRate)), 
            otherRate: String(Number(otherRate)), 
            freeThreshold: String(Number(freeThreshold)) 
          })
          .where(eq(schema.shippingSettings.id, current[0].id));
      } else {
        await db.insert(schema.shippingSettings).values({
          tnRate: String(Number(tnRate)),
          otherRate: String(Number(otherRate)),
          freeThreshold: String(Number(freeThreshold))
        });
      }
  
      return res.status(200).json({ success: true, message: 'Shipping settings updated successfully' });
    } catch (error) {
      console.error('Error updating shipping settings:', error);
      return res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
  }

  // GET request (public)
  try {
    const settings = await db.select().from(schema.shippingSettings).limit(1);
    
    if (settings && settings.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          tnRate: Number(settings[0].tnRate),
          otherRate: Number(settings[0].otherRate),
          freeThreshold: Number(settings[0].freeThreshold)
        }
      });
    }
    
    // Default fallback
    return res.status(200).json({
      success: true,
      data: { tnRate: 55, otherRate: 85, freeThreshold: 1000 }
    });
  } catch (error) {
    console.error('Error fetching shipping config:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch config' });
  }
}
