import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

const WishlistView = ({ wishlist, onRemoveFromWishlist, onAddToCart, setActivePage, onSelectProduct }) => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="brand-font" style={{ fontSize: '2.8rem', color: '#1f2937', marginBottom: '0.5rem' }}>
          My Saved <span style={{ color: '#db2777' }}>Wishlist</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          {wishlist.length === 0 ? 'No items saved yet' : `You have ${wishlist.length} item(s) saved in your wishlist`}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="glass glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#fdf2f8',
            color: '#db2777',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Heart size={40} fill="#db2777" color="#db2777" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
            Tap the heart icon on any plushie or luxury gift to save it here for later.
          </p>
          <button onClick={() => setActivePage('shop')} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            Explore Boutique Shop <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="grid-products">
          {wishlist.map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-image-container">
                <button 
                  onClick={() => onRemoveFromWishlist(item.id)} 
                  className="wishlist-btn active"
                  title="Remove from wishlist"
                >
                  <Trash2 size={18} color="#ef4444" />
                </button>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="product-image"
                  onClick={() => onSelectProduct(item)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#7e22ce', fontWeight: 600 }}>{item.category}</span>
                  <h3 
                    onClick={() => onSelectProduct(item)}
                    style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', margin: '0.25rem 0 0.5rem 0', cursor: 'pointer' }}
                  >
                    {item.name}
                  </h3>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#db2777', marginBottom: '1rem' }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onAddToCart(item);
                    onRemoveFromWishlist(item.id);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem', fontSize: '0.88rem' }}
                >
                  <ShoppingBag size={16} /> Move to Shopping Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistView;
