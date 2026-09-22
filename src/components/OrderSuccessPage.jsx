import React, { useState, useEffect } from 'react';
import { CheckCircle2, Download, ShoppingBag, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { generateAndDownloadInvoice } from '../utils/invoiceGenerator';

const OrderSuccessPage = ({ setActivePage }) => {
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('id');
        const contact = params.get('contact');

        if (!orderId || !contact) {
          setError('Invalid Order Link. Missing order ID or contact information.');
          setIsLoading(false);
          return;
        }

        // 1. Actively verify payment state with backend
        try {
          await axios.post('/api/verify-payment', { orderId });
        } catch (verifyErr) {
          console.warn('Payment verification returned an error. We will still fetch the order.', verifyErr);
        }

        // 2. Fetch the final updated invoice data
        const response = await axios.post('/api/get-invoice', {
          orderNumber: orderId,
          contact: contact
        });

        if (response.data.success) {
          setOrderData(response.data.data);
        } else {
          setError('Failed to fetch order details.');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.message || 'Could not verify order. You may be unauthorized.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  const handleDownloadPDF = async () => {
    if (isDownloading || !orderData) return;
    
    try {
      setIsDownloading(true);
      await generateAndDownloadInvoice(orderData);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <Loader2 className="spin" size={48} color="#db2777" style={{ margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ color: '#1f2937', fontSize: '1.5rem' }}>Verifying your secure order...</h2>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ color: '#1f2937', fontSize: '1.5rem', marginBottom: '1rem' }}>{error || 'No recent order found.'}</h2>
        <button onClick={() => setActivePage('shop')} className="btn btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  const { order, items } = orderData;
  const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass glass-card" style={{ background: '#ffffff', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isPaid ? '#d1fae5' : '#fef3c7',
          color: isPaid ? '#047857' : '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: isPaid ? '0 4px 15px rgba(4, 120, 87, 0.2)' : '0 4px 15px rgba(217, 119, 6, 0.2)'
        }}>
          {isPaid ? <CheckCircle2 size={46} /> : <Loader2 size={46} className="spin" />}
        </div>

        <h1 className="brand-font" style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
          {isPaid ? 'Order Placed Successfully' : 'Payment Processing'}
        </h1>
        
        <p style={{ color: '#6b7280', fontSize: '1.05rem', marginBottom: '1rem' }}>
          Thank you for your order, <strong style={{ color: '#db2777' }}>{order.customerName}</strong>!
        </p>

        {isPaid && (
          <p style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 500, marginBottom: '2rem', padding: '0.75rem 1.5rem', background: '#ecfdf5', borderRadius: '8px', display: 'inline-block' }}>
            Your order will be dispatched within 1–4 days.
          </p>
        )}

        {!isPaid && (
          <p style={{ color: '#d97706', fontSize: '1.05rem', marginBottom: '2rem' }}>
            We are verifying your payment status. Please check back later.
          </p>
        )}

        {/* Order Details Panel */}
        <div style={{ background: '#fdf2f8', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left', fontSize: '0.95rem', border: '1px solid #fce7f3' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ color: '#6b7280', display: 'block', fontSize: '0.85rem' }}>Order ID</span>
              <strong style={{ color: '#1f2937' }}>#{order.orderNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280', display: 'block', fontSize: '0.85rem' }}>Order Date</span>
              <strong style={{ color: '#1f2937' }}>{dateFormatted}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280', display: 'block', fontSize: '0.85rem' }}>Payment Status</span>
              <strong style={{ color: isPaid ? '#047857' : '#d97706', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {isPaid ? <CheckCircle2 size={16} /> : <Loader2 size={16} />} {order.paymentStatus || 'PENDING'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#6b7280', display: 'block', fontSize: '0.85rem' }}>Total Paid</span>
              <strong style={{ color: '#db2777' }}>₹{Number(order.finalTotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #fce7f3' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>Product(s)</h3>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{item.productName}</span>
                  <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>x{item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="btn btn-primary" style={{ padding: '0.85rem 1.5rem', flex: '1 1 auto', minWidth: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isDownloading ? <Loader2 size={18} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} /> : <Download size={18} style={{ marginRight: '0.5rem' }} />} 
            {isDownloading ? 'Generating PDF...' : 'Download Invoice'}
          </button>
          <button onClick={() => setActivePage('shop')} className="btn btn-ghost" style={{ padding: '0.85rem 1.5rem', flex: '1 1 auto', minWidth: '200px' }}>
            Continue Shopping <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </button>
        </div>

        {/* Customer Support */}
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
          <p style={{ marginBottom: '0.25rem' }}>Need help with your order?</p>
          <p>
            Please contact our support team at{' '}
            <a href="mailto:admin@inzfyer.in" style={{ color: '#db2777', fontWeight: 500, textDecoration: 'none' }}>admin@inzfyer.in</a>
            {' '}and keep your Order ID handy.
          </p>
        </div>

        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
