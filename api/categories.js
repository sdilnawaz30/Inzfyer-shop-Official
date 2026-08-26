import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq, asc } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const db = getDb();
    
    // Fetch only active categories and only necessary public fields
    const categories = await db.select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
      imageUrl: schema.categories.imageUrl
    })
    .from(schema.categories)
    .where(eq(schema.categories.isActive, true))
    .orderBy(asc(schema.categories.name));
    
    // Set cache headers for categories (cache for 1 hour, stale-while-revalidate for 1 day)
    // Categories change rarely
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json({ 
      success: true, 
      data: categories 
    });

  } catch (error) {
    console.error('Error in /api/categories:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
