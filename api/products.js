import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq, and, or, ilike, lte, gt, desc, asc, ne, inArray } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const db = getDb();

    // 1. CONSOLIDATED: Categories Query (Rewritten from /api/categories)
    const isCategories =
      req.query?.resource === 'categories' ||
      req.query?.categories === 'true' ||
      req.url?.includes('categories') ||
      req.headers?.['x-matched-path']?.includes('categories');

    if (isCategories) {
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
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

      return res.status(200).json({
        success: true,
        data: categories
      });
    }

    // 2. Products Query (Search, Filter, Sort, Pagination)
    const {
      slug,
      type,
      categoryId,
      searchQuery,
      priceLimit,
      inStockOnly,
      sortBy,
      page = 1,
      limit = 12,
      excludeId
    } = req.query;

    // Base condition: only active products
    const conditions = [eq(schema.products.isActive, true)];

    if (slug) {
      conditions.push(eq(schema.products.slug, String(slug)));
    }

    if (categoryId && categoryId !== 'All') {
      conditions.push(eq(schema.products.categoryId, String(categoryId)));
    }

    if (excludeId) {
      conditions.push(ne(schema.products.id, String(excludeId)));
    }

    if (searchQuery) {
      const searchStr = `%${String(searchQuery)}%`;
      conditions.push(
        or(
          ilike(schema.products.name, searchStr),
          ilike(schema.products.description, searchStr)
        )
      );
    }

    if (priceLimit) {
      conditions.push(lte(schema.products.price, String(priceLimit)));
    }

    if (inStockOnly === 'true') {
      conditions.push(gt(schema.products.stock, 0));
    }

    if (type === 'featured') {
      conditions.push(eq(schema.products.featured, true));
    }

    // Determine sorting
    let orderByCondition = [desc(schema.products.createdAt)]; // default
    if (sortBy === 'price-low') {
      orderByCondition = [asc(schema.products.price)];
    } else if (sortBy === 'price-high') {
      orderByCondition = [desc(schema.products.price)];
    } else if (sortBy === 'rating') {
      orderByCondition = [desc(schema.products.rating)];
    } else if (sortBy === 'popular' || type === 'featured' || type === 'recent' || type === 'related') {
      // Custom sorts for these types
      if (type === 'recent') {
         orderByCondition = [desc(schema.products.createdAt)];
      } else {
         orderByCondition = [desc(schema.products.featured), desc(schema.products.createdAt)];
      }
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const offset = (pageNum - 1) * limitNum;

    // Fetch Products
    let productsQuery = db.select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      price: schema.products.price,
      sale_price: schema.products.salePrice, // mapped to match supabase 'sale_price' alias expectation
      stock: schema.products.stock,
      rating: schema.products.rating,
      new_arrival: schema.products.newArrival,
      featured: schema.products.featured,
      created_at: schema.products.createdAt,
      categoryId: schema.products.categoryId
    })
    .from(schema.products)
    .where(and(...conditions))
    .orderBy(...orderByCondition);

    // Only paginate if not fetching by a specific slug
    if (!slug) {
      productsQuery = productsQuery.limit(limitNum).offset(offset);
    } else {
      productsQuery = productsQuery.limit(1);
    }

    const fetchedProducts = await productsQuery;

    if (fetchedProducts.length === 0) {
      return res.status(200).json({ success: true, data: [], count: 0 });
    }

    // Get categories mapping
    const categoryIds = [...new Set(fetchedProducts.map(p => p.categoryId).filter(Boolean))];
    let categoriesMap = {};
    if (categoryIds.length > 0) {
      const cats = await db.select({ id: schema.categories.id, name: schema.categories.name })
        .from(schema.categories)
        .where(inArray(schema.categories.id, categoryIds));
      cats.forEach(c => categoriesMap[c.id] = c.name);
    }

    // Get images
    const productIds = fetchedProducts.map(p => p.id);
    const imgs = await db.select({
      productId: schema.productImages.productId,
      image_url: schema.productImages.imageUrl,
      is_primary: schema.productImages.isPrimary,
      sort_order: schema.productImages.sortOrder
    })
    .from(schema.productImages)
    .where(inArray(schema.productImages.productId, productIds))
    .orderBy(asc(schema.productImages.sortOrder));

    const imagesByProduct = {};
    imgs.forEach(img => {
      if (!imagesByProduct[img.productId]) imagesByProduct[img.productId] = [];
      imagesByProduct[img.productId].push({ image_url: img.image_url, is_primary: img.is_primary });
    });

    // Assemble final structure
    const data = fetchedProducts.map(p => {
      // Remove internal categoryId
      const { categoryId, ...rest } = p;
      return {
        ...rest,
        category: { name: categoriesMap[categoryId] || 'Uncategorized' },
        images: imagesByProduct[p.id] || []
      };
    });

    // Count query for pagination (only if doing a list fetch)
    let totalCount = data.length;
    if (!slug && !type) {
        // Simplified count query
        const countQuery = await db.select({ id: schema.products.id }).from(schema.products).where(and(...conditions));
        totalCount = countQuery.length;
    }

    // Set cache headers for public catalog (cache for 60s, stale-while-revalidate for 5 mins)
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return res.status(200).json({
      success: true,
      data: data,
      count: totalCount
    });

  } catch (error) {
    console.error('Error in /api/products:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
