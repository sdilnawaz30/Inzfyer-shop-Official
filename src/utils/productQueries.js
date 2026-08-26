import axios from 'axios';

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
    const res = await axios.get('/api/categories');
    return res.data?.data || [];
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
};

export const fetchStorefrontProducts = async (filters, page = 1, limit = 12) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (filters.categoryId && filters.categoryId !== 'All') {
      params.append('categoryId', filters.categoryId);
    }
    if (filters.searchQuery) {
      params.append('searchQuery', filters.searchQuery);
    }
    if (filters.priceLimit) {
      params.append('priceLimit', filters.priceLimit);
    }
    if (filters.inStockOnly) {
      params.append('inStockOnly', 'true');
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }

    const res = await axios.get(`/api/products?${params.toString()}`);
    
    return {
      products: (res.data?.data || []).map(mapProductData),
      totalCount: res.data?.count || 0
    };
  } catch (err) {
    console.error('Error fetching storefront products:', err);
    return { products: [], totalCount: 0 };
  }
};

export const fetchFeaturedProducts = async (limit = 4) => {
  try {
    const res = await axios.get(`/api/products?type=featured&limit=${limit}`);
    return (res.data?.data || []).map(mapProductData);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    return [];
  }
};

export const fetchRecentProducts = async (limit = 4) => {
  try {
    const res = await axios.get(`/api/products?type=recent&limit=${limit}`);
    return (res.data?.data || []).map(mapProductData);
  } catch (err) {
    console.error('Error fetching recent products:', err);
    return [];
  }
};

export const fetchRelatedProducts = async (categoryId, excludeId, limit = 4) => {
  try {
    const params = new URLSearchParams({
      type: 'related',
      limit: String(limit)
    });
    if (categoryId) params.append('categoryId', categoryId);
    if (excludeId) params.append('excludeId', excludeId);

    const res = await axios.get(`/api/products?${params.toString()}`);
    return (res.data?.data || []).map(mapProductData);
  } catch (err) {
    console.error('Error fetching related products:', err);
    return [];
  }
};

