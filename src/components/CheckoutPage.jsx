import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';
import axios from 'axios';

const CheckoutPage = ({ cart, onCompleteCheckout, setActivePage, appliedPromo }) => {
  const [step, setStep] = useState('shipping'); // 'shipping' | 'payment' | 'processing'
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [cashfree, setCashfree] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cf = await load({
          mode: 'sandbox', // Use 'production' for live environment
        });
        setCashfree(cf);
      } catch (err) {
        console.error("Failed to initialize Cashfree SDK", err);
      }
    };
    initializeCashfree();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const freeShipping = subtotal >= 1999;
  const shippingFee = freeShipping ? 0 : 149;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax + shippingFee;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setStep('processing');
    
    try {
      const orderId = `INZ-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // We no longer send the total amount; backend recalculates it securely.
      const createOrderRes = await axios.post('/api/create-order', {
        items: cart.map(item => ({ id: item.id, qty: item.qty })),
        orderId,
        customerDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.mobile
        }
      });
      
      const sessionId = createOrderRes.data.payment_session_id;

      if (cashfree) {
        let checkoutOptions = {
          paymentSessionId: sessionId,
          redirectTarget: "_modal",
          components: ["order-details", "upi"], // Only show UPI options
        };

        cashfree.checkout(checkoutOptions).then(async (result) => {
          if (result.error) {
            console.error("Cashfree checkout error:", result.error);
            setStep('payment');
            return;
          }
          if (result.redirect) {
            console.log("Payment will be redirected");
            return;
          }
          if (result.paymentDetails) {
            try {
              const verifyRes = await axios.post('/api/verify-payment', { orderId });
              
              if (verifyRes.data.success) {
                onCompleteCheckout(verifyRes.data.orderData);
                setActivePage('order-success');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                alert("Payment verification failed. Please contact support.");
                setStep('payment');
                setIsProcessing(false);
              }
            } catch (err) {
              console.error("Verification error", err);
              alert("Payment verification encountered an issue.");
              setStep('payment');
              setIsProcessing(false);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to initiate secure checkout. Please try again later.");
      setStep('payment');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Your cart is empty.</h2>
        <button onClick={() => setActivePage('shop')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => step === 'payment' ? setStep('shipping') : setActivePage('cart')} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> {step === 'payment' ? 'Back to Shipping' : 'Back to Cart'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column (Forms) */}
        <div>
          {step === 'shipping' && (
            <div className="glass glass-card" style={{ background: '#ffffff', padding: '2rem' }}>
              <h2 className="brand-font" style={{ fontSize: '1.8rem', color: '#1f2937', marginBottom: '1.5rem', borderBottom: '2px solid #fce7f3', paddingBottom: '0.75rem' }}>
                Shipping Details
              </h2>
              <form onSubmit={handleShippingSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ananya Sharma" />
                  </div>
                  <div>
                    <label className="form-label">Mobile Number *</label>
                    <input type="tel" required pattern="[0-9]{10}" title="10 digit mobile number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} placeholder="10-digit mobile number" />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Email Address (Optional)</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="For order updates" />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Address Line 1 *</label>
                  <input type="text" required value={formData.address1} onChange={(e) => setFormData({...formData, address1: e.target.value})} placeholder="House/Flat No., Building Name" />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input type="text" value={formData.address2} onChange={(e) => setFormData({...formData, address2: e.target.value})} placeholder="Street Name, Area, Landmark" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <label className="form-label">City *</label>
                    <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">State *</label>
                    <input type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Pincode *</label>
                    <input type="text" required pattern="[0-9]{6}" title="6 digit pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}>
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {step === 'payment' && (
            <div className="glass glass-card" style={{ background: '#ffffff', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #fce7f3', paddingBottom: '0.75rem' }}>
                <CreditCard size={28} color="#db2777" />
                <h2 className="brand-font" style={{ fontSize: '1.8rem', color: '#1f2937' }}>
                  Secure UPI Payment
                </h2>
              </div>
              
              <div style={{ background: '#fdf2f8', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid #fce7f3' }}>
                <p style={{ color: '#db2777', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Pay via UPI App or QR Code</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>You will be securely redirected to Cashfree to complete your payment.</p>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <button type="submit" className="btn btn-primary" disabled={!cashfree || isProcessing} style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} /> {isProcessing ? 'Processing Securely...' : `Pay Securely ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </button>
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem' }}>
                  100% Secure & Encrypted Payment by Cashfree
                </p>
              </form>
            </div>
          )}

          {step === 'processing' && (
            <div className="glass glass-card" style={{ background: '#ffffff', padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{
                border: '4px solid #fce7f3',
                borderTop: '4px solid #db2777',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem auto'
              }} />
              <h2 className="brand-font" style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '1rem' }}>Processing Payment...</h2>
              <p style={{ color: '#6b7280', fontSize: '1.05rem' }}>Please do not close this window or hit back.</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
        </div>

        {/* Right Column (Order Summary) */}
        <div className="glass glass-card" style={{ background: '#ffffff', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.25rem', borderBottom: '1px solid #fce7f3', paddingBottom: '0.75rem' }}>
            Order Summary
          </h3>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.25rem' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px', background: '#fdf2f8' }} />
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.2rem' }}>{item.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Qty: {item.qty}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#db2777', fontSize: '0.95rem' }}>
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem', marginBottom: '1.25rem', borderBottom: '1px solid #fce7f3', paddingBottom: '1rem', borderTop: '1px solid #fce7f3', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {appliedPromo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7e22ce' }}>
                <span>Discount ({appliedPromo})</span>
                <span style={{ fontWeight: 700 }}>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>Shipping</span>
              <span style={{ fontWeight: 600, color: freeShipping ? '#047857' : '#1f2937' }}>
                {freeShipping ? 'FREE' : '₹149'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>Tax (5%)</span>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937' }}>Total</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#db2777' }}>
              ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
