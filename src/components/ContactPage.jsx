import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Globe, Camera, Mail, MapPin, MessageCircle, Phone, Send, Sparkles } from 'lucide-react';

const ContactPage = ({ showToast }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Your message has been sent to INZFYER Care Team! We will reply within 2 hours.', 'success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    {
      q: 'How long does gift delivery take?',
      a: 'Standard boutique shipping takes 3-4 business days. Express overnight delivery is also available for selected pincodes during checkout.'
    },
    {
      q: 'Is gift wrapping really free?',
      a: 'Yes! Every single order includes our signature pastel blush box, satin ribbons, and a calligraphy message card at no extra cost.'
    },
    {
      q: 'Are your plush toys safe for babies?',
      a: 'Absolutely. All INZFYER plushies are made from 100% organic, hypoallergenic velvet fabrics with stitched eyes (no plastic buttons) for baby safety.'
    },
    {
      q: 'Can I track my gift order?',
      a: 'Yes, as soon as your gift is dispatched, you will receive an SMS and Email with a live tracking link.'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-pink" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
          <Sparkles size={14} /> We Love Hearing From You
        </span>
        <h1 className="brand-font" style={{ fontSize: '3rem', color: '#1f2937', marginBottom: '0.5rem' }}>
          Contact <span style={{ color: '#db2777' }}>Boutique Care</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Have a question about custom gift sets, bulk orders, or shipping? Reach out anytime!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
        
        {/* Contact Form */}
        <div className="glass glass-card" style={{ background: '#ffffff', padding: '2.5rem' }}>
          <h2 className="brand-font" style={{ fontSize: '1.8rem', color: '#1f2937', marginBottom: '1.5rem' }}>
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Your Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Priya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="e.g. priya@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Subject</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Custom Gift Inquiry"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Message</label>
              <textarea 
                rows="4" 
                required 
                placeholder="Write your note here..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              <Send size={18} /> Send Boutique Message
            </button>
          </form>
        </div>

        {/* Info & Hours */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass glass-card" style={{ background: '#ffffff', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.25rem' }}>
              Boutique Store Location
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <MapPin size={22} color="#db2777" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#1f2937' }}>INZFYER Store</strong>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '2px' }}>
                    Washermenpet, Chennai
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <MessageCircle size={22} color="#25D366" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#1f2937' }}>WhatsApp Order & Support</strong>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '2px' }}>
                    <a href="https://wa.me/918295953595" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>+91 82959 53595</a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <Mail size={22} color="#db2777" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#1f2937' }}>Email</strong>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '2px' }}>inzfyer21@gmail.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <Camera size={22} color="#E1306C" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#1f2937' }}>Instagram</strong>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '2px' }}>
                    <a href="https://instagram.com/inzfyer_official" target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C', fontWeight: 600, textDecoration: 'none' }}>@inzfyer_official</a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <Globe size={22} color="#7e22ce" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#1f2937' }}>Business Hours</strong>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '2px' }}>24/7 Online Business</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid rgba(244, 114, 182, 0.3)',
            padding: '1.75rem',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#db2777', marginBottom: '0.5rem' }}>
              Planning Bulk / Corporate Gifts?
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.5' }}>
              We customize large gift orders with corporate logos, custom ribbon colors, and bespoke greeting notes.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="brand-font" style={{ fontSize: '2.2rem', color: '#1f2937' }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="glass glass-card"
                style={{ background: '#ffffff', padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937' }}>{faq.q}</h4>
                  {isOpen ? <ChevronUp size={20} color="#db2777" /> : <ChevronDown size={20} color="#9ca3af" />}
                </div>
                {isOpen && (
                  <p style={{ color: '#6b7280', fontSize: '0.92rem', marginTop: '0.85rem', lineHeight: '1.6', borderTop: '1px solid #fce7f3', paddingTop: '0.75rem' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
