import React from 'react';
import { Package, Download, ChevronRight, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';
import { generateAndDownloadInvoice } from '../utils/invoiceGenerator';

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return <CheckCircle2 size={16} color="#047857" />;
    case 'shipped': return <Truck size={16} color="#2563eb" />;
    case 'cancelled': return <XCircle size={16} color="#ef4444" />;
    default: return <Clock size={16} color="#d97706" />;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'badge-success';
    case 'shipped': return 'badge-blue';
    case 'cancelled': return 'badge-red';
    default: return 'badge-warning';
  }
};

const MyOrdersPage = ({ myOrders, setActivePage, salesHistory }) => {
  
  // Cross-reference with salesHistory to get the latest status
  const ordersToDisplay = myOrders.map(myOrder => {
    const updatedOrder = salesHistory.find(s => s.orderId === myOrder.orderId);
    return updatedOrder || myOrder;
  }).reverse(); // Show newest first

  const handleDownloadPDF = (orderData) => {
    // Format for our standard invoice generator
    const invoiceData = {
      order: {
        orderNumber: orderData.orderId,
        createdAt: orderData.timestamp,
        customerName: orderData.customer?.name,
        customerEmail: orderData.customer?.email,
        customerPhone: orderData.customer?.mobile,
        shippingAddress: orderData.customer?.address1,
        city: orderData.customer?.city,
        state: orderData.customer?.state || '',
        pincode: orderData.customer?.pincode,
        subtotal: orderData.subtotal,
        shippingCharge: orderData.shippingFee,
        discount: orderData.discount,
        taxAmount: orderData.tax,
        finalTotal: orderData.total,
        paymentMethod: orderData.paymentMethod || 'Online',
        paymentStatus: orderData.paymentStatus || 'PENDING',
      },
      items: orderData.items.map(item => ({
        productName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        subtotal: item.price * item.qty,
        gstRate: item.gstRate || 18,
        taxAmount: (item.price * item.qty) * ((item.gstRate || 18) / 100)
      }))
    };
    
    try {
      generateAndDownloadInvoice(invoiceData);
    } catch (e) {
      console.error("Failed to generate invoice", e);
      alert("Failed to download invoice.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Package size={32} color="#db2777" />
        <div>
          <h1 className="brand-font" style={{ fontSize: '2.4rem', color: '#1f2937' }}>My Orders</h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Track, manage, and view your recent boutique purchases.</p>
        </div>
      </div>

      {ordersToDisplay.length === 0 ? (
        <div className="glass glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff' }}>
          <Package size={48} color="#fbcfe8" style={{ margin: '0 auto 1.5rem auto' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>No orders yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>You haven't placed any orders with us. Start exploring our luxury collection!</p>
          <button onClick={() => setActivePage('shop')} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {ordersToDisplay.map((order, idx) => (
            <div key={idx} className="glass glass-card" style={{ background: '#ffffff', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fce7f3', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Order Placed: {order.timestamp}</span>
                  <strong style={{ fontSize: '1.1rem', color: '#1f2937' }}>{order.orderId}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '0.2rem' }}>Total Amount</span>
                    <strong style={{ fontSize: '1.2rem', color: '#db2777' }}>₹{order.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                  </div>
                </div>
              </div>

              {/* Order Items & Status */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Images Preview */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {order.items.slice(0, 3).map((item, i) => (
                    <ResponsiveImage key={i} src={item.image} alt={item.name} title={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', background: '#fdf2f8', border: '1px solid #fce7f3' }} />
                  ))}
                  {order.items.length > 3 && (
                    <div style={{ width: '64px', height: '64px', borderRadius: '10px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777', fontWeight: 700, fontSize: '0.9rem', border: '1px solid #fce7f3' }}>
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#6b7280' }}>Payment:</span>
                    <span style={{ fontWeight: 700, color: '#047857' }}>{order.paymentStatus || 'Paid'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Status:</span>
                    <span className={`badge ${getStatusColor(order.orderStatus)}`} style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      {getStatusIcon(order.orderStatus)} {order.orderStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #fce7f3', paddingTop: '1rem' }}>
                <button onClick={() => handleDownloadPDF(order)} className="btn btn-ghost" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                  <Download size={16} style={{ marginRight: '0.4rem' }} /> Invoice
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
