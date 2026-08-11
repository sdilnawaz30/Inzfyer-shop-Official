import React, { useEffect } from 'react';
import { FileText, Users, ShoppingBag, ShieldCheck, CreditCard, Truck, RefreshCw, AlertTriangle, Shield, Scale, Link2, XCircle, MapPin, Phone } from 'lucide-react';

const TermsPolicyPage = ({ setActivePage }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="glass glass-card" style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#2C181B' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <FileText size={48} color="#be185d" style={{ marginBottom: '1rem' }} />
        <h1 className="brand-font" style={{ fontSize: '2.5rem', color: '#be185d', marginBottom: '0.5rem' }}>Terms & Conditions</h1>
        <p style={{ color: '#5C4347', fontSize: '1.1rem' }}>INZFYER</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <p style={{ lineHeight: '1.6', color: '#4a3337', fontSize: '1.05rem', fontWeight: 500 }}>
          Welcome to INZFYER. By accessing or using our website, you agree to be bound by the following Terms & Conditions. Please read them carefully before making any purchase.
        </p>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <FileText size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>1. General</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>This website is operated by INZFYER.</li>
            <li>By using our website, you agree to comply with all terms, policies, and conditions stated here.</li>
            <li>We reserve the right to update or modify these Terms at any time without prior notice.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Users size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>2. Eligibility</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>You must be at least 18 years of age or accessing the website under the supervision of a parent or legal guardian.</li>
            <li>By placing an order, you confirm that all details provided are accurate and complete.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShoppingBag size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>3. Products & Pricing</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>All products listed on the website are subject to availability.</li>
            <li>We reserve the right to modify prices, discontinue products, or change specifications at any time without notice.</li>
            <li>Prices are displayed in INR (₹) and are inclusive or exclusive of taxes as applicable.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>4. Order Acceptance</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Once you place an order, you will receive an order confirmation. This does not guarantee acceptance.</li>
            <li>INZFYER reserves the right to cancel or refuse any order due to product unavailability, pricing errors, or suspected fraudulent activity.</li>
            <li>In case of cancellation after payment, a full refund will be processed.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <CreditCard size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>5. Payments</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>We accept secure payments via trusted payment gateways such as Cashfree, UPI, Cards, and Net Banking.</li>
            <li>INZFYER does not store your card or payment details.</li>
            <li>Orders will be processed only after successful payment confirmation.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Truck size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>6. Shipping & Delivery</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Shipping and delivery are governed by our Shipping & Delivery Policy.</li>
            <li>Delivery timelines are estimates and may vary due to external factors.</li>
            <li>INZFYER is not responsible for delays caused by courier partners.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <RefreshCw size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>7. Returns & Refunds</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Returns and refunds are governed by our Cancellation & Refund Policy.</li>
            <li>Products are eligible for return or refund only if received damaged.</li>
            <li>A complete unboxing video without cuts or edits is mandatory as proof.</li>
            <li>Requests without valid proof may not be accepted.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertTriangle size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>8. User Responsibilities</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>You agree not to misuse the website for fraudulent or unlawful activities.</li>
            <li>You shall not attempt to harm, hack, or disrupt website functionality.</li>
            <li>Any violation may result in termination of access and legal action.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Shield size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>9. Intellectual Property</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>All content on this website including logos, images, text, and design is the property of INZFYER.</li>
            <li>Unauthorized use, reproduction, or distribution is strictly prohibited.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Scale size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>10. Limitation of Liability</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>INZFYER shall not be liable for any indirect or consequential damages, losses due to delayed delivery, or issues arising from misuse of products.</li>
            <li>Our maximum liability is limited to the amount paid for the product.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Link2 size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>11. Third-Party Services</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>We may use third-party services such as payment gateways and logistics partners.</li>
            <li>INZFYER is not responsible for issues arising from these external services.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <XCircle size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>12. Termination</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            We reserve the right to suspend or terminate user access if any Terms are violated.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <MapPin size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>13. Governing Law</h2>
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>These Terms & Conditions shall be governed by and interpreted under the laws of India.</li>
            <li>Any disputes shall be subject to the jurisdiction of Chennai, Tamil Nadu courts.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Phone size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>14. Contact Information</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
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

export default TermsPolicyPage;
