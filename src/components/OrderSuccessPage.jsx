import React from 'react';
import { CheckCircle2, Download, ShoppingBag, ArrowRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderSuccessPage = ({ orderData, setActivePage }) => {
  if (!orderData) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>No recent order found.</h2>
        <button onClick={() => setActivePage('shop')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  const handleDownloadPDF = () => {
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
    doc.text(`INVOICE: ${orderData.orderId}`, 14, 45);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${orderData.timestamp}`, 14, 52);
    doc.text(`Transaction ID: ${orderData.transactionId}`, 14, 58);

    // Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 14, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`${orderData.customer.name}`, 14, 77);
    doc.text(`${orderData.customer.address1}, ${orderData.customer.city} - ${orderData.customer.pincode}`, 14, 83);
    doc.text(`Email: ${orderData.customer.email} | Phone: ${orderData.customer.mobile}`, 14, 89);

    // Items Table
    const tableData = orderData.items.map(item => [
      item.name,
      item.category,
      `INR ${item.price}`,
      item.qty,
      `INR ${item.price * item.qty}`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['Item Name', 'Category', 'Unit Price', 'Qty', 'Total']],
      body: tableData,
      headStyles: { fillStyle: 'F', fillColor: [219, 39, 119], textColor: [255, 255, 255] }
    });

    // Summary calculation
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: INR ${orderData.subtotal.toFixed(2)}`, 140, finalY);
    if (orderData.discount > 0) {
      doc.text(`Discount: -INR ${orderData.discount.toFixed(2)}`, 140, finalY + 6);
    }
    doc.text(`Shipping: INR ${orderData.shippingFee.toFixed(2)}`, 140, finalY + 12);
    doc.text(`Tax (5%): INR ${orderData.tax.toFixed(2)}`, 140, finalY + 18);
    doc.setFontSize(12);
    doc.setTextColor(219, 39, 119);
    doc.text(`Grand Total: INR ${orderData.total.toFixed(2)}`, 140, finalY + 28);

    doc.save(`INZFYER_Invoice_${orderData.orderId}.pdf`);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass glass-card" style={{ background: '#ffffff', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#d1fae5',
          color: '#047857',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 4px 15px rgba(4, 120, 87, 0.2)'
        }}>
          <CheckCircle2 size={46} />
        </div>

        <h1 className="brand-font" style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
          Order Successful!
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.05rem', marginBottom: '2rem' }}>
          Thank you, <strong style={{ color: '#db2777' }}>{orderData.customer.name}</strong>. Your order has been placed and is being carefully wrapped in our signature ribbon box.
        </p>

        <div style={{ background: '#fdf2f8', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left', fontSize: '0.95rem', border: '1px solid #fce7f3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px dashed #f9a8d4', paddingBottom: '0.75rem' }}>
            <span style={{ color: '#6b7280' }}>Order ID:</span>
            <strong style={{ color: '#1f2937' }}>{orderData.orderId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px dashed #f9a8d4', paddingBottom: '0.75rem' }}>
            <span style={{ color: '#6b7280' }}>Payment Status:</span>
            <strong style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Paid via {orderData.paymentMethod}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px dashed #f9a8d4', paddingBottom: '0.75rem' }}>
            <span style={{ color: '#6b7280' }}>Total Paid:</span>
            <strong style={{ color: '#db2777', fontSize: '1.1rem' }}>₹{orderData.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Estimated Delivery:</span>
            <strong style={{ color: '#1f2937' }}>Within 3-4 Business Days</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadPDF} className="btn btn-primary" style={{ padding: '0.85rem 1.5rem', flex: '1 1 auto', minWidth: '200px' }}>
            <Download size={18} style={{ marginRight: '0.5rem' }} /> Download Invoice
          </button>
          <button onClick={() => setActivePage('my-orders')} className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', flex: '1 1 auto', minWidth: '200px' }}>
            <ShoppingBag size={18} style={{ marginRight: '0.5rem' }} /> View My Orders
          </button>
          <button onClick={() => setActivePage('shop')} className="btn btn-ghost" style={{ padding: '0.85rem 1.5rem', flex: '1 1 100%' }}>
            Continue Shopping <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
