import React from 'react';
import { Edit2, Trash2, Tag, Barcode } from 'lucide-react';

const ProductTable = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return (
      <div className="glass glass-card empty-state" style={{ background: '#ffffff', textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#5C4347' }}>No products in inventory catalog. Click "Add Product" to create your first item!</p>
      </div>
    );
  }

  return (
    <div className="glass glass-card table-container animate-fade-in" style={{ background: '#ffffff', padding: '1.25rem' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #F8D7D0', textAlign: 'left', color: '#8C2E3C' }}>
              <th style={{ padding: '0.85rem' }}>Product Item</th>
              <th style={{ padding: '0.85rem' }}>SKU Code</th>
              <th style={{ padding: '0.85rem' }}>Category</th>
              <th style={{ padding: '0.85rem' }}>Price & Discount</th>
              <th style={{ padding: '0.85rem' }}>Stock</th>
              <th style={{ padding: '0.85rem' }}>Status</th>
              <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const sku = product.sku || `INZ-${product.id.toUpperCase()}`;
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;

              return (
                <tr key={product.id} style={{ borderBottom: '1px solid #F8D7D0' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1558060370-d644479be6f7?auto=format&fit=crop&w=100&q=80'}
                        alt={product.name}
                        loading="lazy"
                        style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '12px', background: '#F8D7D0' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#2C181B' }}>{product.name}</div>
                        {product.tag && <span style={{ fontSize: '0.72rem', color: '#8C2E3C', fontWeight: 600 }}>{product.tag}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem', color: '#5C4347', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                    {sku}
                  </td>
                  <td style={{ padding: '0.85rem', color: '#8C2E3C', fontWeight: 600, fontSize: '0.88rem' }}>{product.category}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <div style={{ fontWeight: 800, color: '#A63A4B' }}>₹{Number(product.price).toLocaleString('en-IN')}</div>
                    {hasDiscount && (
                      <div style={{ fontSize: '0.78rem', color: '#94757A', textDecoration: 'line-through' }}>
                        ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem', fontWeight: 700, color: '#2C181B' }}>{product.stock} units</td>
                  <td style={{ padding: '0.85rem' }}>
                    {product.stock > 5 ? (
                      <span className="badge badge-success">In Stock</span>
                    ) : (
                      <span className={`badge ${product.stock === 0 ? 'badge-warning' : 'badge-pink'}`}>
                        {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => onEdit(product)}
                        title="Edit Product"
                      >
                        <Edit2 size={16} color="#8C2E3C" />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => onDelete(product)}
                        title="Delete Product"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
