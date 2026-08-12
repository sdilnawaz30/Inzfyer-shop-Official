import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Package, MapPin, CreditCard, Clock, Download, CheckCircle, Truck, FileText } from 'lucide-react';
import { generateAndDownloadInvoice } from '../utils/invoiceGenerator';
import axios from 'axios';

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusChange, showToast }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      const fetchItems = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
            
          if (error) throw error;
          setItems(data || []);
        } catch (error) {
          console.error("Error fetching order items:", error);
          showToast("Failed to load order items.", "error");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchItems();
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await axios.post('/api/admin/update-order-status', 
        { orderId: order.order_number, newStatus },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      
      if (response.data.success) {
        showToast(`Order marked as ${newStatus}`, "success");
        onStatusChange(order.id, newStatus);
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to update order status", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadInvoice = () => {
    // Reconstruct data structure expected by invoiceGenerator
    const invoiceData = {
      order: {
        orderNumber: order.order_number,
        createdAt: order.created_at,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        subtotal: order.subtotal,
        shippingCharge: order.shipping_charge,
        discount: order.discount,
        finalTotal: order.final_total,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
      },
      items: items.map(item => ({
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.subtotal
      }))
    };
    
    try {
      generateAndDownloadInvoice(invoiceData);
    } catch (e) {
      showToast("Failed to generate invoice", "error");
    }
  };

  const statusOptions = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
    }}>
      <div className="modal-content animate-fade-in glass glass-card" style={{
        background: '#ffffff', width: '100%', maxWidth: '800px',
        maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px', padding: 0
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #fce7f3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Order {order.order_number}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={handleDownloadInvoice} className="btn btn-ghost" style={{ padding: '0.5rem', color: '#db2777' }} title="Download Invoice">
              <Download size={20} />
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Top Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Customer & Shipping */}
            <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} /> Customer & Shipping
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                <strong>{order.customer_name}</strong><br/>
                {order.customer_email}<br/>
                {order.customer_phone}<br/>
                <div style={{ marginTop: '0.5rem', color: '#4b5563', lineHeight: 1.4 }}>
                  {order.shipping_address}<br/>
                  {order.city}, {order.state} - {order.pincode}
                </div>
              </div>
            </div>

            {/* Payment & Status */}
            <div style={{ background: '#fdf2f8', padding: '1.25rem', borderRadius: '12px', border: '1px solid #fce7f3' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9d174d', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={16} /> Payment & Status
              </h3>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Method:</span> <strong style={{ color: '#1f2937' }}>{order.payment_method}</strong>
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Payment:</span> <span className={`badge ${order.payment_status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>{order.payment_status}</span>
              </div>
              <div style={{ fontSize: '0.9rem', marginTop: '1rem', borderTop: '1px dashed #fbcfe8', paddingTop: '1rem' }}>
                <span style={{ color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>Update Order Status:</span>
                <select 
                  value={order.order_status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  style={{
                    width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #f472b6',
                    background: '#fff', color: '#9d174d', fontWeight: 600, outline: 'none'
                  }}
                >
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            
          </div>

          {/* Order Items */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} /> Order Items
          </h3>
          
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading items...</div>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', color: '#4b5563' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Price</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#1f2937' }}>
                        {item.product_name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#4b5563' }}>
                        ₹{Number(item.unit_price).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#1f2937' }}>
                        ₹{Number(item.subtotal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '1rem', background: '#fdf2f8', borderTop: '1px solid #fce7f3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#4b5563' }}>
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#4b5563' }}>
                  <span>Shipping</span>
                  <span>₹{Number(order.shipping_charge).toLocaleString('en-IN')}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#059669' }}>
                    <span>Discount</span>
                    <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #fbcfe8', fontSize: '1.1rem', fontWeight: 700, color: '#9d174d' }}>
                  <span>Grand Total</span>
                  <span>₹{Number(order.final_total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Order Timeline Visualizer */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Fulfillment Timeline
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '1rem 0' }}>
             <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: '#e5e7eb', zIndex: 0, transform: 'translateY(-50%)' }}></div>
             
             {['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].map((step, index) => {
               const statusOrder = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
               const currentIndex = statusOrder.indexOf(order.order_status);
               const stepIndex = statusOrder.indexOf(step);
               const isCompleted = currentIndex >= stepIndex;
               
               let icon = <CheckCircle size={16} />;
               if (step === 'PACKED') icon = <Package size={16} />;
               if (step === 'SHIPPED') icon = <Truck size={16} />;
               if (step === 'DELIVERED') icon = <MapPin size={16} />;
               
               return (
                 <div key={step} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '0 0.5rem' }}>
                   <div style={{ 
                     width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                     background: isCompleted ? '#10b981' : '#f3f4f6', color: isCompleted ? '#fff' : '#9ca3af',
                     border: `2px solid ${isCompleted ? '#10b981' : '#e5e7eb'}`, transition: 'all 0.3s ease'
                   }}>
                     {icon}
                   </div>
                   <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem', color: isCompleted ? '#1f2937' : '#9ca3af' }}>{step}</span>
                 </div>
               )
             })}
          </div>
          {(order.order_status === 'CANCELLED' || order.order_status === 'REFUNDED') && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
              This order was {order.order_status}.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
