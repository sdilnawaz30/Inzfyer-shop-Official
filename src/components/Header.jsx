import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, ShieldCheck, Menu, X, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './Header.css';

const Header = ({ 
  activePage, 
  setActivePage, 
  cartCount, 
  wishlistCount, 
  searchQuery, 
  setSearchQuery, 
  isAdmin, 
  setIsAdminModalOpen,
  onLogoutAdmin 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop All' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="glass-header">
      <div className="header-main">
        {/* Brand Logo */}
        <div className="header-brand" onClick={() => setActivePage('home')}>
          <img src={logoImg} alt="INZFYER Logo" className="header-brand-logo" />
        </div>

        {/* Desktop Navigation - Pill Style */}
        <nav className="header-nav desktop-nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`header-nav-item ${activePage === item.id ? 'active' : ''}`}
            >
              {item.label}
              {item.badge > 0 && (
                <span className="header-nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Search & Actions */}
        <div className="header-actions">
          {/* Desktop Search Toggle */}
          {activePage !== 'home' && (
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="header-icon-btn desktop-nav-links"
              title="Search"
            >
              <Search size={20} />
            </button>
          )}

          {/* Wishlist Icon */}
          <button 
            onClick={() => setActivePage('wishlist')} 
            className={`header-icon-btn ${wishlistCount > 0 ? 'has-items' : ''}`}
            title="Wishlist"
          >
            <Heart size={20} fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
            {wishlistCount > 0 && (
              <span className="header-count-badge">{wishlistCount}</span>
            )}
          </button>

          {/* Cart Icon */}
          <button 
            onClick={() => setActivePage('cart')} 
            className={`header-icon-btn ${cartCount > 0 ? 'has-items' : ''}`}
            title="Shopping Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="header-count-badge">{cartCount}</span>
            )}
          </button>

          {/* Admin Toggle */}
          {isAdmin && activePage === 'admin' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={() => setActivePage('admin')} className="header-admin-panel-btn">
                <ShieldCheck size={16} /> Admin Panel
              </button>
              <button onClick={onLogoutAdmin} className="header-admin-exit-btn">
                Exit
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="header-icon-btn"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Expandable Search Row */}
      <div className={`mobile-search-row ${isSearchOpen ? 'desktop-show' : ''}`}>
        <div className="header-search mobile-search-input-wrapper">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder=" Search products here......"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activePage !== 'shop') setActivePage('shop');
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
