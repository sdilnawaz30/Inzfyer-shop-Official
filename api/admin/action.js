import { z } from 'zod';
import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, and, ne, or, inArray, sql } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { enqueueNotification } from '../_utils/notifications.js';

// Setup admin Supabase client using Service Role to query profiles and verify user
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const updateStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  newStatus: z.string().min(1, "Status is required"),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 1. Authorize User (Every admin operation MUST verify token & admin role)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or invalid authorization header.' });
    }
    const token = authHeader.split(' ')[1];

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Verify Admin Role using authoritative Neon DB
    const db = getDb();
    const profile = await db.select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, user.id))
      .limit(1);

    if (profile.length === 0 || profile[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }

    // Determine Action & Payload from query or body
    let action = req.body?.action || req.query?.action;
    let payload = req.body?.payload;

    // Support direct body payloads from rewritten endpoints (e.g. /api/admin/products/validate or /api/admin/update-order-status)
    if (!payload && req.body && typeof req.body === 'object') {
      payload = req.body;
    }

    if (!action) {
      if (payload?.sku !== undefined || payload?.slug !== undefined) {
        action = 'validateSkuSlug';
      } else if (payload?.orderId && payload?.newStatus) {
        action = 'updateOrderStatus';
      }
    }

    // ==========================================
    // ACTION HANDLERS
    // ==========================================

    if (action === 'saveCategory') {
      const cat = payload?.category || payload || {};
      const id = payload?.id || cat?.id || null;
      const name = cat?.name ? String(cat.name).trim() : '';
      let slug = cat?.slug ? String(cat.slug).trim() : '';
      if (!slug && name) {
        slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      const isActive = cat?.is_active !== undefined ? Boolean(cat.is_active) : (cat?.isActive !== undefined ? Boolean(cat.isActive) : true);
      const imageUrl = cat?.imageUrl || cat?.image_url || null;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }

      if (!slug) {
        slug = `category-${Date.now()}`;
      }

      const categoryData = {
        name,
        slug,
        imageUrl,
        isActive,
        updatedAt: new Date()
      };

      let resultCategory = null;

      if (id) {
        const [updated] = await db.update(schema.categories)
          .set(categoryData)
          .where(eq(schema.categories.id, id))
          .returning();
        resultCategory = updated;
      } else {
        const [inserted] = await db.insert(schema.categories).values({
          ...categoryData,
          createdAt: new Date()
        }).returning();
        resultCategory = inserted;
      }
      return res.status(200).json({ success: true, category: resultCategory });
    } 
    
    else if (action === 'deleteCategory') {
      const categoryId = payload?.id || payload?.categoryId;
      if (!categoryId) {
        return res.status(400).json({ success: false, message: 'Category ID is required.' });
      }
      await db.delete(schema.categories).where(eq(schema.categories.id, categoryId));
      return res.status(200).json({ success: true });
    }

    else if (action === 'toggleCategoryActive') {
      const categoryId = payload?.id || payload?.categoryId;
      const isActive = payload?.isActive !== undefined ? payload.isActive : payload?.is_active;
      if (!categoryId) {
        return res.status(400).json({ success: false, message: 'Category ID is required.' });
      }
      await db.update(schema.categories)
        .set({ isActive: Boolean(isActive) })
        .where(eq(schema.categories.id, categoryId));
      return res.status(200).json({ success: true });
    }

    else if (action === 'saveProduct') {
      const { id, product, newImages, existingImages, imgsToDeleteIds, stockDiff } = payload;

      if (!product || typeof product !== 'object') {
        return res.status(400).json({ success: false, message: 'Product data is required.' });
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const rawCategoryId = product.category_id || product.categoryId;
      const categoryId = (rawCategoryId && uuidRegex.test(String(rawCategoryId).trim())) ? String(rawCategoryId).trim() : null;

      const productName = String(product.name || '').trim();
      let productSlug = String(product.slug || '').trim();
      let productSku = String(product.sku || '').trim();

      if (!productName) {
        return res.status(400).json({ success: false, message: 'Product name is required.' });
      }

      if (!productSlug) {
        productSlug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      if (!productSku) {
        productSku = `INZ-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const price = product.price !== undefined && product.price !== '' ? String(product.price) : '0.00';
      const salePrice = (product.sale_price !== undefined && product.sale_price !== '' && product.sale_price !== null) 
        ? String(product.sale_price) 
        : ((product.salePrice !== undefined && product.salePrice !== '' && product.salePrice !== null) ? String(product.salePrice) : null);
      
      const gstRate = (product.gst_rate !== undefined && product.gst_rate !== '' && product.gst_rate !== null) 
        ? String(product.gst_rate) 
        : ((product.gstRate !== undefined && product.gstRate !== '' && product.gstRate !== null) ? String(product.gstRate) : '18.00');

      const productData = {
        name: productName,
        slug: productSlug,
        sku: productSku,
        description: product.description || '',
        categoryId: categoryId,
        price: price,
        salePrice: salePrice,
        gstRate: gstRate,
        stock: parseInt(product.stock, 10) || 0,
        isActive: product.is_active !== undefined ? Boolean(product.is_active) : (product.isActive !== undefined ? Boolean(product.isActive) : true),
        featured: Boolean(product.featured),
        newArrival: product.new_arrival !== undefined ? Boolean(product.new_arrival) : (product.newArrival !== undefined ? Boolean(product.newArrival) : false),
        updatedAt: new Date()
      };

      let productId = id && uuidRegex.test(String(id).trim()) ? String(id).trim() : null;

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
        if (stockDiff !== undefined && Number(stockDiff) !== 0) {
          try {
            await tx.insert(schema.inventoryMovements).values({
              productId: productId,
              movementType: id ? 'MANUAL_ADJUSTMENT' : 'RESTOCK',
              quantity: Number(stockDiff) || 0,
              notes: 'Admin updated catalog',
              createdAt: new Date()
            });
          } catch (invErr) {
            console.warn("Inventory movement logging skipped:", invErr.message);
          }
        }

        // 3. Delete removed images from DB
        if (imgsToDeleteIds && Array.isArray(imgsToDeleteIds) && imgsToDeleteIds.length > 0) {
          const validImgIds = imgsToDeleteIds.filter(imgId => uuidRegex.test(String(imgId)));
          if (validImgIds.length > 0) {
            await tx.delete(schema.productImages).where(inArray(schema.productImages.id, validImgIds));
          }
        }

        // 4. Update existing images (sort_order, is_primary)
        if (existingImages && Array.isArray(existingImages) && existingImages.length > 0) {
          for (const img of existingImages) {
            if (img.id && uuidRegex.test(String(img.id))) {
              await tx.update(schema.productImages)
                .set({ 
                  sortOrder: Number(img.sort_order ?? img.sortOrder) || 0, 
                  isPrimary: Boolean(img.is_primary ?? img.isPrimary) 
                })
                .where(eq(schema.productImages.id, img.id));
            }
          }
        }

        // 5. Insert new images
        if (newImages && Array.isArray(newImages) && newImages.length > 0) {
          const imagesToInsert = newImages
            .map((img, idx) => ({
              productId: productId,
              imageUrl: String(img.image_url || img.imageUrl || '').trim(),
              sortOrder: (img.sort_order !== undefined || img.sortOrder !== undefined) ? Number(img.sort_order ?? img.sortOrder) : idx,
              isPrimary: (img.is_primary !== undefined || img.isPrimary !== undefined) ? Boolean(img.is_primary ?? img.isPrimary) : (idx === 0),
              createdAt: new Date()
            }))
            .filter(img => Boolean(img.imageUrl));

          if (imagesToInsert.length > 0) {
            await tx.insert(schema.productImages).values(imagesToInsert);
          }
        }
      });

      return res.status(200).json({ success: true, productId });
    }

    else if (action === 'deleteProduct') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const productId = payload?.id || payload?.productId;
      if (!productId || !uuidRegex.test(String(productId))) {
        return res.status(400).json({ success: false, message: 'Valid Product ID is required.' });
      }
      await db.delete(schema.products).where(eq(schema.products.id, productId));
      return res.status(200).json({ success: true });
    }

    else if (action === 'toggleProductActive') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const productId = payload?.id || payload?.productId;
      const isActive = payload?.isActive !== undefined ? payload.isActive : payload?.is_active;
      if (!productId || !uuidRegex.test(String(productId))) {
        return res.status(400).json({ success: false, message: 'Valid Product ID is required.' });
      }
      await db.update(schema.products)
        .set({ isActive: Boolean(isActive) })
        .where(eq(schema.products.id, productId));
      return res.status(200).json({ success: true });
    }

    else if (action === 'updateStock') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const productId = payload?.id || payload?.productId;
      if (!productId || !uuidRegex.test(String(productId))) {
        return res.status(400).json({ success: false, message: 'Valid Product ID is required.' });
      }
      await db.update(schema.products)
        .set({ stock: parseInt(payload.stock, 10) || 0 })
        .where(eq(schema.products.id, productId));
      return res.status(200).json({ success: true });
    }
    
    else if (action === 'getOrderItems') {
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, payload.orderId));
      return res.status(200).json({ success: true, data: items });
    }

    // Consolidated: Validate SKU & Slug uniqueness
    else if (action === 'validateSkuSlug' || action === 'validateProduct') {
      const { sku, slug, excludeProductId } = payload;
      let skuAvailable = true;
      let slugAvailable = true;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (sku) {
        let conditions = [eq(schema.products.sku, String(sku).trim())];
        if (excludeProductId && uuidRegex.test(String(excludeProductId).trim())) {
          conditions.push(ne(schema.products.id, String(excludeProductId).trim()));
        }
        const existingSku = await db.select({ id: schema.products.id }).from(schema.products).where(and(...conditions)).limit(1);
        if (existingSku.length > 0) skuAvailable = false;
      }

      if (slug) {
        let conditions = [eq(schema.products.slug, String(slug).trim())];
        if (excludeProductId && uuidRegex.test(String(excludeProductId).trim())) {
          conditions.push(ne(schema.products.id, String(excludeProductId).trim()));
        }
        const existingSlug = await db.select({ id: schema.products.id }).from(schema.products).where(and(...conditions)).limit(1);
        if (existingSlug.length > 0) slugAvailable = false;
      }

      return res.status(200).json({
        success: true,
        skuAvailable,
        slugAvailable
      });
    }

    // Consolidated: Update Order Status with Stock Restoration & Notification Enqueuing
    else if (action === 'updateOrderStatus') {
      const parsed = updateStatusSchema.safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid input', errors: parsed.error.errors });
      }
      const { orderId, newStatus } = parsed.data;

      const [existingOrder] = await db.select().from(schema.orders).where(
        or(eq(schema.orders.orderNumber, orderId), eq(schema.orders.id, orderId))
      ).limit(1);

      if (!existingOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const currentStatus = existingOrder.orderStatus;
      const isCurrentlyCancelled = currentStatus === 'Cancelled' || currentStatus === 'CANCELLED' || currentStatus === 'Refunded' || currentStatus === 'REFUNDED';
      const isMovingToCancelled = newStatus.toUpperCase() === 'CANCELLED' || newStatus.toUpperCase() === 'REFUNDED';

      await db.transaction(async (tx) => {
        // Update the status
        await tx.update(schema.orders)
          .set({ orderStatus: newStatus })
          .where(eq(schema.orders.id, existingOrder.id));

        // Handle Stock Restoration if moving to Cancelled/Refunded for the first time
        if (!isCurrentlyCancelled && isMovingToCancelled) {
          const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, existingOrder.id));
          
          if (items.length > 0) {
            for (const item of items) {
              await tx.update(schema.products)
                .set({ stock: sql`${schema.products.stock} + ${item.quantity}` })
                .where(eq(schema.products.id, item.productId));
            }

            try {
              const inventoryMovementsToInsert = items.map(item => ({
                productId: item.productId,
                movementType: newStatus.toUpperCase(),
                quantity: item.quantity,
                referenceId: existingOrder.orderNumber,
                notes: `Order ${newStatus} by Admin`
              }));
              await tx.insert(schema.inventoryMovements).values(inventoryMovementsToInsert);
            } catch (invErr) {
              console.warn("Stock restoration movement logging skipped:", invErr.message);
            }
          }
        }
        
        // Enqueue notification based on new status
        const notificationType = newStatus.toUpperCase() === 'REFUNDED' ? 'REFUND_COMPLETED' : `ORDER_${newStatus.toUpperCase()}`;
        const contact = existingOrder.email || existingOrder.phone;
        if (['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(newStatus)) {
          await enqueueNotification(tx, existingOrder.id, contact, notificationType);
        }
      });

      return res.status(200).json({ success: true, message: `Order marked as ${newStatus}` });
    }
    
    else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

  } catch (error) {
    console.error('Admin action error:', error);
    
    // Provide specific error messages for unique constraint violations
    if (error.code === '23505' || error.message?.includes('duplicate key value')) {
      return res.status(400).json({ success: false, message: 'A record with this unique identifier (like SKU or Slug) already exists.' });
    }

    // Foreign key violation
    if (error.code === '23503' || error.message?.includes('violates foreign key constraint')) {
      return res.status(400).json({ success: false, message: 'Referenced record (such as Category) does not exist in database.' });
    }

    // Invalid UUID or data type syntax
    if (error.code === '22P02' || error.message?.includes('invalid input syntax for type uuid')) {
      return res.status(400).json({ success: false, message: 'Invalid identifier format provided.' });
    }
    
    return res.status(500).json({ success: false, message: 'Action failed: ' + error.message });
  }
}
