import React from 'react';
import { Home, ShoppingBag, Heart, Info, PhoneCall, ShieldCheck } from 'lucide-react';

const MobileNav = ({ activePage, setActivePage, cartCount, wishlistCount, isAdmin }) => {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { id: isAdmin ? 'admin' : 'contact', label: isAdmin ? 'Admin' : 'Contact', icon: isAdmin ? ShieldCheck : PhoneCall },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <Icon size={20} color={isActive ? '#db2777' : '#6b7280'} />
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '18px',
                background: '#db2777',
                color: '#ffffff',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
