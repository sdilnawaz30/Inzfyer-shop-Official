import React from 'react';
import { TrendingUp, Package, AlertTriangle, ShoppingCart, DollarSign, ArrowUpRight } from 'lucide-react';

const Dashboard = ({ products, salesHistory }) => {
  const totalRevenue = salesHistory.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalProductsCount = products.length;
  const lowStockItems = products.filter(p => p.stock < 5);
  const totalSalesCount = salesHistory.length;

  return (
    <div className="animate-fade-in">
      {/* Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Total Revenue */}
        <div className="glass glass-card" style={{ background: '#ffffff', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ backgroundColor: '#fdf2f8', padding: '1rem', borderRadius: '16px', color: '#db2777' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Store Revenue
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#db2777', marginTop: '0.2rem' }}>
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>

        {/* Total Completed Orders */}
        <div className="glass glass-card" style={{ background: '#ffffff', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ backgroundColor: '#f3e8ff', padding: '1rem', borderRadius: '16px', color: '#7e22ce' }}>
            <ShoppingCart size={32} />
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Orders Processed
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7e22ce', marginTop: '0.2rem' }}>
              {totalSalesCount}
            </h3>
          </div>
        </div>

        {/* Catalog Items Count */}
        <div className="glass glass-card" style={{ background: '#ffffff', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '16px', color: '#047857' }}>
            <Package size={32} />
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Catalog Items
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#047857', marginTop: '0.2rem' }}>
              {totalProductsCount}
            </h3>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass glass-card" style={{ background: '#ffffff', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '16px', color: '#f59e0b' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Low Stock Warnings
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
              {lowStockItems.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Grid for Low Stock Alerts & Sales History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>

        {/* Low Stock Items Card */}
        <div className="glass glass-card" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <AlertTriangle color="#f59e0b" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}>
              Stock Replenishment Alerts
            </h3>
          </div>

          {lowStockItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>All catalog products are well-stocked!</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{item.category}</td>
                      <td style={{ fontWeight: 800, color: '#ef4444' }}>{item.stock} left</td>
                      <td>
                        <span className={`badge ${item.stock === 0 ? 'badge-warning' : 'badge-pink'}`}>
                          {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sales History Log */}
        <div className="glass glass-card" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <TrendingUp color="#db2777" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}>
              Recent Sales Log
            </h3>
          </div>

          {salesHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>No completed sales recorded yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID / Time</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...salesHistory].reverse().slice(0, 5).map((sale, idx) => (
                    <tr key={sale.id || idx}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{sale.orderId || `SALE-${sale.id}`}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(sale.timestamp).toLocaleString()}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{sale.itemsCount || 1} items</td>
                      <td style={{ fontWeight: 800, color: '#db2777' }}>
                        ₹{sale.total ? sale.total.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
