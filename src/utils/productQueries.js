import { supabase } from '../lib/supabase';

// Helper to map database row to frontend component expected format
const mapProductData = (p) => {
  const primaryImage = p.images?.find(img => img.is_primary) || p.images?.[0];
  const price = p.sale_price ? Number(p.sale_price) : Number(p.price);
  const originalPrice = p.sale_price ? Number(p.price) : null;

  return {
    ...p,
    price,
    originalPrice,
    image: primaryImage?.image_url || 'https://images.unsplash.com/photo-1558060370-d644479be6f7?auto=format&fit=crop&w=400&q=80',
    category: p.category?.name || 'Uncategorized',
    reviewsCount: 0,
    rating: Number(p.rating) || 0,
    tag: p.new_arrival ? 'New' : null,
  };
};

export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
};

export const fetchStorefrontProducts = async (filters, page = 1, limit = 12) => {
  try {
    let query = supabase
      .from('products')
      .select('id, name, slug, price, sale_price, stock, rating, new_arrival, featured, created_at, category:categories(name), images:product_images(image_url, is_primary)', { count: 'exact' })
      .eq('is_active', true);

    if (filters.categoryId && filters.categoryId !== 'All') {
      query = query.eq('category_id', filters.categoryId);
    }
    
    if (filters.searchQuery) {
      // Search in name or description
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    if (filters.priceLimit) {
      query = query.lte('price', filters.priceLimit);
    }

    if (filters.inStockOnly) {
      query = query.gt('stock', 0);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'popular':
      default:
        // Assuming popular means more stock or featured for now
        query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
        break;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      products: (data || []).map(mapProductData),
      totalCount: count
    };
  } catch (err) {
    console.error('Error fetching storefront products:', err);
    return { products: [], totalCount: 0 };
  }
};

export const fetchFeaturedProducts = async (limit = 4) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, sale_price, stock, rating, new_arrival, featured, created_at, category:categories(name), images:product_images(image_url, is_primary)')
      .eq('is_active', true)
      .eq('featured', true)
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapProductData);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    return [];
  }
};

export const fetchRecentProducts = async (limit = 4) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, sale_price, stock, rating, new_arrival, featured, created_at, category:categories(name), images:product_images(image_url, is_primary)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapProductData);
  } catch (err) {
    console.error('Error fetching recent products:', err);
    return [];
  }
};

export const fetchRelatedProducts = async (categoryId, excludeId, limit = 4) => {
  try {
    let query = supabase
      .from('products')
      .select('id, name, slug, price, sale_price, stock, rating, new_arrival, featured, created_at, category:categories(name), images:product_images(image_url, is_primary)')
      .eq('is_active', true)
      .limit(limit);
      
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapProductData);
  } catch (err) {
    console.error('Error fetching related products:', err);
    return [];
  }
};
