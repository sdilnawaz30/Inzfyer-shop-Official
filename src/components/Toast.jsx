import React, { useEffect } from 'react';
import { CheckCircle2, Heart, ShoppingBag, Sparkles, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'cart':
        return <ShoppingBag size={20} className="text-pink-500" />;
      case 'wishlist':
        return <Heart size={20} fill="#db2777" color="#db2777" />;
      case 'promo':
        return <Sparkles size={20} color="#7e22ce" />;
      default:
        return <CheckCircle2 size={20} color="#10b981" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      padding: '0.85rem 1.25rem',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(219, 39, 119, 0.25)',
      border: '1.5px solid rgba(244, 114, 182, 0.4)',
      animation: 'fadeIn 0.3s ease forwards',
      maxWidth: '340px'
    }}>
      {getIcon()}
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</span>
      <button 
        onClick={onClose} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', marginLeft: 'auto', display: 'flex' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
