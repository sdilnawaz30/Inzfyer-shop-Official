import React, { useEffect } from 'react';
import { Package, Video, Clock, CreditCard, AlertCircle } from 'lucide-react';

const RefundPolicyPage = ({ setActivePage }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="glass glass-card" style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#2C181B' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Package size={48} color="#be185d" style={{ marginBottom: '1rem' }} />
        <h1 className="brand-font" style={{ fontSize: '2.5rem', color: '#be185d', marginBottom: '0.5rem' }}>Cancellation & Refund Policy</h1>
        <p style={{ color: '#5C4347', fontSize: '1.1rem' }}>Strict and Clear Guidelines for INZFYER Customers</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <p style={{ lineHeight: '1.6', color: '#4a3337', fontSize: '1.05rem', fontWeight: 500 }}>
          At INZFYER, we take immense pride in the quality and packaging of our products. Due to the nature of our items, we maintain a strict return and refund policy to ensure fairness and transparency. Please read the following guidelines carefully before making a purchase.
        </p>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertCircle size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>1. Order Cancellations</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            <strong>INZFYER doesn't accept cancellation once order is placed on the website.</strong> Please ensure all details are correct before confirming your purchase.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertCircle size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>2. Eligibility for Returns/Refunds</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            Refunds and returns are <strong>strictly allowed ONLY for damaged products</strong> received during transit. We do not accept returns or provide refunds for issues related to change of mind, incorrect selections made during purchase, or delays caused by shipping providers.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Video size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>3. Mandatory Unboxing Video Proof</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337', marginBottom: '0.5rem' }}>
            To be eligible for a damage-related claim, the customer <strong>must provide a clear unboxing video</strong> as proof. 
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: '#4a3337', lineHeight: '1.6' }}>
            <li>The video must clearly show the package being opened from its original sealed state.</li>
            <li>The video must be <strong>raw, unedited, and continuous with absolutely no cuts</strong>.</li>
            <li>AI-generated content, manipulated footage, or videos starting after the seal is broken will be immediately rejected.</li>
            <li><strong>No return or refund request will be entertained without this valid video proof under any circumstances.</strong></li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Clock size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>4. Claim Window</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            Any request for a return or refund must be raised within <strong>5 to 7 days</strong> of the delivery date. Claims raised after this 7-day window will not be accepted, regardless of the proof provided.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <CreditCard size={24} color="#be185d" />
            <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: 0, color: '#be185d' }}>5. Refund Processing & Timeline</h2>
          </div>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            Once your claim is reviewed and approved by our quality team, the refund process will be initiated. In compliance with our payment gateway (Cashfree) regulations, refunds will be credited back to the original method of payment within <strong>5 to 7 business days</strong> after approval. 
          </p>
        </section>

        <section>
          <h2 className="brand-font" style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#be185d' }}>6. How to Initiate a Request</h2>
          <p style={{ lineHeight: '1.6', color: '#4a3337' }}>
            To initiate a claim, please send an email to our support team at <a href="mailto:admin@inzfyer.in" style={{ color: '#be185d', fontWeight: 'bold' }}>admin@inzfyer.in</a> with your Order ID, a description of the damage, and the mandatory raw unboxing video attached or linked.
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

export default RefundPolicyPage;
