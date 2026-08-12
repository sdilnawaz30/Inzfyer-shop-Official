import React, { useState, useRef } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CheckCircle2, Search, Barcode, Printer, Tag, DollarSign, Percent, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PosView = ({ products, onCompleteSale }) => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState('PERCENT'); // PERCENT or FIXED
  const [lastCompletedSale, setLastCompletedSale] = useState(null);

  const barcodeRef = useRef(null);

  // Filter products by search query (name, category, sku)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Barcode scan handler (Triggers when barcode scanner sends Enter key)
  const handleBarcodeScan = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedProduct = products.find(p => 
      (p.sku && p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()) ||
      p.id.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matchedProduct) {
      if (matchedProduct.stock > 0) {
        addToCart(matchedProduct);
        setBarcodeInput('');
      } else {
        alert(`"${matchedProduct.name}" is OUT OF STOCK!`);
      }
    } else {
      alert(`No product found matching Barcode/SKU: ${barcodeInput}`);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          const productInStock = products.find(p => p.id === id)?.stock || 0;
          if (newQty > 0 && newQty <= productInStock) {
            return { ...item, qty: newQty };
          }
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let calculatedDiscount = 0;
  if (discountType === 'PERCENT') {
    calculatedDiscount = (subtotal * (Number(discountAmount) || 0)) / 100;
  } else {
    calculatedDiscount = Number(discountAmount) || 0;
  }
  calculatedDiscount = Math.min(subtotal, calculatedDiscount);

  const discountedSubtotal = Math.max(0, subtotal - calculatedDiscount);
  
  const discountRatio = subtotal > 0 ? calculatedDiscount / subtotal : 0;
  const tax = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.qty;
    const discountedItemTotal = itemTotal * (1 - discountRatio);
    const gstRate = item.gst_rate != null ? Number(item.gst_rate) : 18;
    return sum + (discountedItemTotal * (gstRate / 100));
  }, 0);

  const total = discountedSubtotal + tax;

  // Print Bill / Download Receipt PDF
  const generateReceiptPDF = (saleData) => {
    const doc = new jsPDF();
    
    doc.setFillColor(243, 199, 191);
    doc.rect(0, 0, 210, 32, 'F');
    
    doc.setFont("serif", "bold");
    doc.setFontSize(22);
    doc.setTextColor(166, 58, 75);
    doc.text("INZFYER LUXURY BOUTIQUE", 105, 18, { align: "center" });
    
    doc.setFont("sans-serif", "normal");
    doc.setFontSize(9);
    doc.setTextColor(92, 67, 71);
    doc.text("In-Store Point of Sale Thermal Receipt", 105, 26, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(44, 24, 27);
    doc.text(`Receipt Ref: ${saleData.orderId}`, 14, 42);
    doc.text(`Date & Time: ${new Date(saleData.timestamp).toLocaleString()}`, 14, 48);
    doc.text(`Terminal: POS Counter #01`, 140, 42);

    const tableRows = (saleData.items || []).map((item, index) => [
      index + 1,
      item.name,
      item.sku || `INZ-${item.id.toUpperCase()}`,
      `₹${item.price.toLocaleString('en-IN')}`,
      item.qty,
      `₹${(item.price * item.qty).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['#', 'Item Description', 'SKU', 'Unit Price', 'Qty', 'Amount']],
      body: tableRows,
      headStyles: { fillColor: [166, 58, 75], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`₹${saleData.subtotal.toLocaleString('en-IN')}`, 180, finalY);

    if (saleData.discount > 0) {
      doc.text(`Discount:`, 140, finalY + 6);
      doc.text(`- ₹${saleData.discount.toLocaleString('en-IN')}`, 180, finalY + 6);
    }

    doc.text(`GST Tax:`, 140, finalY + 12);
    doc.text(`₹${Math.round(saleData.tax).toLocaleString('en-IN')}`, 180, finalY + 12);

    doc.setFontSize(12);
    doc.setFont("sans-serif", "bold");
    doc.setTextColor(166, 58, 75);
    doc.text(`TOTAL PAID:`, 140, finalY + 20);
    doc.text(`₹${Math.round(saleData.total).toLocaleString('en-IN')}`, 180, finalY + 20);

    doc.setFontSize(9);
    doc.setFont("sans-serif", "italic");
    doc.setTextColor(148, 117, 122);
    doc.text("Thank you for shopping at INZFYER Luxury Boutique! Handcrafted with Love.", 105, finalY + 36, { align: "center" });

    doc.save(`INZFYER_POS_Receipt_${saleData.orderId}.pdf`);
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      const saleRecord = {
        id: Date.now().toString(),
        orderId: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString(),
        items: [...cart],
        subtotal: subtotal,
        discount: calculatedDiscount,
        tax: tax,
        total: total,
        paymentMethod: 'POS Counter (Cash/Card/UPI)'
      };

      onCompleteSale(cart, saleRecord);
      setLastCompletedSale(saleRecord);
      generateReceiptPDF(saleRecord);
      setCart([]);
      setDiscountAmount(0);
    }
  };

  return (
    <div className="pos-layout animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
      {/* Left Column: Product Search, Barcode Reader & Product Catalog Grid */}
      <div className="glass glass-card" style={{ background: '#ffffff', padding: '1.75rem' }}>
        <h2 className="brand-font" style={{ fontSize: '1.8rem', color: '#2C181B', marginBottom: '1.25rem' }}>
          POS Sales & Billing Terminal
        </h2>

        {/* Barcode Scanner Ready Field & Search Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Barcode Scanner Input */}
          <form onSubmit={handleBarcodeScan} style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8C2E3C', display: 'block', marginBottom: '0.3rem' }}>
              Barcode / SKU Scanner (Ready)
            </label>
            <div style={{ position: 'relative' }}>
              <Barcode size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A63A4B' }} />
              <input 
                ref={barcodeRef}
                type="text" 
                placeholder="Scan barcode or enter SKU..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                style={{ paddingLeft: '38px', fontSize: '0.88rem', borderColor: '#A63A4B', background: '#FFF6F4' }}
              />
            </div>
          </form>

          {/* Keyword Search Input */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5C4347', display: 'block', marginBottom: '0.3rem' }}>
              Search Catalog
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94757A' }} />
              <input 
                type="text" 
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
              />
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94757A' }}>
            <p>No products match your search/barcode.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredProducts.map(product => {
              const outOfStock = product.stock === 0;
              const sku = product.sku || `INZ-${product.id.toUpperCase()}`;
              return (
                <div 
                  key={product.id} 
                  className={`glass glass-card ${outOfStock ? 'disabled' : ''}`}
                  onClick={() => !outOfStock && addToCart(product)}
                  style={{
                    background: outOfStock ? '#FAF0ED' : '#ffffff',
                    cursor: outOfStock ? 'not-allowed' : 'pointer',
                    padding: '0.9rem',
                    border: '1px solid rgba(224, 150, 137, 0.35)',
                    opacity: outOfStock ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94757A', fontFamily: 'monospace', fontWeight: 600 }}>{sku}</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#2C181B', margin: '0.2rem 0' }}>
                      {product.name}
                    </h3>
                    <span className={`badge ${outOfStock ? 'badge-warning' : 'badge-pink'}`} style={{ fontSize: '0.68rem' }}>
                      {outOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#A63A4B' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {!outOfStock && (
                      <button className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', borderRadius: '50%' }}>
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: POS Counter Cart & Billing */}
      <div className="glass glass-card" style={{ background: '#ffffff', padding: '1.75rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h2 className="brand-font" style={{ fontSize: '1.6rem', color: '#2C181B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart color="#A63A4B" size={24} /> Billing Counter
        </h2>

        {lastCompletedSale && cart.length === 0 && (
          <div style={{ background: '#d1fae5', padding: '0.85rem', borderRadius: '14px', marginBottom: '1rem', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#047857' }}>
            <CheckCircle2 size={18} /> Receipt Printed ({lastCompletedSale.orderId})
          </div>
        )}

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94757A', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <ShoppingCart size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem' }}>Scan barcode or click items to add to billing cart.</p>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', paddingRight: '0.25rem', marginBottom: '1rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#FAF0ED', borderRadius: '12px', border: '1px solid rgba(224, 150, 137, 0.25)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2C181B' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#A63A4B' }}>
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button onClick={() => updateQty(item.id, -1)} className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginLeft: '0.25rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount & Billing Calculation Controls */}
            <div style={{ borderTop: '1px solid #F8D7D0', paddingTop: '1rem' }}>
              {/* Discount Input */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2C181B', display: 'block', marginBottom: '0.25rem' }}>
                  Apply Counter Discount
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Discount..."
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                  />
                  <select 
                    value={discountType} 
                    onChange={(e) => setDiscountType(e.target.value)}
                    style={{ width: '90px', fontSize: '0.82rem', padding: '0.45rem' }}
                  >
                    <option value="PERCENT">% Off</option>
                    <option value="FIXED">₹ Off</option>
                  </select>
                </div>
              </div>

              {/* Subtotal, Tax, Discount & Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#5C4347', marginBottom: '0.25rem' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {calculatedDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#047857', marginBottom: '0.25rem', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>- ₹{calculatedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#5C4347', marginBottom: '0.75rem' }}>
                <span>GST Tax</span>
                <span>₹{Math.round(tax).toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#A63A4B', marginBottom: '1.25rem' }}>
                <span>Total Amount</span>
                <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>

              <button 
                onClick={handleCheckout}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
              >
                <Printer size={18} /> Print Bill & Deduct Stock
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PosView;
