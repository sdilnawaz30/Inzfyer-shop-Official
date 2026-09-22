import { z } from 'zod';
import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, and, ne, or, inArray, sql } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { enqueueNotification } from '../_utils/notifications.js';
import crypto from 'crypto';

// Setup admin Supabase client using Service Role to query profiles and verify user
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const updateStatusSchema = z.object({
  orderId: z.union([z.string(), z.number()], "Order ID is required"),
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

      console.log('[PRODUCT_CREATE] STEP 1 payload validated');

      if (!categoryId || !uuidRegex.test(categoryId)) {
        return res.status(400).json({ success: false, message: 'Selected category is invalid. Please select a valid category.' });
      }

      console.log('[PRODUCT_CREATE] STEP 2 category lookup started');
      const existingCategory = await db.select({ id: schema.categories.id }).from(schema.categories).where(eq(schema.categories.id, categoryId)).limit(1);
      if (existingCategory.length === 0) {
        return res.status(400).json({ success: false, message: 'Selected category is invalid. Please select a valid category.' });
      }
      console.log('[PRODUCT_CREATE] STEP 2 category resolved');

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

      let productId = id && uuidRegex.test(String(id).trim()) ? String(id).trim() : null;

      // 1. Check SKU Uniqueness
      if (productSku) {
        const existingSku = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.sku, productSku)).limit(1);
        if (existingSku.length > 0 && existingSku[0].id !== productId) {
          return res.status(400).json({ success: false, message: `This SKU '${productSku}' already exists. Please enter a different SKU.` });
        }
      }

      // 2. Resolve Slug Uniqueness
      let finalSlug = productSlug;
      let slugCounter = 0;
      while (true) {
        const existingSlug = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.slug, finalSlug)).limit(1);
        if (existingSlug.length > 0 && existingSlug[0].id !== productId) {
          slugCounter++;
          finalSlug = `${productSlug}-${slugCounter}`;
        } else {
          break;
        }
      }
      productSlug = finalSlug;

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
        description: product.description || null,
        categoryId: categoryId || null,
        price: price,
        salePrice: salePrice,
        gstRate: gstRate,
        stock: parseInt(product.stock, 10) || 0,
        isActive: product.is_active !== undefined ? Boolean(product.is_active) : (product.isActive !== undefined ? Boolean(product.isActive) : true),
        featured: Boolean(product.featured),
        newArrival: product.new_arrival !== undefined ? Boolean(product.new_arrival) : (product.newArrival !== undefined ? Boolean(product.newArrival) : false),
        updatedAt: new Date()
      };

      // Diagnostic object for product insert
      console.log('[PRODUCT_CREATE] CATEGORY_ID: ' + productData.categoryId);
      console.log('[PRODUCT_CREATE] IS_ACTIVE: ' + productData.isActive);
      console.log('[PRODUCT_CREATE] STEP 3 product payload prepared:', {
        id: productId || 'Will generate',
        name: productData.name,
        slug: productData.slug,
        sku: productData.sku,
        description: productData.description,
        categoryId: productData.categoryId,
        price: productData.price,
        salePrice: productData.salePrice,
        gstRate: productData.gstRate,
        stock: productData.stock,
        rating: 0,
        featured: productData.featured,
        newArrival: productData.newArrival,
        isActive: productData.isActive,
      });

      await db.transaction(async (tx) => {
        // 1. Upsert Product
        console.log('[PRODUCT_CREATE] STEP 4 product insert started');
        if (productId) {
          await tx.update(schema.products).set(productData).where(eq(schema.products.id, productId));
        } else {
          productId = crypto.randomUUID();
          const [inserted] = await tx.insert(schema.products).values({
            id: productId,
            ...productData,
            createdAt: new Date()
          }).returning({ id: schema.products.id });
          productId = inserted.id;
        }
        console.log('[PRODUCT_CREATE] STEP 5 product inserted');

        // 2. Inventory movement
        console.log('[PRODUCT_CREATE] STEP 6 inventory insert started');
        if (stockDiff !== undefined && Number(stockDiff) !== 0) {
          await tx.insert(schema.inventoryMovements).values({
            id: crypto.randomUUID(),
            productId: productId,
            movementType: id ? 'MANUAL_ADJUSTMENT' : 'RESTOCK',
            quantity: Number(stockDiff) || 0,
            notes: 'Admin updated catalog',
            createdAt: new Date()
          });
        }
        console.log('[PRODUCT_CREATE] STEP 7 inventory inserted');

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
        console.log('[PRODUCT_CREATE] STEP 8 images insert started');
        if (newImages && Array.isArray(newImages) && newImages.length > 0) {
          const imagesToInsert = newImages
            .map((img, idx) => {
              const url = String(img.image_url || img.imageUrl || '').trim();
              console.log('[PRODUCT_CREATE] IMAGE_URL: ' + url);
              console.log('[PRODUCT_CREATE] IMAGE_PATH: ' + url.split('/').slice(-2).join('/'));
              return {
                id: crypto.randomUUID(),
                productId: productId,
                imageUrl: url,
                sortOrder: (img.sort_order !== undefined || img.sortOrder !== undefined) ? Number(img.sort_order ?? img.sortOrder) : idx,
                isPrimary: (img.is_primary !== undefined || img.isPrimary !== undefined) ? Boolean(img.is_primary ?? img.isPrimary) : (idx === 0),
                createdAt: new Date()
              };
            })
            .filter(img => Boolean(img.imageUrl) && img.imageUrl !== 'undefined' && img.imageUrl !== 'null');

          if (imagesToInsert.length > 0) {
            await tx.insert(schema.productImages).values(imagesToInsert);
          }
        } else {
          console.log('[PRODUCT_CREATE] STEP 8 images insert skipped');
        }
        
        console.log('[PRODUCT_CREATE] STEP 9 transaction committed');
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

    else if (action === 'validateCategorySlug') {
      const { slug, excludeCategoryId } = payload;
      let slugAvailable = true;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (slug) {
        let conditions = [eq(schema.categories.slug, String(slug).trim())];
        if (excludeCategoryId && uuidRegex.test(String(excludeCategoryId).trim())) {
          conditions.push(ne(schema.categories.id, String(excludeCategoryId).trim()));
        }
        const existingSlug = await db.select({ id: schema.categories.id }).from(schema.categories).where(and(...conditions)).limit(1);
        if (existingSlug.length > 0) slugAvailable = false;
      }

      return res.status(200).json({ success: true, slugAvailable });
    }

    // Consolidated: Update Order Status with Stock Restoration & Notification Enqueuing
    else if (action === 'updateOrderStatus') {
      const parsed = updateStatusSchema.safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid input', errors: parsed.error.errors });
      }
      const { orderId, newStatus } = parsed.data;

      const orderIdStr = String(orderId);
      const orderIdNum = Number(orderId);

      const conditions = [eq(schema.orders.orderNumber, orderIdStr)];
      if (!isNaN(orderIdNum)) {
        conditions.push(eq(schema.orders.id, orderIdNum));
      }

      const [existingOrder] = await db.select().from(schema.orders).where(
        or(...conditions)
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
    
    else if (action === 'validateSkuSlug') {
      const { sku, slug, excludeProductId } = payload || {};
      let skuAvailable = true;
      let slugAvailable = true;

      if (sku) {
        const query = db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.sku, sku)).limit(1);
        const existing = await query;
        if (existing.length > 0 && existing[0].id !== excludeProductId) {
          skuAvailable = false;
        }
      }

      if (slug) {
        const query = db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.slug, slug)).limit(1);
        const existing = await query;
        if (existing.length > 0 && existing[0].id !== excludeProductId) {
          slugAvailable = false;
        }
      }

      return res.status(200).json({ success: true, skuAvailable, slugAvailable });
    }
    
    else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

  } catch (error) {
    let pgError = error;
    while (pgError && (pgError.cause || pgError.originalError)) {
      pgError = pgError.cause || pgError.originalError;
    }

    let failedAt = 'DATABASE OPERATION';
    if (error.message && error.message.includes('inventoryMovements')) {
      failedAt = 'INVENTORY INSERT';
    } else if (error.message && error.message.includes('productImages')) {
      failedAt = 'IMAGE INSERT';
    } else if (error.message && error.message.includes('products')) {
      failedAt = 'PRODUCTS INSERT';
    }

    console.error(`[PRODUCT_CREATE] FAILED AT: ${failedAt}`);
    console.error(JSON.stringify({
      name: pgError?.name,
      message: pgError?.message,
      code: pgError?.code,
      detail: pgError?.detail,
      hint: pgError?.hint,
      constraint: pgError?.constraint,
      table: pgError?.table,
      column: pgError?.column
    }, null, 2));

    // Specific error messages
    if (pgError?.code === '23505' || pgError?.message?.includes('duplicate key value')) {
      return res.status(400).json({ success: false, message: 'This SKU already exists. Please enter a different SKU.' });
    }
    if (pgError?.code === '23503' || pgError?.message?.includes('violates foreign key constraint')) {
      return res.status(400).json({ success: false, message: 'Selected category is invalid. Please select a valid category.' });
    }
    if (pgError?.code === '23502' || pgError?.message?.includes('null value in column')) {
      const missingCol = pgError.column ? ` (${pgError.column})` : '';
      return res.status(400).json({ success: false, message: `Product information is incomplete: ${missingCol}.` });
    }
    if (pgError?.code === '22P02' || pgError?.message?.includes('invalid input syntax')) {
      return res.status(400).json({ success: false, message: 'One of the product values has an invalid format.' });
    }
    if (pgError?.code === '25P02' || (pgError?.message && pgError.message.includes('transaction is aborted'))) {
      return res.status(500).json({ success: false, message: 'Product could not be saved because inventory recording failed.' });
    }
    
    return res.status(500).json({ success: false, message: 'Unable to save product. Please try again.' });
  }
}
