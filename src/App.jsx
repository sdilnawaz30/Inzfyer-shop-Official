import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import RefundPolicyPage from './components/RefundPolicyPage';
import ShippingPolicyPage from './components/ShippingPolicyPage';
import TermsPolicyPage from './components/TermsPolicyPage';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanel from './components/AdminPanel';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import { initialProducts } from './data/initialProducts';
import { Plus, ShieldCheck, Lock } from 'lucide-react';

function App() {
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname.replace(/^\/+/, '');
    const validPages = ['home', 'shop', 'wishlist', 'cart', 'checkout', 'order-success', 'my-orders', 'about', 'contact', 'privacy', 'refund', 'shipping', 'terms', 'admin'];
    return validPages.includes(path) ? path : 'home';
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const path = activePage === 'home' ? '/' : `/${activePage}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [activePage]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, '');
      const validPages = ['home', 'shop', 'wishlist', 'cart', 'checkout', 'order-success', 'my-orders', 'about', 'contact', 'privacy', 'refund', 'shipping', 'terms', 'admin'];
      setActivePage(validPages.includes(path) ? path : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

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

  const [salesHistory, setSalesHistory] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

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
    localStorage.setItem('inzfyer-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

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
    setMyOrders(prev => [...prev, orderData]);
    setRecentOrder(orderData);
    
    // Refresh products to get updated stock
    axios.get('/api/products').then(res => {
      if(res.data.success) {
        setProducts(res.data.data);
      }
    });

    setCart([]);
    setAppliedPromo(null);
  };

  // Admin Inventory CRUD
  const handleSaveProduct = async (productData) => {
    try {
      await axios.post('/api/admin/action', { action: 'saveProduct', payload: productData });
      
      if (productToEdit) {
        setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
        showToast(`Updated "${productData.name}"`, 'success');
      } else {
        setProducts(prev => [productData, ...prev]);
        showToast(`Added "${productData.name}" to boutique catalog!`, 'success');
      }
    } catch (err) {
      showToast('Failed to save product. Admin session may have expired.', 'error');
    }
    
    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await axios.post('/api/admin/action', { action: 'deleteProduct', payload: { id } });
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted from inventory', 'info');
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
    
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
        onLogoutAdmin={async () => {
          await axios.post('/api/admin/logout');
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

            {activePage === 'privacy' && (
              <PrivacyPolicyPage setActivePage={setActivePage} />
            )}

            {activePage === 'refund' && (
              <RefundPolicyPage setActivePage={setActivePage} />
            )}

            {activePage === 'shipping' && (
              <ShippingPolicyPage setActivePage={setActivePage} />
            )}

            {activePage === 'terms' && (
              <TermsPolicyPage setActivePage={setActivePage} />
            )}

            {/* Admin Portal Protected Routing */}
            {activePage === 'admin' && (
              isAdmin ? (
                <AdminPanel 
                  products={products}
                  onLogout={async () => {
                    await axios.post('/api/admin/logout');
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
