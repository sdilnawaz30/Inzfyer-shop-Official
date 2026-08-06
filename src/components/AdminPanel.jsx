import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Boxes, 
  Settings, 
  LogOut, 
  DollarSign, 
  AlertTriangle, 
  Search, 
  Plus, 
  Download, 
  CheckCircle, 
  TrendingUp,
  ShieldCheck,
  Edit,
  Trash2,
  Filter,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Printer
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import PosView from './PosView';

const AdminPanel = ({ 
  onLogout,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockInAmount, setStockInAmount] = useState(10);
  const [products, setProducts] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('/api/admin/data');
        if (response.data.success) {
          setProducts(response.data.products);
          setSalesHistory(response.data.orders);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          showToast('Session expired. Please log in again.', 'error');
          onLogout();
        } else {
          showToast('Failed to load admin data', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, [onLogout, showToast]);

  // Calculated Metrics for Glass Cards
  const totalProducts = products.length;
  const totalOrders = salesHistory.length;
  const totalRevenue = salesHistory.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const lowStockItems = products.filter(p => p.stock < 5);

  // Mock Customers Data generated from sales
  const customers = [
    { id: 'CUST-101', name: 'Sophia Rodriguez', email: 'sophia.r@gmail.com', phone: '+91 98765 43210', ordersCount: 4, totalSpent: 7896, vip: true },
    { id: 'CUST-102', name: 'Aarav Mehta', email: 'aarav.m@outlook.com', phone: '+91 98123 45678', ordersCount: 2, totalSpent: 3998, vip: false },
    { id: 'CUST-103', name: 'Clara Kapoor', email: 'clara.k@yahoo.com', phone: '+91 99887 76655', ordersCount: 3, totalSpent: 6297, vip: true },
    { id: 'CUST-104', name: 'Ananya Sharma', email: 'ananya.s@gmail.com', phone: '+91 97654 32109', ordersCount: 1, totalSpent: 1899, vip: false },
  ];

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'INZFYER Luxury Gifts',
    contactEmail: 'admin@inzfyer.com',
    currency: 'INR (₹)',
    freeShippingMin: 1999,
    taxRate: 5,
    enableCod: true,
  });

  const sidebarItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'POS', label: 'POS Terminal', icon: Printer },
    { id: 'Products', label: 'Products', icon: Package, badge: totalProducts },
    { id: 'Orders', label: 'Orders', icon: ShoppingCart, badge: totalOrders },
    { id: 'Customers', label: 'Customers', icon: Users, badge: customers.length },
    { id: 'Inventory', label: 'Inventory (Stock)', icon: Boxes, badge: lowStockItems.length > 0 ? `${lowStockItems.length} Low` : null },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Loading Admin Portal securely...</div>;
  }

  return (
    <div className="animate-fade-in" style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: '2rem',
      minHeight: '80vh',
      alignItems: 'start'
    }}>
      {/* Sidebar Navigation - Glass UI */}
      <aside className="glass glass-card" style={{
        padding: '1.75rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.92)',
        position: 'sticky',
        top: '90px'
      }}>
        {/* Brand Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(224, 150, 137, 0.3)' }}>
          <img 
            src={logoImg} 
            alt="Logo" 
            style={{ height: '42px', width: 'auto', borderRadius: '10px', objectFit: 'contain', padding: '2px 6px', background: '#fff', border: '1px solid rgba(224, 150, 137, 0.4)' }} 
          />
          <div>
            <h2 className="brand-font" style={{ fontSize: '1.3rem', color: '#A63A4B', lineHeight: '1' }}>INZFYER</h2>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#8C2E3C', letterSpacing: '0.1em' }}>ADMIN PORTAL</span>
          </div>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '2rem' }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #A63A4B 0%, #8C2E3C 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : '#5C4347',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} color={isActive ? '#ffffff' : '#A63A4B'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#F8D7D0',
                    color: isActive ? '#ffffff' : '#8C2E3C'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(224, 150, 137, 0.3)' }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(254, 242, 242, 0.8)',
              color: '#dc2626',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div>
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-pink" style={{ marginBottom: '0.4rem' }}>
              <ShieldCheck size={14} /> Authenticated Admin Session
            </span>
            <h1 className="brand-font" style={{ fontSize: '2.4rem', color: '#2C181B' }}>
              {activeTab} Management
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#5C4347', fontWeight: 600 }}>Logged in as: admin@inzfyer.com</span>
          </div>
        </div>

        {/* VIEW 1: DASHBOARD TAB */}
        {activeTab === 'Dashboard' && (
          <div>
            {/* 4 Premium Glass Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {/* Card 1: Total Products */}
              <div className="glass glass-card" style={{ background: 'rgba(255, 255, 255, 0.92)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8C2E3C', textTransform: 'uppercase' }}>Total Products</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8D7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A63A4B' }}>
                    <Package size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2C181B' }}>{totalProducts}</div>
                <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.4rem' }}>
                  <TrendingUp size={14} /> Active catalog items
                </span>
              </div>

              {/* Card 2: Total Orders */}
              <div className="glass glass-card" style={{ background: 'rgba(255, 255, 255, 0.92)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8C2E3C', textTransform: 'uppercase' }}>Total Orders</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8D7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A63A4B' }}>
                    <ShoppingCart size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2C181B' }}>{totalOrders}</div>
                <span style={{ fontSize: '0.78rem', color: '#5C4347', fontWeight: 600, marginTop: '0.4rem', display: 'block' }}>
                  Completed & pending orders
                </span>
              </div>

              {/* Card 3: Total Revenue */}
              <div className="glass glass-card" style={{ background: 'rgba(255, 255, 255, 0.92)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8C2E3C', textTransform: 'uppercase' }}>Total Revenue</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8D7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A63A4B' }}>
                    <DollarSign size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#A63A4B' }}>
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, marginTop: '0.4rem', display: 'block' }}>
                  Gross sales earnings
                </span>
              </div>

              {/* Card 4: Low Stock Alert */}
              <div className="glass glass-card" style={{ background: 'rgba(255, 255, 255, 0.92)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8C2E3C', textTransform: 'uppercase' }}>Low Stock Items</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                    <AlertTriangle size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: lowStockItems.length > 0 ? '#d97706' : '#047857' }}>
                  {lowStockItems.length}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#5C4347', fontWeight: 600, marginTop: '0.4rem', display: 'block' }}>
                  {lowStockItems.length > 0 ? 'Requires immediate restock' : 'All stock levels healthy'}
                </span>
              </div>
            </div>

            {/* Recent Orders Log Table */}
            <div className="glass glass-card" style={{ background: '#ffffff' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2C181B', marginBottom: '1.25rem' }}>Recent Order Activity</h3>
              {salesHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94757A' }}>
                  <ShoppingCart size={42} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.95rem' }}>No checkout transactions recorded yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #F8D7D0', textAlign: 'left', color: '#8C2E3C' }}>
                        <th style={{ padding: '0.85rem' }}>Order ID</th>
                        <th style={{ padding: '0.85rem' }}>Customer</th>
                        <th style={{ padding: '0.85rem' }}>Payment</th>
                        <th style={{ padding: '0.85rem' }}>Total Amount</th>
                        <th style={{ padding: '0.85rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesHistory.slice(-5).reverse().map((sale, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F8D7D0' }}>
                          <td style={{ padding: '0.85rem', fontWeight: 700, color: '#A63A4B' }}>{sale.orderId || `ORD-${idx+1001}`}</td>
                          <td style={{ padding: '0.85rem' }}>{sale.customerName || 'Boutique Guest'}</td>
                          <td style={{ padding: '0.85rem', textTransform: 'uppercase' }}>{sale.paymentMethod || 'UPI'}</td>
                          <td style={{ padding: '0.85rem', fontWeight: 700, color: '#2C181B' }}>₹{sale.total?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '0.85rem' }}>
                            <span className="badge badge-success"><CheckCircle size={12} /> Paid & Processed</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: POS TERMINAL TAB */}
        {activeTab === 'POS' && (
          <PosView 
            products={products} 
            onCompleteSale={(cartItems, saleRecord) => {
              salesHistory.push(saleRecord);
              cartItems.forEach(item => {
                onUpdateStock(item.id, Math.max(0, item.stock - item.qty));
              });
            }} 
          />
        )}

        {/* VIEW 3: PRODUCTS TAB */}
        {activeTab === 'Products' && (
          <div className="glass glass-card" style={{ background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '480px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94757A' }} />
                  <input
                    type="text"
                    placeholder="Search product catalog..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '34px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <button onClick={() => onSaveProduct()} className="btn btn-primary">
                <Plus size={18} /> Add Product
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F8D7D0', textAlign: 'left', color: '#8C2E3C' }}>
                    <th style={{ padding: '0.85rem' }}>Product</th>
                    <th style={{ padding: '0.85rem' }}>SKU</th>
                    <th style={{ padding: '0.85rem' }}>Category</th>
                    <th style={{ padding: '0.85rem' }}>Price</th>
                    <th style={{ padding: '0.85rem' }}>Stock</th>
                    <th style={{ padding: '0.85rem' }}>Rating</th>
                    <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F8D7D0' }}>
                        <td style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={p.image} alt={p.name} style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 700, color: '#2C181B' }}>{p.name}</span>
                        </td>
                        <td style={{ padding: '0.85rem', fontFamily: 'monospace', color: '#5C4347' }}>{p.sku || `INZ-${p.id}`}</td>
                        <td style={{ padding: '0.85rem', color: '#8C2E3C', fontWeight: 600 }}>{p.category}</td>
                        <td style={{ padding: '0.85rem', fontWeight: 800, color: '#A63A4B' }}>₹{p.price.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '0.85rem' }}>
                          <span className={`badge ${p.stock < 5 ? 'badge-warning' : 'badge-pink'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem' }}>⭐ {p.rating}</td>
                        <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                          <button onClick={() => onSaveProduct(p)} className="btn btn-ghost" style={{ padding: '0.35rem 0.65rem', marginRight: '0.4rem' }}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => onDeleteProduct(p)} className="btn btn-ghost" style={{ padding: '0.35rem 0.65rem', color: '#ef4444' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: ORDERS TAB */}
        {activeTab === 'Orders' && (
          <div className="glass glass-card" style={{ background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2C181B', marginBottom: '1.25rem' }}>Customer Orders Log</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F8D7D0', textAlign: 'left', color: '#8C2E3C' }}>
                    <th style={{ padding: '0.85rem' }}>Order Ref</th>
                    <th style={{ padding: '0.85rem' }}>Date</th>
                    <th style={{ padding: '0.85rem' }}>Customer & Shipping</th>
                    <th style={{ padding: '0.85rem' }}>Payment / Txn ID</th>
                    <th style={{ padding: '0.85rem' }}>Total</th>
                    <th style={{ padding: '0.85rem' }}>Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.slice().reverse().map((order, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F8D7D0', verticalAlign: 'top' }}>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: '#A63A4B' }}>{order.orderId || `ORD-${idx+1001}`}</td>
                      <td style={{ padding: '0.85rem', color: '#5C4347' }}>{order.timestamp || 'Today'}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ fontWeight: 600 }}>{order.customer?.name || order.customerName || 'Boutique Guest'}</div>
                        {order.customer && (
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem', lineHeight: '1.4' }}>
                            {order.customer.address1}<br/>
                            {order.customer.city} - {order.customer.pincode}<br/>
                            {order.customer.mobile}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ fontWeight: 600, color: '#047857' }}>{order.paymentStatus || 'Paid'} via {order.paymentMethod || 'UPI'}</div>
                        {order.transactionId && (
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                            Txn: {order.transactionId}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem', fontWeight: 800, color: '#2C181B' }}>₹{order.total?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <select 
                          value={order.orderStatus || 'Pending'}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            setSalesHistory(prev => prev.map(o => o.orderId === order.orderId ? { ...o, orderStatus: newStatus } : o));
                            await axios.post('/api/admin/action', { action: 'updateOrderStatus', payload: { orderId: order.orderId, status: newStatus } });
                            showToast(`Order ${order.orderId} marked as ${newStatus}`, 'success');
                          }}
                          style={{
                            padding: '0.4rem',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            fontSize: '0.85rem',
                            backgroundColor: '#fdf2f8',
                            color: '#A63A4B',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 5: CUSTOMERS TAB */}
        {activeTab === 'Customers' && (
          <div className="glass glass-card" style={{ background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2C181B', marginBottom: '1.25rem' }}>Boutique Customer Profiles</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F8D7D0', textAlign: 'left', color: '#8C2E3C' }}>
                    <th style={{ padding: '0.85rem' }}>Customer</th>
                    <th style={{ padding: '0.85rem' }}>Email</th>
                    <th style={{ padding: '0.85rem' }}>Phone</th>
                    <th style={{ padding: '0.85rem' }}>Orders</th>
                    <th style={{ padding: '0.85rem' }}>Total Spent</th>
                    <th style={{ padding: '0.85rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F8D7D0' }}>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: '#2C181B' }}>{c.name}</td>
                      <td style={{ padding: '0.85rem', color: '#5C4347' }}>{c.email}</td>
                      <td style={{ padding: '0.85rem', color: '#5C4347' }}>{c.phone}</td>
                      <td style={{ padding: '0.85rem', fontWeight: 700 }}>{c.ordersCount} Orders</td>
                      <td style={{ padding: '0.85rem', fontWeight: 800, color: '#A63A4B' }}>₹{c.totalSpent.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem' }}>
                        {c.vip ? (
                          <span className="badge badge-purple"><Sparkles size={12} /> VIP Collector</span>
                        ) : (
                          <span className="badge badge-pink">Regular</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 6: INVENTORY TAB (STOCK IN, STOCK OUT, LOW STOCK ALERTS) */}
        {activeTab === 'Inventory' && (
          <div className="glass glass-card" style={{ background: '#ffffff', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2C181B' }}>
                  Live Stock Control & Inventory Replenishment
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#5C4347' }}>
                  Manage Stock In (Receiving), Stock Out (Deduction/Damages), and Low Stock Alerts.
                </p>
              </div>
            </div>

            {/* Low Stock Warning Section */}
            {lowStockItems.length > 0 && (
              <div style={{
                background: '#fffbeb',
                border: '1.5px solid #f59e0b',
                borderRadius: '18px',
                padding: '1.25rem',
                marginBottom: '1.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <AlertTriangle size={20} />
                  <span>Low Stock Warning Alert ({lowStockItems.length} Products Require Restock)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {lowStockItems.map(item => (
                    <div key={item.id} style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2C181B' }}>{item.name}</div>
                        <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>Only {item.stock} units left!</span>
                      </div>
                      <button 
                        onClick={async () => {
                           const newStock = item.stock + 10;
                           setProducts(prev => prev.map(p => p.id === item.id ? { ...p, stock: newStock } : p));
                           await axios.post('/api/admin/action', { action: 'updateStock', payload: { id: item.id, stock: newStock } });
                           showToast('Stock level updated!', 'success');
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        +10 Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Stock Table with Stock In & Stock Out Actions */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F8D7D0', textAlign: 'left', color: '#8C2E3C' }}>
                    <th style={{ padding: '0.85rem' }}>Product Item</th>
                    <th style={{ padding: '0.85rem' }}>SKU</th>
                    <th style={{ padding: '0.85rem' }}>Current Stock</th>
                    <th style={{ padding: '0.85rem' }}>Stock Status</th>
                    <th style={{ padding: '0.85rem', textAlign: 'center' }}>Stock In (+)</th>
                    <th style={{ padding: '0.85rem', textAlign: 'center' }}>Stock Out (-)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F8D7D0' }}>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: '#2C181B' }}>{p.name}</td>
                      <td style={{ padding: '0.85rem', fontFamily: 'monospace', color: '#5C4347' }}>{p.sku || `INZ-${p.id}`}</td>
                      <td style={{ padding: '0.85rem', fontWeight: 800, color: '#A63A4B', fontSize: '1rem' }}>{p.stock} units</td>
                      <td style={{ padding: '0.85rem' }}>
                        <span className={`badge ${p.stock < 5 ? 'badge-warning' : 'badge-success'}`}>
                          {p.stock < 5 ? 'Low Stock' : 'Healthy Stock'}
                        </span>
                      </td>

                      {/* Stock In Controls */}
                      <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button 
                            onClick={async () => {
                              const newStock = p.stock + 1;
                              setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock: newStock } : prod));
                              await axios.post('/api/admin/action', { action: 'updateStock', payload: { id: p.id, stock: newStock } });
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderColor: '#047857', color: '#047857' }}
                            title="Add 1 Unit"
                          >
                            <ArrowUpRight size={14} /> +1
                          </button>
                          <button 
                            onClick={async () => {
                              const newStock = p.stock + 10;
                              setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock: newStock } : prod));
                              await axios.post('/api/admin/action', { action: 'updateStock', payload: { id: p.id, stock: newStock } });
                            }}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', background: '#047857', borderColor: '#047857' }}
                            title="Add 10 Units Batch"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Stock Out Controls */}
                      <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button 
                            onClick={async () => {
                              const newStock = Math.max(0, p.stock - 1);
                              setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock: newStock } : prod));
                              await axios.post('/api/admin/action', { action: 'updateStock', payload: { id: p.id, stock: newStock } });
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderColor: '#dc2626', color: '#dc2626' }}
                            title="Deduct 1 Unit"
                          >
                            <ArrowDownRight size={14} /> -1
                          </button>
                          <button 
                            onClick={async () => {
                              const newStock = Math.max(0, p.stock - 5);
                              setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock: newStock } : prod));
                              await axios.post('/api/admin/action', { action: 'updateStock', payload: { id: p.id, stock: newStock } });
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#dc2626' }}
                            title="Deduct 5 Units"
                          >
                            -5
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 7: SETTINGS TAB */}
        {activeTab === 'Settings' && (
          <div className="glass glass-card" style={{ background: '#ffffff', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2C181B', marginBottom: '1.5rem' }}>Boutique Operational Settings</h3>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              showToast('Store settings updated successfully!', 'success'); 
            }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Store Brand Name</label>
                <input 
                  type="text" 
                  value={storeSettings.storeName} 
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Admin Support Email</label>
                <input 
                  type="email" 
                  value={storeSettings.contactEmail} 
                  onChange={(e) => setStoreSettings({ ...storeSettings, contactEmail: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Free Shipping Minimum (₹)</label>
                  <input 
                    type="number" 
                    value={storeSettings.freeShippingMin} 
                    onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingMin: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">GST Tax Rate (%)</label>
                  <input 
                    type="number" 
                    value={storeSettings.taxRate} 
                    onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F8D7D0' }}>
                <span style={{ fontSize: '0.85rem', color: '#5C4347', display: 'block' }}>
                  Notice: Admin Password management has been moved to secure environment variables (`ADMIN_PASSWORD`).
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
