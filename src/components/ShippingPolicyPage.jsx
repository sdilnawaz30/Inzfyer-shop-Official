import React, { useEffect } from 'react';
import { Truck, MapPin, Clock, FileText, AlertCircle, Phone } from 'lucide-react';

const ShippingPolicyPage = ({ setActivePage }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="glass glass-card" style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#2C181B' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Truck size={48} color="#be185d" style={{ marginBottom: '1rem' }} />
        <h1 className="brand-font" style={{ fontSize: '2.5rem', color: '#be185d', marginBottom: '0.5rem' }}>Shipping & Delivery Policy</h1>
        <p style={{ color: '#5C4347', fontSize: '1.1rem' }}>INZFYER</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <p style={{ lineHeight: '1.6', color: '#4a3337', fontSize: '1.05rem', fontWeight: 500 }}>
          At INZFYER, we are committed to delivering your orders in a timely and reliable manner. Please review our shipping policy carefully.
        </p>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <MapPin size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>1. Shipping Coverage</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>We currently ship products only within India.</li>
            <li>International shipping is not available at this time.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Clock size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>2. Order Processing Time</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>All orders are processed within 1–2 business days from the date of order confirmation and successful payment.</li>
            <li>Orders are not processed or shipped on Sundays or public holidays.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Truck size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>3. Shipping Method</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            Orders are shipped through reputed courier partners and/or India Post (Speed Post/Registered Post), depending on service availability in your area.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Clock size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>4. Estimated Delivery Time</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Delivery timelines may vary based on location and courier service.</li>
            <li>Estimated delivery time is 2–8 business days from the date of dispatch.</li>
            <li>Remote or rural areas may experience slightly longer delivery times.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <FileText size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>5. Shipping Charges</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Shipping charges, if applicable, will be clearly displayed at checkout before payment.</li>
            <li>Free shipping offers (if any) will be applied as per promotional terms.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Truck size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>6. Order Tracking</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            Once your order is shipped, you will receive a tracking ID/link via SMS, WhatsApp, or email (if available), allowing you to track your shipment in real-time.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <MapPin size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>7. Delivery Address</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Orders will be delivered to the address provided by the customer at checkout.</li>
            <li>Customers are responsible for providing accurate and complete delivery details.</li>
            <li>INZFYER shall not be responsible for delays or failed deliveries due to incorrect or incomplete address information.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertCircle size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>8. Delays & Liability</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>While we strive to ensure timely delivery, INZFYER is not liable for delays caused by courier companies, natural disasters, public holidays, or unforeseen circumstances.</li>
            <li>However, we ensure that all orders are handed over to the courier partner within the committed dispatch timeframe.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertCircle size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>9. Failed Delivery Attempts</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>If delivery fails due to customer unavailability or incorrect address, the courier may attempt re-delivery.</li>
            <li>Additional charges may apply for re-shipping if the order is returned to us.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <FileText size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>10. Damaged or Lost Shipments</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>If your order arrives damaged or is lost in transit, please contact us within 48 hours of delivery with proper proof (such as unboxing video without cuts/edits).</li>
            <li>We will investigate and provide a resolution as per our Refund Policy.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Phone size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>11. Contact Information</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            For any shipping-related queries or concerns, you may contact us:<br/>
            WhatsApp: <a href="https://wa.me/919445544739" target="_blank" rel="noopener noreferrer" style={{ color: '#be185d' }}>9445544739</a><br/>
            Email: <a href="mailto:admin@inzfyer.in" style={{ color: '#be185d' }}>admin@inzfyer.in</a>
          </p>
        </section>
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(190, 24, 93, 0.2)', textAlign: 'center' }}>
        <button 
          onClick={() => setActivePage('home')}
          className="btn btn-outline"
          style={{ padding: '0.75rem 2rem' }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
