import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';
import axios from 'axios';
import { getShipping } from '../utils/shipping';
import { load } from '@cashfreepayments/cashfree-js';
import { indianCities } from '../utils/indianCities';
import { indianStates } from '../utils/indianStates';
import SearchableSelect from './SearchableSelect';
import AddressAutocomplete from './AddressAutocomplete';

const CheckoutPage = ({ cart, onCompleteCheckout, setActivePage, appliedPromo }) => {
  const [step, setStep] = useState('shipping'); // 'shipping' | 'payment' | 'processing'
  const [shippingConfig, setShippingConfig] = useState(null);
  const [shippingRate, setShippingRate] = useState(null);
  const [shippingStateName, setShippingStateName] = useState('');
  const [shippingError, setShippingError] = useState('');
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    house: '',
    street: '',
    address2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = appliedPromo ? subtotal * 0.1 : 0;

  const total = subtotal - discount + (shippingRate || 0);

  useEffect(() => {
    fetch('/api/shipping-config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setShippingConfig(data.data);
      })
      .catch(err => console.error("Failed to load shipping config", err));
  }, []);

  useEffect(() => {
    const checkPincode = async () => {
      const pin = formData.pincode.replace(/\D/g, '');
      if (pin.length !== 6) {
        setShippingRate(null);
        setShippingStateName('');
        setShippingError('');
        if (pin.length > 0 && pin.length < 6) {
          setFormData(prev => ({ ...prev, city: '', state: '' }));
        }
        return;
      }

      setIsCheckingShipping(true);
      setShippingError('');
      
      let fetchedCity = '';
      let fetchedState = '';
      let fetchError = '';

      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success') {
           const postOffice = data[0].PostOffice[0];
           fetchedState = postOffice.State;
           fetchedCity = postOffice.District || postOffice.Region || postOffice.Name;
        } else {
           fetchError = 'Could not find this pincode. Please check the 6-digit pincode.';
        }
      } catch (err) {
        fetchError = 'Network error while verifying pincode. Please try again.';
      }

      if (fetchError) {
         setShippingRate(null);
         setShippingStateName('');
         setShippingError(fetchError);
         setFormData(prev => ({ ...prev, city: '', state: '' }));
         setIsCheckingShipping(false);
         return;
      }

      const result = await getShipping({ pincode: pin, subtotal, config: shippingConfig });
      if (result.isValid) {
        setShippingRate(result.rate);
        setShippingStateName(result.state);
        setShippingError('');
        setFormData(prev => ({ ...prev, city: fetchedCity, state: fetchedState }));
      } else {
        setShippingRate(null);
        setShippingStateName('');
        setShippingError(result.error || 'Invalid Pincode');
        setFormData(prev => ({ ...prev, city: fetchedCity, state: fetchedState }));
      }
      setIsCheckingShipping(false);
    };

    checkPincode();
  }, [formData.pincode, subtotal, shippingConfig]);

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    if (shippingRate === null) {
      alert("Please enter a valid pincode to calculate shipping.");
      return;
    }

    if (!formData.street || formData.street.trim() === '') {
      alert("Please enter your Street / Area.");
      return;
    }

    if (isProcessing) return;

    if (!formData.city || !formData.state) {
      alert("City and State are required. Please enter a valid Pincode.");
      return;
    }

    const cleanPhone = String(formData.mobile).replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      alert("Enter valid 10-digit Indian phone number");
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    window.scrollTo(0, 0);

    const cleanSubtotal = Number(String(subtotal).replace(/[^0-9.]/g, ""));
    if (isNaN(cleanSubtotal)) {
      alert("Subtotal invalid");
      setIsProcessing(false);
      setStep('shipping');
      return;
    }

    console.log("RAW subtotal:", subtotal);
    console.log("CLEAN subtotal:", cleanSubtotal);
    console.log("TYPE:", typeof cleanSubtotal);

    try {
      const { mobile, house, street, ...existingFields } = formData;
      const finalAddress1 = `${house}, ${street}`;
      const createOrderRes = await axios.post('/api/create-order', {
        pincode: String(formData.pincode).trim(),
        subtotal: cleanSubtotal,
        items: cart.map(item => ({ id: item.id, qty: item.qty })),
        customerDetails: { ...existingFields, address1: finalAddress1, phone: cleanPhone },
        idempotencyKey
      });

      if (createOrderRes.data.success) {
        const orderNum = createOrderRes.data.orderData.orderId || createOrderRes.data.orderData.orderNumber;
        const contact = formData.email || formData.mobile;
        
        onCompleteCheckout(createOrderRes.data.orderData);

        const cashfreeMode = (
          import.meta.env.VITE_CASHFREE_MODE ||
          (import.meta.env.PROD ? 'production' : 'sandbox')
        ).toLowerCase();

        const cashfree = await load({
          mode: cashfreeMode === 'production' ? 'production' : 'sandbox',
        });

        cashfree.checkout({
          paymentSessionId: createOrderRes.data.paymentSessionId,
          returnUrl: `${window.location.origin}/order-success?id=${orderNum}&contact=${encodeURIComponent(contact)}&order_id={order_id}`
        });

      } else {
        alert("Failed to process order.");
        setStep('shipping');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error.response?.data?.message || "Failed to initiate secure checkout. Please try again later.");
      setStep('shipping');
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
        <button onClick={() => setActivePage('cart')} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Cart
        </button>
      </div>

      <div className="checkout-layout">

        {/* Left Column (Forms) */}
        <div style={{ minWidth: 0, width: '100%' }}>
          {step === 'shipping' && (
            <div className="glass glass-card" style={{ background: '#ffffff', padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
              <h2 className="brand-font" style={{ fontSize: '1.8rem', color: '#1f2937', marginBottom: '1.5rem', borderBottom: '2px solid #fce7f3', paddingBottom: '0.75rem' }}>
                Shipping Details
              </h2>
              <form id="shipping-form" onSubmit={handleShippingSubmit}>
                <div className="checkout-field-row-2">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ananya Sharma" />
                  </div>
                  <div>
                    <label className="form-label">Mobile Number *</label>
                    <input 
                      type="tel" 
                      required 
                      pattern="[6-9][0-9]{9}" 
                      title="Valid 10-digit Indian mobile number" 
                      maxLength="10"
                      value={formData.mobile} 
                      onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} 
                      placeholder="10-digit mobile number" 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Email Address *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })} placeholder="For order updates" />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">House / Door No. *</label>
                  <input type="text" required maxLength="100" value={formData.house} onChange={(e) => setFormData({ ...formData, house: e.target.value })} placeholder="18 A, Flat 4B, etc." />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Street / Area *</label>
                  <AddressAutocomplete 
                    value={formData.street} 
                    onChange={(val) => setFormData({ ...formData, street: val })} 
                    placeholder="NN Garden Old Washermenpet" 
                    required={true}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Address Line 2 / Landmark (Optional)</label>
                  <input 
                    type="text" 
                    maxLength="150" 
                    value={formData.address2} 
                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })} 
                    placeholder="Apartment, Floor, Landmark, Nearby Place" 
                  />
                </div>

                <div className="checkout-field-row-3">
                  <div>
                    <label className="form-label">City *</label>
                    <input 
                      type="text"
                      required
                      readOnly
                      value={formData.city}
                      placeholder="Auto-filled"
                      style={{ backgroundColor: '#f9fafb', color: '#374151', cursor: 'default' }}
                    />
                  </div>
                  <div>
                    <label className="form-label">State *</label>
                    <input 
                      type="text"
                      required
                      readOnly
                      value={formData.state}
                      placeholder="Auto-filled"
                      style={{ backgroundColor: '#f9fafb', color: '#374151', cursor: 'default' }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      title="6 digit pincode"
                      inputMode="numeric"
                      value={formData.pincode}
                      maxLength="6"
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      style={{ borderColor: shippingError ? '#ef4444' : '' }}
                    />
                    {isCheckingShipping && <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Loader2 size={12} className="spin" /> Finding location...</p>}
                    {shippingError && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{shippingError}</p>}
                  </div>
                </div>

                {/* Desktop Submit Button */}
                <div className="desktop-only" style={{ marginTop: '1.5rem' }}>
                  <button type="submit" disabled={isCheckingShipping || shippingRate === null} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', opacity: (isCheckingShipping || shippingRate === null) ? 0.7 : 1 }}>
                    Continue to Payment
                  </button>
                </div>
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
        <div className="glass glass-card checkout-summary-sticky" style={{ background: '#ffffff', padding: 'clamp(1.25rem, 3vw, 2rem)', minWidth: 0 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.25rem', borderBottom: '1px solid #fce7f3', paddingBottom: '0.75rem' }}>
            Order Summary
          </h3>

          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.25rem' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <ResponsiveImage src={item.image} alt={item.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', background: '#fdf2f8', flexShrink: 0 }} />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.2rem', overflowWrap: 'break-word' }}>{item.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Qty: {item.qty}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#db2777', fontSize: '0.95rem', flexShrink: 0 }}>
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
              <span style={{ fontWeight: 600 }}>
                {shippingRate === null
                  ? 'Enter pincode'
                  : shippingRate === 0
                    ? <span style={{ color: '#047857' }}>FREE</span>
                    : `₹${shippingRate} (${shippingStateName === 'Tamil Nadu' ? 'TN' : 'Other'})`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2937' }}>Total to Pay</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#db2777' }}>
              ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic', marginBottom: '1rem' }}>
            Prices are inclusive of all taxes
          </div>

          {/* Mobile Submit Button (Placed directly under Order Summary on Mobile) */}
          <div className="mobile-only" style={{ marginTop: '1.25rem' }}>
            <button form="shipping-form" type="submit" disabled={isCheckingShipping || shippingRate === null} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', opacity: (isCheckingShipping || shippingRate === null) ? 0.7 : 1 }}>
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
