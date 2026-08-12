import React, { useState } from 'react';
import { Heart, Camera, Mail, MapPin, MessageCircle, Sparkles, Send } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Footer = ({ setActivePage, showToast }) => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      showToast('Thank you for subscribing! Check your inbox for 10% OFF code.', 'promo');
      setEmail('');
    }
  };

  return (
    <footer style={{
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, #fff0f5 100%)',
      borderTop: '1px solid rgba(244, 114, 182, 0.25)',
      marginTop: '4rem',
      paddingTop: '3.5rem',
      paddingBottom: '6rem',
      color: '#4b5563'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <img 
                src={logoImg} 
                alt="INZFYER Logo" 
                loading="lazy"
                style={{
                  height: '80px',
                  width: 'auto',
                  objectFit: 'contain',
                  background: 'transparent'
                }}
              />
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem', color: '#4b5563' }}>
              Crafting smiles & magical moments with premium plushies, handcrafted gift sets, and boutique keepsakes wrapped in love.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span className="badge badge-pink"><Sparkles size={12} /> 100% Non-Toxic</span>
              <span className="badge badge-purple"><Heart size={12} /> Handmade</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.2rem', letterSpacing: '0.02em' }}>
              Boutique Navigation
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><button onClick={() => setActivePage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>Home & Featured</button></li>
              <li><button onClick={() => setActivePage('shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>Shop All Toys & Gifts</button></li>
              <li><button onClick={() => setActivePage('wishlist')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>My Wishlist</button></li>
              <li><button onClick={() => setActivePage('about')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>Our Brand Story</button></li>
              <li><button onClick={() => setActivePage('contact')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>Contact & FAQs</button></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.2rem', letterSpacing: '0.02em' }}>
              Boutique Care
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={16} color="#be185d" />
                <span style={{ color: '#4b5563' }}>Broadway Chennai.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MessageCircle size={16} color="#25D366" />
                <a href="https://wa.me/919445544739" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>+91-9445544739</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Mail size={16} color="#be185d" />
                <span style={{ color: '#4b5563' }}>admin@inzfyer.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Camera size={16} color="#E1306C" />
                <a href="https://instagram.com/inzfyer_official" target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C', fontWeight: 600, textDecoration: 'none' }}>@inzfyer_official</a>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.2rem', letterSpacing: '0.02em' }}>
              Gift Club Newsletter
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5', color: '#4b5563' }}>
              Subscribe to get secret discount codes, new plushie arrivals, and luxury gift wrapping tips!
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ fontSize: '0.85rem', padding: '0.65rem 0.9rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1rem' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(244, 114, 182, 0.2)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: '#9ca3af'
        }}>
          <div>
            <div style={{ marginBottom: '0.5rem' }}>
              © {new Date().getFullYear()} INZFYER Luxury Gifts. All Rights Reserved. Handcrafted with <Heart size={12} color="#be185d" fill="#be185d" style={{ display: 'inline' }} /> for sweet moments.
            </div>
            <div>
              Designed by - <a href="https://wisdotech.in" target="_blank" rel="noopener noreferrer" style={{ color: '#be185d', textDecoration: 'none', fontWeight: 600 }}>Wisdo Tech</a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span 
              onClick={() => setActivePage('privacy')}
              style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
              onMouseOver={(e) => e.target.style.color = '#be185d'}
              onMouseOut={(e) => e.target.style.color = '#9ca3af'}
            >
              Privacy Policy
            </span>
            <span 
              onClick={() => setActivePage('terms')}
              style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
              onMouseOver={(e) => e.target.style.color = '#be185d'}
              onMouseOut={(e) => e.target.style.color = '#9ca3af'}
            >
              Terms & Conditions
            </span>
            <span 
              onClick={() => setActivePage('refund')}
              style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
              onMouseOver={(e) => e.target.style.color = '#be185d'}
              onMouseOut={(e) => e.target.style.color = '#9ca3af'}
            >
              Cancellation & Refund policy
            </span>
            <span 
              onClick={() => setActivePage('shipping')}
              style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
              onMouseOver={(e) => e.target.style.color = '#be185d'}
              onMouseOut={(e) => e.target.style.color = '#9ca3af'}
            >
              Shipping & Delivery Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
