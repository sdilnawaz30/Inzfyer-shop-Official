import React, { useState } from 'react';
import { Gift, Minus, Plus, ShoppingBag, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';

const CartView = ({ 
  cart, 
  onUpdateQty, 
  onRemoveFromCart, 
  onClearCart, 
  setActivePage,
  onOpenCheckout,
  appliedPromo,
  setAppliedPromo,
  showToast
}) => {
  const [promoInput, setPromoInput] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const shippingThreshold = 1999;
  const freeShipping = subtotal >= shippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, shippingThreshold - subtotal);
  
  // Calculate tax per item after applying proportional discount
  const discountRatio = subtotal > 0 ? discount / subtotal : 0;
  const tax = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.qty;
    const discountedItemTotal = itemTotal * (1 - discountRatio);
    const gstRate = item.gst_rate != null ? Number(item.gst_rate) : 18;
    return sum + (discountedItemTotal * (gstRate / 100));
  }, 0);

  const total = subtotal - discount + tax;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === 'INZFYER10') {
      setAppliedPromo('INZFYER10');
      showToast('10% Discount Applied with promo code INZFYER10!', 'promo');
      setPromoInput('');
    } else {
      showToast('Invalid promo code. Try INZFYER10', 'warning');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="brand-font" style={{ fontSize: '2.8rem', color: '#1f2937', marginBottom: '0.5rem' }}>
          Your Shopping <span style={{ color: '#db2777' }}>Bag</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          {cart.length === 0 ? 'Your bag is empty' : `You have ${cart.length} item(s) in your bag`}
        </p>
      </div>

      {cart.length === 0 ? (
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
            <ShoppingBag size={40} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Your shopping bag is empty</h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
            Looks like you haven't added any luxury toys or gift sets to your bag yet!
          </p>
          <button onClick={() => setActivePage('shop')} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            Explore Boutique Shop <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Cart Items List */}
          <div>
            {/* Free Shipping Progress Meter */}
            <div className="glass glass-card" style={{ background: '#ffffff', marginBottom: '1.5rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 700, color: freeShipping ? '#047857' : '#db2777' }}>
                  {freeShipping ? 'You unlocked Free Express Shipping & Gift Wrapping!' : `Add ₹${amountNeededForFreeShipping.toLocaleString('en-IN')} more for Free Shipping!`}
                </span>
                <span style={{ fontWeight: 700, color: '#6b7280' }}>₹{subtotal} / ₹{shippingThreshold}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#fce7f3', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f472b6 0%, #db2777 100%)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className="glass glass-card"
                  style={{
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem'
                  }}
                >
                  <ResponsiveImage 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '14px', background: '#fdf2f8' }} 
                  />

                  <div style={{ flexGrow: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 600, textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.25rem' }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#db2777' }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>
                    {item.includeGiftWrap && (
                      <span className="badge badge-pink" style={{ marginTop: '0.35rem', fontSize: '0.7rem' }}>
                        <Gift size={12} /> Gift Boxed {item.giftNote ? `("${item.giftNote}")` : ''}
                      </span>
                    )}
                  </div>

                  {/* Qty Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '999px', background: '#ffffff' }}>
                    <button 
                      onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      style={{ padding: '0.3rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '0 0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>{item.qty}</span>
                    <button 
                      onClick={() => onUpdateQty(item.id, item.qty + 1, item.stock)}
                      disabled={item.stock !== undefined && item.qty >= item.stock}
                      style={{ 
                        padding: '0.3rem 0.6rem', 
                        border: 'none', 
                        background: 'none', 
                        cursor: (item.stock !== undefined && item.qty >= item.stock) ? 'not-allowed' : 'pointer',
                        opacity: (item.stock !== undefined && item.qty >= item.stock) ? 0.5 : 1
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove Item */}
                  <button 
                    onClick={() => onRemoveFromCart(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.5rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setActivePage('shop')} className="btn btn-ghost" style={{ fontSize: '0.88rem' }}>
                ← Continue Shopping
              </button>
              <button onClick={onClearCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                Clear Entire Bag
              </button>
            </div>
          </div>

          {/* Order Summary Panel */}
          <div className="glass glass-card" style={{ background: '#ffffff', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.25rem', borderBottom: '1px solid #fce7f3', paddingBottom: '0.75rem' }}>
              Order Summary
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                Promo Code
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Try INZFYER10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '0.65rem' }}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
                  Apply
                </button>
              </div>
            </form>

            {/* Calculation Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem', marginBottom: '1.25rem', borderBottom: '1px solid #fce7f3', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedPromo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7e22ce' }}>
                  <span>Discount (10% OFF)</span>
                  <span style={{ fontWeight: 700 }}>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                <span>Express Gift Shipping</span>
                <span style={{ fontWeight: 600, color: freeShipping ? '#047857' : '#1f2937' }}>
                  {freeShipping ? 'FREE' : '₹149'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                <span>Estimated Tax (GST)</span>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937' }}>Total</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#db2777' }}>
                ₹{(total + (freeShipping ? 0 : 149)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <button 
              onClick={() => setActivePage('checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', border: 'none' }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
