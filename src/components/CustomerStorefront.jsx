import React, { useState } from 'react';

const CustomerStorefront = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categories.map(category => (
          <button 
            key={category}
            className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => {
          const outOfStock = product.stock === 0;
          return (
            <div key={product.id} className="glass glass-card product-card-pos" style={{ cursor: 'default' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--brand-secondary)' }}>
                  {product.name}
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  {product.category}
                </span>
                <span className={`badge ${outOfStock ? 'badge-warning' : 'badge-success'}`} style={{ marginBottom: '1rem' }}>
                  {outOfStock ? 'Out of Stock' : 'Available'}
                </span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerStorefront;
