import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import HomePage from './components/HomePage';
import ShopPage from './components/ShopPage';
import ProductDetailPage from './components/ProductDetailPage';
import CartView from './components/CartView';
import CheckoutPage from './components/CheckoutPage';
import OrderSuccessPage from './components/OrderSuccessPage';
import MyOrdersPage from './components/MyOrdersPage';
import WishlistView from './components/WishlistView';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanel from './components/AdminPanel';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import { initialProducts } from './data/initialProducts';
import { Plus, ShieldCheck, Lock } from 'lucide-react';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persisted state
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('inzfyer-products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse products', err);
      }
    }
    return initialProducts;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('inzfyer-cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse cart', err);
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('inzfyer-wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse wishlist', err);
      }
    }
    return [];
  });

  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('inzfyer-sales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse sales history', err);
      }
    }
    return [];
  });

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('inzfyer-admin-password') || 'admin123';
  });

  const [myOrders, setMyOrders] = useState(() => {
    const saved = localStorage.getItem('inzfyer-my-orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse my orders', err);
      }
    }
    return [];
  });

  const [recentOrder, setRecentOrder] = useState(null);

  const [appliedPromo, setAppliedPromo] = useState(null);

  // Admin & Modals
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);

  // Admin inventory CRUD modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('inzfyer-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inzfyer-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('inzfyer-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('inzfyer-sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  useEffect(() => {
    localStorage.setItem('inzfyer-admin-password', adminPassword);
  }, [adminPassword]);

  useEffect(() => {
    localStorage.setItem('inzfyer-my-orders', JSON.stringify(myOrders));
  }, [myOrders]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Cart operations
  const handleAddToCart = (productToAdd) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productToAdd.id);
      const qtyToAdd = productToAdd.qty || 1;
      if (existing) {
        return prev.map(item => 
          item.id === productToAdd.id 
            ? { ...item, qty: item.qty + qtyToAdd, giftNote: productToAdd.giftNote || item.giftNote }
            : item
        );
      }
      return [...prev, { ...productToAdd, qty: qtyToAdd }];
    });
    showToast(`Added "${productToAdd.name}" to shopping cart!`, 'cart');
  };

  const handleBuyNow = (productToBuy) => {
    handleAddToCart(productToBuy);
    setSelectedProductForDetail(null);
    setActivePage('checkout');
  };

  const handleUpdateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
    }
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Item removed from cart', 'info');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Shopping cart cleared', 'info');
  };

  // Wishlist operations
  const handleToggleWishlist = (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      showToast(`Removed "${product.name}" from wishlist`, 'info');
    } else {
      setWishlist(prev => [...prev, product]);
      showToast(`Saved "${product.name}" to wishlist!`, 'wishlist');
    }
  };

  const handleRemoveFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
    showToast('Removed from wishlist', 'info');
  };

  // Checkout completion
  const handleCompleteCheckout = (orderData) => {
    setSalesHistory(prev => [...prev, orderData]);
    setMyOrders(prev => [...prev, orderData]);
    setRecentOrder(orderData);
    
    setProducts(prev => prev.map(p => {
      const cartItem = orderData.items.find(ci => ci.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      }
      return p;
    }));

    setCart([]);
    setAppliedPromo(null);
  };

  // Admin Inventory CRUD
  const handleSaveProduct = (productData) => {
    if (productToEdit) {
      setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
      showToast(`Updated "${productData.name}"`, 'success');
    } else {
      setProducts(prev => [productData, ...prev]);
      showToast(`Added "${productData.name}" to boutique catalog!`, 'success');
    }
    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  const handleDeleteConfirm = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted from inventory', 'info');
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header 
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setSelectedProductForDetail(null);
        }}
        cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdmin={isAdmin}
        setIsAdminModalOpen={setIsAdminModalOpen}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          setActivePage('home');
          showToast('Logged out of Admin Portal', 'info');
        }}
      />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, maxWidth: '1300px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }} className="app-content">
        {selectedProductForDetail ? (
          <ProductDetailPage 
            product={selectedProductForDetail}
            products={products}
            onClose={() => setSelectedProductForDetail(null)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            onSelectProduct={(p) => {
              setSelectedProductForDetail(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            {activePage === 'home' && (
              <HomePage 
                products={products}
                setActivePage={setActivePage}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                onSelectProduct={(p) => {
                  setSelectedProductForDetail(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activePage === 'shop' && (
              <ShopPage 
                products={products}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                onSelectProduct={(p) => {
                  setSelectedProductForDetail(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {activePage === 'wishlist' && (
              <WishlistView 
                wishlist={wishlist}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                onAddToCart={handleAddToCart}
                setActivePage={setActivePage}
                onSelectProduct={(p) => {
                  setSelectedProductForDetail(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activePage === 'cart' && (
              <CartView 
                cart={cart}
                onUpdateQty={handleUpdateCartQty}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                setActivePage={setActivePage}
                appliedPromo={appliedPromo}
                setAppliedPromo={setAppliedPromo}
                showToast={showToast}
              />
            )}

            {activePage === 'checkout' && (
              <CheckoutPage 
                cart={cart}
                onCompleteCheckout={handleCompleteCheckout}
                setActivePage={setActivePage}
                appliedPromo={appliedPromo}
              />
            )}

            {activePage === 'order-success' && (
              <OrderSuccessPage 
                orderData={recentOrder}
                setActivePage={setActivePage}
              />
            )}

            {activePage === 'my-orders' && (
              <MyOrdersPage 
                myOrders={myOrders}
                salesHistory={salesHistory}
                setActivePage={setActivePage}
              />
            )}

            {activePage === 'about' && (
              <AboutPage setActivePage={setActivePage} />
            )}

            {activePage === 'contact' && (
              <ContactPage showToast={showToast} />
            )}

            {/* Admin Portal Protected Routing */}
            {activePage === 'admin' && (
              isAdmin ? (
                <AdminPanel 
                  products={products}
                  salesHistory={salesHistory}
                  adminPassword={adminPassword}
                  setAdminPassword={setAdminPassword}
                  onSaveProduct={(prod) => {
                    setProductToEdit(prod || null);
                    setIsProductModalOpen(true);
                  }}
                  onDeleteProduct={(prod) => {
                    setProductToDelete(prod);
                    setIsDeleteModalOpen(true);
                  }}
                  onUpdateStock={(id, newStock) => {
                    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
                    showToast('Stock level updated!', 'success');
                  }}
                  onUpdateOrderStatus={(orderId, newStatus) => {
                    setSalesHistory(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
                    showToast(`Order ${orderId} marked as ${newStatus}`, 'success');
                  }}
                  onLogout={() => {
                    setIsAdmin(false);
                    setActivePage('home');
                    showToast('Logged out of Admin Portal', 'info');
                  }}
                  showToast={showToast}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', maxWidth: '500px', margin: '0 auto' }} className="glass glass-card">
                  <Lock size={48} color="#A63A4B" style={{ marginBottom: '1rem' }} />
                  <h2 className="brand-font" style={{ fontSize: '2rem', color: '#2C181B', marginBottom: '0.5rem' }}>
                    Admin Authentication Required
                  </h2>
                  <p style={{ color: '#5C4347', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Only authorized administrators can access the INZFYER Control Center and inventory analytics.
                  </p>
                  <button onClick={() => setIsAdminModalOpen(true)} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
                    Open Admin Login Modal
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} showToast={showToast} />

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setSelectedProductForDetail(null);
        }}
        cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
        wishlistCount={wishlist.length}
        isAdmin={isAdmin}
      />

      {/* Modals */}

      <AdminLoginModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminPassword={adminPassword}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setActivePage('admin');
          showToast('Welcome to INZFYER Admin Portal!', 'success');
        }}
      />

      <ProductModal 
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
