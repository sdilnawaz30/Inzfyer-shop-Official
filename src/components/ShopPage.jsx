import React, { useState, useMemo } from 'react';
import { Heart, Package, Search, ShoppingBag, SlidersHorizontal, Star, X } from 'lucide-react';

const ShopPage = ({ 
  products, 
  onAddToCart, 
  onToggleWishlist, 
  wishlist, 
  onSelectProduct,
  searchQuery,
  setSearchQuery
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceLimit, setPriceLimit] = useState(5000);
  const [sortBy, setSortBy] = useState('popular');
  const [onlyInStock, setOnlyInStock] = useState(false);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = p.price <= priceLimit;
        const matchesStock = !onlyInStock || p.stock > 0;
        return matchesCategory && matchesSearch && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, priceLimit, onlyInStock, sortBy]);

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
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Filters Sidebar */}
        <div className="glass glass-card" style={{ background: '#ffffff', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #fce7f3', paddingBottom: '0.75rem' }}>
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
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    textAlign: 'left',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    background: selectedCategory === cat ? '#fce7f3' : 'transparent',
                    color: selectedCategory === cat ? '#db2777' : '#4b5563',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
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
              Showing <strong style={{ color: '#1f2937' }}>{filteredProducts.length}</strong> products
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
          {filteredProducts.length === 0 ? (
            <div className="glass glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff' }}>
              <Package size={48} color="#db2777" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', color: '#1f2937', marginBottom: '0.5rem' }}>No products match your filters</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Try expanding your search parameters or select a different category.</p>
              <button onClick={() => { setSelectedCategory('All'); setPriceLimit(5000); setSearchQuery(''); }} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid-products">
              {filteredProducts.map((p) => {
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
                      <img 
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
