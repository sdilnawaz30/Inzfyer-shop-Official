import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { supabase } from './lib/supabase';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import Toast from './components/Toast';
import { Lock, Loader2 } from 'lucide-react';

// Lazy load route components for code-splitting
const HomePage = lazy(() => import('./components/HomePage'));
const ShopPage = lazy(() => import('./components/ShopPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
const CartView = lazy(() => import('./components/CartView'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./components/OrderSuccessPage'));
const MyOrdersPage = lazy(() => import('./components/MyOrdersPage'));
const WishlistView = lazy(() => import('./components/WishlistView'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const RefundPolicyPage = lazy(() => import('./components/RefundPolicyPage'));
const ShippingPolicyPage = lazy(() => import('./components/ShippingPolicyPage'));
const TermsPolicyPage = lazy(() => import('./components/TermsPolicyPage'));
const AdminLoginModal = lazy(() => import('./components/AdminLoginModal'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

function App() {
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname.replace(/^\/+/, '');
    const validPages = ['home', 'shop', 'wishlist', 'cart', 'checkout', 'order-success', 'my-orders', 'about', 'contact', 'privacy', 'refund', 'shipping', 'terms', 'admin'];
    return validPages.includes(path) ? path : 'home';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  useEffect(() => {
    const checkUser = async (session) => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (!error && data?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      checkUser(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('inzfyer-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Cart operations
  const handleAddToCart = useCallback((productToAdd) => {
    const existing = cart.find(item => item.id === productToAdd.id);
    const qtyToAdd = productToAdd.qty || 1;
    const newQty = existing ? existing.qty + qtyToAdd : qtyToAdd;

    if (productToAdd.stock !== undefined && newQty > productToAdd.stock) {
      showToast(`Cannot add more. Only ${productToAdd.stock} in stock.`, 'warning');
      return;
    }

    setCart(prev => {
      const innerExisting = prev.find(item => item.id === productToAdd.id);
      if (innerExisting) {
        return prev.map(item => 
          item.id === productToAdd.id 
            ? { ...item, qty: innerExisting.qty + qtyToAdd, giftNote: productToAdd.giftNote || item.giftNote }
            : item
        );
      }
      return [...prev, { ...productToAdd, qty: qtyToAdd }];
    });
    showToast(`Added "${productToAdd.name}" to shopping cart!`, 'cart');
  }, [cart]);

  const handleBuyNow = useCallback((productToBuy) => {
    handleAddToCart(productToBuy);
    setSelectedProductForDetail(null);
    setActivePage('checkout');
  }, [handleAddToCart]);

  const handleRemoveFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Item removed from cart', 'info');
  }, []);

  const handleUpdateCartQty = useCallback((id, newQty, stock) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
    } else if (stock !== undefined && newQty > stock) {
      showToast(`Maximum stock of ${stock} reached`, 'warning');
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
    }
  }, [handleRemoveFromCart]);

  const handleClearCart = useCallback(() => {
    setCart([]);
    showToast('Shopping cart cleared', 'info');
  }, []);

  // Wishlist operations
  const handleToggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from wishlist`, 'info');
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to wishlist!`, 'wishlist');
        return [...prev, product];
      }
    });
  }, []);

  const handleRemoveFromWishlist = useCallback((id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
    showToast('Removed from wishlist', 'info');
  }, []);

  // Checkout completion
  const handleCompleteCheckout = (orderData) => {
    setMyOrders(prev => [...prev, orderData]);
    setRecentOrder(orderData);
    setCart([]);
    setAppliedPromo(null);
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
          await supabase.auth.signOut();
          setIsAdmin(false);
          setActivePage('home');
          showToast('Logged out of Admin Portal', 'info');
        }}
      />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, maxWidth: '1300px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }} className="app-content">
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spin" size={32} color="#db2777" /></div>}>
          {selectedProductForDetail ? (
            <ProductDetailPage 
              product={selectedProductForDetail}
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
                setActivePage={setActivePage}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                onSelectProduct={(p) => {
                  setSelectedProductForDetail(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            {activePage === 'shop' && (
              <ShopPage 
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                onSelectProduct={(p) => {
                  setSelectedProductForDetail(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
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
                  onLogout={async () => {
                    await supabase.auth.signOut();
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
        </Suspense>
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

      <Suspense fallback={null}>
        <AdminLoginModal 
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onLoginSuccess={() => {
            setIsAdmin(true);
            setActivePage('admin');
            showToast('Welcome to INZFYER Admin Portal!', 'success');
          }}
        />
      </Suspense>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
