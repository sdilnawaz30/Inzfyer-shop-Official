import React, { useState } from 'react';
import { Heart, Gift, ShoppingBag, Star, ShieldCheck, Truck, ArrowLeft, Zap, Sparkles, ZoomIn, Check, RotateCcw } from 'lucide-react';

const ProductDetailPage = ({ product, products = [], onClose, onAddToCart, onBuyNow, onToggleWishlist, wishlist, onSelectProduct }) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [giftNote, setGiftNote] = useState('');
  const [includeGiftWrap, setIncludeGiftWrap] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!product) return null;

  // Generate gallery images array (main image + complementary angles/details)
  const galleryImages = [
    product.image,
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
  ];

  const inWishlist = wishlist.some(item => item.id === product.id);
  const isOutOfStock = product.stock === 0;
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Filter related products (same category or others, excluding current product)
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.isFeatured))
    .slice(0, 4);

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      qty: quantity,
      giftNote: includeGiftWrap ? giftNote : '',
      includeGiftWrap
    });
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow({
        ...product,
        qty: quantity,
        giftNote: includeGiftWrap ? giftNote : '',
        includeGiftWrap
      });
    } else {
      handleAddToCart();
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
      {/* Back Button */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 1.5rem auto' }}>
        <button 
          onClick={onClose} 
          className="btn btn-ghost"
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
        >
          <ArrowLeft size={16} /> Back to Boutique
        </button>
      </div>

      {/* Main Product Showcase Card */}
      <div className="glass glass-card" style={{ maxWidth: '1240px', margin: '0 auto 3.5rem auto', padding: '2.5rem', background: 'rgba(255, 255, 255, 0.92)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Image Gallery & Zoom */}
          <div>
            {/* Main Interactive Zoom Stage */}
            <div 
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                background: '#F8D7D0',
                aspectRatio: '1/1',
                marginBottom: '1.25rem',
                border: '1.5px solid rgba(224, 150, 137, 0.4)',
                boxShadow: '0 12px 30px rgba(140, 46, 60, 0.1)',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in'
              }}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {product.tag && (
                <span className="product-tag badge badge-pink" style={{ top: '16px', left: '16px' }}>
                  {product.tag}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="badge badge-purple" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
                  {discountPercent}% OFF
                </span>
              )}

              <img 
                src={galleryImages[selectedImgIndex]} 
                alt={product.name} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: isZoomed ? 'scale(1.7)' : 'scale(1)',
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformOrigin: 'center center'
                }}
              />

              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(6px)',
                borderRadius: '999px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#8C2E3C',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                pointerEvents: 'none'
              }}>
                <ZoomIn size={14} /> {isZoomed ? 'Click to Reset' : 'Click to Zoom'}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setSelectedImgIndex(idx); setIsZoomed(false); }}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImgIndex === idx ? '2.5px solid #A63A4B' : '1.5px solid rgba(224, 150, 137, 0.3)',
                    boxShadow: selectedImgIndex === idx ? '0 4px 14px rgba(166, 58, 75, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    opacity: selectedImgIndex === idx ? 1 : 0.7
                  }}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info, Pricing & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Category & Stock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#8C2E3C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {product.category}
                </span>
                <span className={`badge ${isOutOfStock ? 'badge-warning' : 'badge-success'}`}>
                  {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} left)`}
                </span>
              </div>

              {/* Title */}
              <h1 className="brand-font" style={{ fontSize: '2.5rem', color: '#2C181B', marginBottom: '0.85rem', lineHeight: '1.15' }}>
                {product.name}
              </h1>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.15rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.floor(product.rating) ? '#D97706' : 'none'} color="#D97706" />
                  ))}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2C181B' }}>{product.rating}</span>
                <span style={{ fontSize: '0.88rem', color: '#94757A' }}>({product.reviewsCount} customer reviews)</span>
              </div>

              {/* Price & Discount */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #FAF0ED 0%, #F8D7D0 100%)',
                border: '1px solid rgba(224, 150, 137, 0.4)',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '2.3rem', fontWeight: 800, color: '#A63A4B' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span style={{ fontSize: '1.2rem', color: '#94757A', textDecoration: 'line-through' }}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="badge badge-pink" style={{ background: '#A63A4B', color: '#ffffff', borderColor: '#A63A4B' }}>
                    SAVE ₹{product.originalPrice - product.price}
                  </span>
                )}
              </div>

              {/* Description */}
              <p style={{ color: '#5C4347', fontSize: '1.02rem', lineHeight: '1.65', marginBottom: '1.75rem' }}>
                {product.description}
              </p>

              {/* Gift Box & Satin Ribbon Customization */}
              <div style={{
                background: '#ffffff',
                border: '1.5px dashed rgba(166, 58, 75, 0.4)',
                borderRadius: '20px',
                padding: '1.25rem',
                marginBottom: '1.75rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 700, color: '#A63A4B', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={includeGiftWrap} 
                    onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#A63A4B' }}
                  />
                  <Gift size={20} /> Free Signature Gift Box & Satin Ribbon Packaging
                </label>

                {includeGiftWrap && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <input 
                      type="text" 
                      placeholder="Add handwritten note card message for recipient..."
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      style={{ fontSize: '0.9rem', background: '#FAF0ED' }}
                    />
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2C181B' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(224, 150, 137, 0.4)', borderRadius: '999px', background: '#ffffff' }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '0.45rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, color: '#A63A4B' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 0.75rem', fontWeight: 700, fontSize: '1rem', color: '#2C181B' }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    style={{ padding: '0.45rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, color: '#A63A4B' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart, Buy Now, Wishlist */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  fontSize: '1rem',
                  borderColor: '#A63A4B',
                  color: '#A63A4B',
                  opacity: isOutOfStock ? 0.5 : 1
                }}
              >
                <ShoppingBag size={20} /> {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>

              <button 
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{
                  flex: 1.2,
                  padding: '1rem 1.5rem',
                  fontSize: '1rem',
                  opacity: isOutOfStock ? 0.5 : 1
                }}
              >
                <Zap size={20} /> Buy Now
              </button>

              <button 
                onClick={() => onToggleWishlist(product)}
                className="btn btn-ghost"
                style={{
                  padding: '1rem 1.25rem',
                  borderColor: inWishlist ? '#A63A4B' : 'rgba(224, 150, 137, 0.4)',
                  color: inWishlist ? '#A63A4B' : '#5C4347'
                }}
                title="Wishlist"
              >
                <Heart size={20} fill={inWishlist ? '#A63A4B' : 'none'} />
              </button>
            </div>

            {/* Delivery & Assurance Guarantees */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(224, 150, 137, 0.3)'
            }}>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#5C4347' }}>
                <Truck size={20} color="#A63A4B" style={{ margin: '0 auto 0.3rem auto' }} />
                <div style={{ fontWeight: 700, color: '#2C181B' }}>Free Express Shipping</div>
                <span>On orders above ₹1,999</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#5C4347' }}>
                <ShieldCheck size={20} color="#A63A4B" style={{ margin: '0 auto 0.3rem auto' }} />
                <div style={{ fontWeight: 700, color: '#2C181B' }}>100% Non-Toxic</div>
                <span>Organic cotton fluff</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#5C4347' }}>
                <RotateCcw size={20} color="#A63A4B" style={{ margin: '0 auto 0.3rem auto' }} />
                <div style={{ fontWeight: 700, color: '#2C181B' }}>Easy Exchanges</div>
                <span>7-Day boutique guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section Below */}
      {relatedProducts.length > 0 && (
        <section style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ color: '#A63A4B', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Handpicked Recommendations
            </span>
            <h2 className="brand-font" style={{ fontSize: '2.2rem', color: '#2C181B', marginTop: '0.25rem' }}>
              You May Also Love
            </h2>
          </div>

          <div className="grid-products">
            {relatedProducts.map((rel) => {
              const relInWishlist = wishlist.some(item => item.id === rel.id);
              return (
                <div key={rel.id} className="product-card">
                  <div className="product-image-container">
                    {rel.tag && (
                      <span className="product-tag badge badge-pink">{rel.tag}</span>
                    )}
                    <button 
                      onClick={() => onToggleWishlist(rel)} 
                      className={`wishlist-btn ${relInWishlist ? 'active' : ''}`}
                    >
                      <Heart size={18} fill={relInWishlist ? '#A63A4B' : 'none'} color={relInWishlist ? '#A63A4B' : '#94757A'} />
                    </button>
                    <img 
                      src={rel.image} 
                      alt={rel.name} 
                      className="product-image"
                      onClick={() => { onSelectProduct(rel); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#8C2E3C', fontWeight: 600 }}>{rel.category}</span>
                      <h3 
                        onClick={() => { onSelectProduct(rel); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2C181B', margin: '0.25rem 0 0.5rem 0', cursor: 'pointer' }}
                      >
                        {rel.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                        <Star size={14} fill="#D97706" color="#D97706" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rel.rating}</span>
                        <span style={{ fontSize: '0.78rem', color: '#94757A' }}>({rel.reviewsCount})</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #F8D7D0' }}>
                      <div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#A63A4B' }}>₹{rel.price.toLocaleString('en-IN')}</span>
                        {rel.originalPrice && (
                          <span style={{ fontSize: '0.85rem', color: '#94757A', textDecoration: 'line-through', marginLeft: '0.4rem' }}>
                            ₹{rel.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => onAddToCart(rel)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                      >
                        <ShoppingBag size={16} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
