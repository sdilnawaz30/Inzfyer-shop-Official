import React, { useState } from 'react';
import { CheckCircle2, Download, CreditCard, Gift, MessageCircle, ShieldCheck, X, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CheckoutModal = ({ isOpen, onClose, cart, onCompleteOrder, appliedPromo }) => {
  const [step, setStep] = useState('checkout'); // 'checkout' | 'success'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'UPI'
  });

  const [completedOrderDetails, setCompletedOrderDetails] = useState(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const freeShipping = subtotal >= 1999;
  const shippingFee = freeShipping ? 0 : 149;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax + shippingFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      orderId: `INZ-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleString(),
      customer: formData,
      items: [...cart],
      subtotal,
      discount,
      shippingFee,
      tax,
      total
    };

    // Build WhatsApp message
    const itemLines = cart.map(item => 
      `• ${item.name} (x${item.qty}) — ₹${(item.price * item.qty).toLocaleString('en-IN')}`
    ).join('\n');

    const whatsappMsg = `🛍️ *New Order from INZFYER*\n\n` +
      `*Order ID:* ${orderData.orderId}\n` +
      `*Date:* ${orderData.timestamp}\n\n` +
      `👤 *Customer Details*\n` +
      `Name: ${formData.name}\n` +
      `Phone: ${formData.phone}\n` +
      `Email: ${formData.email}\n` +
      `Address: ${formData.address}, ${formData.city} - ${formData.pincode}\n\n` +
      `📦 *Order Items*\n${itemLines}\n\n` +
      `💰 *Order Summary*\n` +
      `Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n` +
      (discount > 0 ? `Discount: -₹${discount.toLocaleString('en-IN')}\n` : '') +
      `Shipping: ${freeShipping ? 'FREE' : '₹149'}\n` +
      `Tax (5%): ₹${tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n` +
      `*Total: ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}*\n\n` +
      `Payment Method: ${formData.paymentMethod}`;

    const whatsappUrl = `https://wa.me/918295953595?text=${encodeURIComponent(whatsappMsg)}`;
    window.open(whatsappUrl, '_blank');

    setCompletedOrderDetails(orderData);
    onCompleteOrder(orderData);
    setStep('success');
  };

  const handleDownloadPDF = () => {
    if (!completedOrderDetails) return;

    const doc = new jsPDF();
    
    // Brand Header
    doc.setFillColor(219, 39, 119); // #db2777
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('INZFYER - Luxury Toy & Gift Shop', 14, 20);

    // Invoice Meta
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.text(`INVOICE: ${completedOrderDetails.orderId}`, 14, 45);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${completedOrderDetails.timestamp}`, 14, 52);

    // Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 14, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`${completedOrderDetails.customer.name}`, 14, 72);
    doc.text(`${completedOrderDetails.customer.address}, ${completedOrderDetails.customer.city} - ${completedOrderDetails.customer.pincode}`, 14, 78);
    doc.text(`Email: ${completedOrderDetails.customer.email} | Phone: ${completedOrderDetails.customer.phone}`, 14, 84);

    // Items Table
    const tableData = completedOrderDetails.items.map(item => [
      item.name,
      item.category,
      `INR ${item.price}`,
      item.qty,
      `INR ${item.price * item.qty}`
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Item Name', 'Category', 'Unit Price', 'Qty', 'Total']],
      body: tableData,
      headStyles: { fillStyle: 'F', fillColor: [219, 39, 119], textColor: [255, 255, 255] }
    });

    // Summary calculation
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: INR ${completedOrderDetails.subtotal.toFixed(2)}`, 140, finalY);
    if (completedOrderDetails.discount > 0) {
      doc.text(`Discount: -INR ${completedOrderDetails.discount.toFixed(2)}`, 140, finalY + 6);
    }
    doc.text(`Shipping: INR ${completedOrderDetails.shippingFee.toFixed(2)}`, 140, finalY + 12);
    doc.text(`Tax (5%): INR ${completedOrderDetails.tax.toFixed(2)}`, 140, finalY + 18);
    doc.setFontSize(12);
    doc.setTextColor(219, 39, 119);
    doc.text(`Grand Total: INR ${completedOrderDetails.total.toFixed(2)}`, 140, finalY + 28);

    doc.save(`INZFYER_Invoice_${completedOrderDetails.orderId}.pdf`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '650px', padding: '2rem' }}
      >
        <button 
          onClick={onClose} 
          className="wishlist-btn"
          style={{ top: '16px', right: '16px' }}
        >
          <X size={20} />
        </button>

        {step === 'checkout' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #fce7f3', paddingBottom: '0.75rem' }}>
              <CreditCard size={24} color="#db2777" />
              <div>
                <h2 className="brand-font" style={{ fontSize: '1.6rem', color: '#1f2937' }}>Order Checkout</h2>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Complete your purchase in ribbon gift packaging</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Delivery Address</label>
                <input 
                  type="text" 
                  required 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              {/* Payment Method Choice */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {['UPI', 'Credit Card', 'NetBanking', 'Cash on Delivery'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: method})}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: formData.paymentMethod === method ? '2px solid #db2777' : '1px solid #e5e7eb',
                        background: formData.paymentMethod === method ? '#fdf2f8' : '#ffffff',
                        color: formData.paymentMethod === method ? '#db2777' : '#4b5563',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Final Amount & Pay Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #fce7f3' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block' }}>Total Amount</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#db2777' }}>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
                  Confirm & Pay <Sparkles size={18} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#d1fae5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 className="brand-font" style={{ fontSize: '2.2rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              Order Placed Successfully!
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Thank you, <strong>{completedOrderDetails?.customer.name}</strong>! Your order <strong>{completedOrderDetails?.orderId}</strong> has been received and is being wrapped in signature ribbon box.
            </p>

            <div style={{ background: '#fdf2f8', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.75rem', textAlign: 'left', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Total Paid:</span>
                <strong style={{ color: '#db2777' }}>₹{completedOrderDetails?.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Payment Method:</span>
                <strong>{completedOrderDetails?.customer.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Estimated Delivery:</span>
                <strong style={{ color: '#047857' }}>Within 3-4 Business Days</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => {
                const itemLines = completedOrderDetails.items.map(item => 
                  `• ${item.name} (x${item.qty}) — ₹${(item.price * item.qty).toLocaleString('en-IN')}`
                ).join('\n');
                const msg = `🛍️ *INZFYER Order ${completedOrderDetails.orderId}*\n\n📦 *Items*\n${itemLines}\n\n💰 *Total: ₹${completedOrderDetails.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}*\n\nCustomer: ${completedOrderDetails.customer.name}\nPhone: ${completedOrderDetails.customer.phone}`;
                window.open(`https://wa.me/918295953595?text=${encodeURIComponent(msg)}`, '_blank');
              }} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: '#25D366', border: 'none' }}>
                <MessageCircle size={18} /> Send Order via WhatsApp
              </button>
              <button onClick={handleDownloadPDF} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                <Download size={18} /> Download PDF Receipt
              </button>
              <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.75rem 1.5rem' }}>
                Done Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
