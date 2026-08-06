import React, { useState } from 'react';
import { Lock, Mail, Sparkles, X, ShieldCheck } from 'lucide-react';
import logoImg from '../assets/logo.png';

import axios from 'axios';

const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@inzfyer.in');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/admin/login', { password });
      if (response.data.success) {
        onLoginSuccess();
        setPassword('');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '2.25rem' }}
      >
        <button onClick={onClose} className="wishlist-btn" style={{ top: '16px', right: '16px' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img 
            src={logoImg} 
            alt="INZFYER Logo"
            style={{
              height: '56px',
              width: 'auto',
              borderRadius: '14px',
              objectFit: 'contain',
              margin: '0 auto 1rem auto',
              display: 'block',
              boxShadow: '0 4px 15px rgba(166, 58, 75, 0.2)',
              border: '1.5px solid rgba(224, 150, 137, 0.4)',
              background: '#ffffff',
              padding: '3px 8px'
            }}
          />
          <span className="badge badge-pink" style={{ marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Protected Area
          </span>
          <h2 className="brand-font" style={{ fontSize: '1.9rem', color: '#2C181B', marginTop: '0.2rem' }}>
            Admin Portal Login
          </h2>
          <p style={{ color: '#5C4347', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Authenticate with your admin email and password to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94757A' }} />
              <input 
                type="email" 
                placeholder="admin@inzfyer.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94757A' }} />
              <input 
                type="password" 
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
            </div>
            {error && <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.4rem', display: 'block' }}>{error}</span>}
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
            {isLoading ? 'Authorizing...' : 'Authorize Admin Access'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #F8D7D0', paddingTop: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#94757A', display: 'block', marginBottom: '0.6rem' }}>
            Secure Serverless Admin Access
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
