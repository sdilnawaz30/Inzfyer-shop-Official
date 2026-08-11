import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicyPage = ({ setActivePage }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="glass glass-card" style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#2C181B' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Shield size={48} color="#be185d" style={{ marginBottom: '1rem' }} />
        <h1 className="brand-font" style={{ fontSize: '2.5rem', color: '#be185d', marginBottom: '0.5rem' }}>Privacy Policy – INZFYER</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <p style={{ lineHeight: '1.6', color: '#4a3337', fontSize: '1.05rem' }}>
          At INZFYER (accessible from https://inzfyer.in), we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit or make a purchase from our website.
        </p>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>1. Information We Collect</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337', marginBottom: '0.5rem' }}>We may collect the following information:</p>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Name, email address, phone number</li>
            <li>Billing and shipping address</li>
            <li>Payment details (processed securely via third-party payment gateways)</li>
            <li>Order details and purchase history</li>
          </ul>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>2. How We Use Your Information</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337', marginBottom: '0.5rem' }}>We use your information to:</p>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Process and deliver your orders</li>
            <li>Provide customer support</li>
            <li>Improve our products and services</li>
            <li>Send order updates and promotional messages (if opted in)</li>
          </ul>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>3. Payment Security</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            All payments are processed securely through trusted third-party payment gateways such as Cashfree. We do not store your card or banking details on our servers.
          </p>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>4. Cookies</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            Our website may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>5. Data Sharing</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337', marginBottom: '0.5rem' }}>We do not sell or rent your personal data. Your information may only be shared with:</p>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Payment gateways</li>
            <li>Shipping partners</li>
            <li>Legal authorities if required</li>
          </ul>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>6. Data Protection</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            We implement industry-standard security measures to protect your personal information from unauthorized access or misuse.
          </p>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>7. Your Rights</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337', marginBottom: '0.5rem' }}>You have the right to:</p>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>Access your personal data</li>
            <li>Request correction or deletion</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>8. Contact Us</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            If you have any questions regarding this Privacy Policy, you can contact us at:<br/>
            Email: <a href="mailto:admin@inzfyer.in" style={{ color: '#be185d' }}>admin@inzfyer.in</a>
          </p>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>9. Updates to This Policy</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            We may update this policy from time to time. Changes will be posted on this page with updated effective dates.
          </p>
          <p style={{ lineHeight: '1.6', color: '#4a3337', marginTop: '1rem', fontWeight: 'bold' }}>
            By using our website, you agree to this Privacy Policy.
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

export default PrivacyPolicyPage;
