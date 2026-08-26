import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// Setup admin Supabase client using Service Role to query profiles and verify user
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    const { action, payload } = req.body;

    // ==========================================
    // ACTION HANDLERS
    // ==========================================

    if (action === 'saveCategory') {
      const { id, name, slug, is_active } = payload;
      
      const categoryData = {
        name,
        slug,
        isActive: is_active,
        updatedAt: new Date()
      };

      if (id) {
        await db.update(schema.categories).set(categoryData).where(eq(schema.categories.id, id));
      } else {
        await db.insert(schema.categories).values({
          ...categoryData,
          createdAt: new Date()
        });
      }
      return res.status(200).json({ success: true });
    } 
    
    else if (action === 'deleteCategory') {
      await db.delete(schema.categories).where(eq(schema.categories.id, payload.id));
      return res.status(200).json({ success: true });
    }

    else if (action === 'toggleCategoryActive') {
      await db.update(schema.categories)
        .set({ isActive: payload.isActive })
        .where(eq(schema.categories.id, payload.id));
      return res.status(200).json({ success: true });
    }

    else if (action === 'saveProduct') {
      const { id, product, newImages, existingImages, imgsToDeleteIds, stockDiff } = payload;

      const productData = {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        categoryId: product.category_id,
        price: product.price,
        salePrice: product.sale_price,
        gstRate: product.gst_rate,
        stock: product.stock,
        isActive: product.is_active,
        featured: product.featured,
        newArrival: product.new_arrival,
        updatedAt: new Date()
      };

      let productId = id;

      await db.transaction(async (tx) => {
        // 1. Upsert Product
        if (productId) {
          await tx.update(schema.products).set(productData).where(eq(schema.products.id, productId));
        } else {
          const [inserted] = await tx.insert(schema.products).values({
            ...productData,
            createdAt: new Date()
          }).returning({ id: schema.products.id });
          productId = inserted.id;
        }

        // 2. Inventory movement
        if (stockDiff !== 0) {
          await tx.insert(schema.inventoryMovements).values({
            productId: productId,
            movementType: id ? 'MANUAL_ADJUSTMENT' : 'RESTOCK',
            quantity: stockDiff,
            notes: 'Admin updated catalog',
            createdAt: new Date()
          });
        }

        // 3. Delete removed images from DB
        if (imgsToDeleteIds && imgsToDeleteIds.length > 0) {
          await tx.delete(schema.productImages).where(inArray(schema.productImages.id, imgsToDeleteIds));
        }

        // 4. Update existing images (sort_order, is_primary)
        if (existingImages && existingImages.length > 0) {
          for (const img of existingImages) {
            await tx.update(schema.productImages)
              .set({ sortOrder: img.sort_order, isPrimary: img.is_primary })
              .where(eq(schema.productImages.id, img.id));
          }
        }

        // 5. Insert new images
        if (newImages && newImages.length > 0) {
          const imagesToInsert = newImages.map(img => ({
            productId: productId,
            imageUrl: img.image_url,
            sortOrder: img.sort_order,
            isPrimary: img.is_primary,
            createdAt: new Date()
          }));
          await tx.insert(schema.productImages).values(imagesToInsert);
        }
      });

      return res.status(200).json({ success: true, productId });
    }

    else if (action === 'deleteProduct') {
      await db.delete(schema.products).where(eq(schema.products.id, payload.id));
      return res.status(200).json({ success: true });
    }

    else if (action === 'toggleProductActive') {
      await db.update(schema.products)
        .set({ isActive: payload.isActive })
        .where(eq(schema.products.id, payload.id));
      return res.status(200).json({ success: true });
    }

    else if (action === 'updateStock') {
      // Used from PosView perhaps
      await db.update(schema.products)
        .set({ stock: payload.stock })
        .where(eq(schema.products.id, payload.id));
      return res.status(200).json({ success: true });
    }
    
    else if (action === 'getOrderItems') {
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, payload.orderId));
      return res.status(200).json({ success: true, data: items });
    }
    
    else {
      return res.status(400).json({ message: 'Invalid action' });
    }

  } catch (error) {
    console.error('Admin action error:', error);
    
    // Provide specific error messages for unique constraint violations
    if (error.code === '23505' || error.message?.includes('duplicate key value')) {
        return res.status(400).json({ success: false, message: 'A record with this unique identifier (like SKU or Slug) already exists.' });
    }
    
    return res.status(500).json({ success: false, message: 'Action failed: ' + error.message });
  }
}
