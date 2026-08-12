import React, { useState, useEffect } from 'react';
import { Heart, Package, Search, ShoppingBag, SlidersHorizontal, Star, X, Loader2 } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';
import { fetchCategories, fetchStorefrontProducts } from '../utils/productQueries';

const ShopPage = ({
  onAddToCart, 
  onToggleWishlist, 
  wishlist, 
  onSelectProduct,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceLimit, setPriceLimit] = useState(5000);
  const [sortBy, setSortBy] = useState('popular');
  const [onlyInStock, setOnlyInStock] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounce search query to avoid too many DB calls
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await fetchCategories();
      setCategories([{ id: 'All', name: 'All' }, ...cats]);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const categoryId = selectedCategory === 'All' ? null : categories.find(c => c.name === selectedCategory)?.id;
      
      const { products: data, totalCount: count } = await fetchStorefrontProducts({
        categoryId,
        searchQuery: debouncedSearch,
        priceLimit,
        inStockOnly: onlyInStock,
        sortBy
      }, 1, 12);
      
      setProducts(data);
      setTotalCount(count);
      setPage(1);
      setIsLoading(false);
    };

    if (categories.length > 0) {
      loadProducts();
    }
  }, [debouncedSearch, selectedCategory, priceLimit, onlyInStock, sortBy, categories]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const categoryId = selectedCategory === 'All' ? null : categories.find(c => c.name === selectedCategory)?.id;
    
    const { products: data } = await fetchStorefrontProducts({
      categoryId,
      searchQuery: debouncedSearch,
      priceLimit,
      inStockOnly: onlyInStock,
      sortBy
    }, nextPage, 12);
    
    setProducts(prev => [...prev, ...data]);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="brand-font" style={{ fontSize: '2.8rem', color: '#1f2937', marginBottom: '0.5rem' }}>
          Explore Our <span style={{ color: '#db2777' }}>Boutique Shop</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Browse our curated catalog of soft plushies, candles, gift boxes, and artisanal keepsakes.
        </p>
      </div>

      {/* Main Grid with Filter Bar & Products */}
      <div className="shop-layout">
        
        {/* Mobile Filters Toggle Button */}
        <div className="mobile-only" style={{ marginBottom: '1rem' }}>
          <button 
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={18} />
              {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            </div>
            {isMobileFiltersOpen ? <X size={18} /> : <span>+</span>}
          </button>
        </div>

        {/* Filters Sidebar */}
        <div className={`glass glass-card filter-sidebar ${isMobileFiltersOpen ? 'open' : ''}`} style={{ background: '#ffffff', position: 'sticky', top: '100px' }}>
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #fce7f3', paddingBottom: '0.75rem' }}>
            <SlidersHorizontal size={18} color="#db2777" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' }}>Filter Products</h3>
          </div>

          {/* Search Box */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Search Keywords
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: searchQuery ? '30px' : '10px' }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Category
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    textAlign: 'left',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: selectedCategory === cat.name ? 700 : 500,
                    background: selectedCategory === cat.name ? '#fce7f3' : 'transparent',
                    color: selectedCategory === cat.name ? '#db2777' : '#4b5563',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Filter Slider */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                Max Price
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#db2777' }}>₹{priceLimit}</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="5000" 
              step="200" 
              value={priceLimit} 
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              style={{ cursor: 'pointer', accentColor: '#db2777' }}
            />
          </div>

          {/* In-Stock Only Toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: '#374151' }}>
              <input 
                type="checkbox" 
                checked={onlyInStock} 
                onChange={(e) => setOnlyInStock(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#db2777' }}
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>

          {/* Reset Filters */}
          <button 
            onClick={() => {
              setSelectedCategory('All');
              setPriceLimit(5000);
              setSearchQuery('');
              setOnlyInStock(false);
              setSortBy('popular');
            }}
            className="btn btn-ghost"
            style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
          >
            Reset Filters
          </button>
        </div>

        {/* Product Grid & Sort Controls */}
        <div>
          {/* Top Sort & Summary Bar */}
          <div className="glass glass-card" style={{ background: '#ffffff', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Showing <strong style={{ color: '#1f2937' }}>{totalCount || 0}</strong> products
              {selectedCategory !== 'All' && <span> in <strong style={{ color: '#db2777' }}>{selectedCategory}</strong></span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Sort By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="popular">Popularity</option>
                <option value="rating">Customer Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid-products">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="product-card skeleton-card" style={{ height: '380px', background: '#f9fafb', borderRadius: '15px' }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff' }}>
              <Package size={48} color="#db2777" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', color: '#1f2937', marginBottom: '0.5rem' }}>No products match your filters</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Try expanding your search parameters or select a different category.</p>
              <button onClick={() => { setSelectedCategory('All'); setPriceLimit(5000); setSearchQuery(''); }} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid-products">
                {products.map((p) => {
                  const inWishlist = wishlist.some(item => item.id === p.id);
                  const isOutOfStock = p.stock === 0;

                  return (
                    <div key={p.id} className="product-card">
                      <div className="product-image-container">
                        {p.tag && (
                          <span className="product-tag badge badge-pink">{p.tag}</span>
                        )}
                        <button 
                          onClick={() => onToggleWishlist(p)} 
                          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                        >
                          <Heart size={18} fill={inWishlist ? '#db2777' : 'none'} />
                        </button>
                        <ResponsiveImage 
                          src={p.image} 
                          alt={p.name} 
                          className="product-image"
                          onClick={() => onSelectProduct(p)}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>

                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#7e22ce', fontWeight: 600 }}>{p.category}</span>
                          <h3 
                            onClick={() => onSelectProduct(p)}
                            style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', margin: '0.25rem 0 0.5rem 0', cursor: 'pointer' }}
                          >
                            {p.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.rating}</span>
                            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>({p.reviewsCount})</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #fce7f3' }}>
                          <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#db2777' }}>₹{p.price.toLocaleString('en-IN')}</span>
                            {p.originalPrice && (
                              <span style={{ fontSize: '0.82rem', color: '#9ca3af', textDecoration: 'line-through', marginLeft: '0.3rem' }}>
                                ₹{p.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => onAddToCart(p)}
                            disabled={isOutOfStock}
                            className="btn btn-primary"
                            style={{
                              padding: '0.5rem 0.9rem',
                              fontSize: '0.85rem',
                              opacity: isOutOfStock ? 0.5 : 1,
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isOutOfStock ? 'Sold Out' : <><ShoppingBag size={16} /> Add</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {products.length < totalCount && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button 
                    onClick={handleLoadMore} 
                    className="btn btn-ghost" 
                    disabled={isLoadingMore}
                    style={{ padding: '0.75rem 2.5rem', fontWeight: 600 }}
                  >
                    {isLoadingMore ? <Loader2 size={20} className="spin" /> : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
