import React from 'react';
import { Gift, Heart, ShieldCheck, Sparkles, Star, Users } from 'lucide-react';

const AboutPage = ({ setActivePage }) => {
  const stats = [
    { number: '15,000+', label: 'Delighted Customers', icon: Users },
    { number: '100%', label: 'Hypoallergenic Organic Cotton', icon: ShieldCheck },
    { number: '500+', label: 'Handcrafted Gift Collections', icon: Gift },
    { number: '4.9 / 5', label: 'Average Boutique Rating', icon: Star },
  ];

  const values = [
    {
      title: 'Artisanal Craftsmanship',
      desc: 'Each plushie and ceramic piece is crafted by skilled artisans using non-toxic dyes and double-stitched seams for heirloom durability.',
      icon: Sparkles
    },
    {
      title: 'Eco-Conscious Packaging',
      desc: 'We wrap every gift box in recyclable blush cardstock, organic satin ribbons, and biodegradable cushioning.',
      icon: Gift
    },
    {
      title: 'Personalized Unboxing',
      desc: 'No automated receipts inside! We include custom handwritten calligraphy notes and rose petal sprigs with every package.',
      icon: Heart
    }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="badge badge-pink" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
          <Sparkles size={14} /> The INZFYER Story
        </span>
        <h1 className="brand-font" style={{ fontSize: '3.2rem', color: '#1f2937', marginBottom: '1rem' }}>
          Crafting Smiles with <span style={{ color: '#db2777' }}>Cute Luxury Gifts</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          Founded with a passion for heartfelt gifting, INZFYER creates ultra-soft plushies, luxury candles, and bespoke keepsakes designed to bring warmth and joy to every celebration.
        </p>
      </div>

      {/* Story Grid */}
      <div className="glass glass-card" style={{ background: '#ffffff', padding: '3rem', marginBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <h2 className="brand-font" style={{ fontSize: '2.2rem', color: '#1f2937', marginBottom: '1rem' }}>
              Where Plush Meets Pure Elegance
            </h2>
            <p style={{ color: '#4b5563', lineHeight: '1.7', marginBottom: '1.25rem', fontSize: '0.98rem' }}>
              At INZFYER, we believe that gifts shouldn't just be items — they should be unforgettable memories. That's why every product in our boutique goes through rigorous quality and safety inspections before being gently nestled into our signature pastel pink gift boxes.
            </p>
            <p style={{ color: '#4b5563', lineHeight: '1.7', marginBottom: '1.75rem', fontSize: '0.98rem' }}>
              Whether it's a cozy plush bunny for a newborn, a scented candle for a housewarming, or a luxury tea pair for a best friend, our boutique treats every order as a work of art.
            </p>
            <button onClick={() => setActivePage('shop')} className="btn btn-primary" style={{ padding: '0.85rem 1.8rem' }}>
              Discover Our Collections
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"
              alt="INZFYER Gift Box"
              style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '24px' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              background: '#db2777',
              color: '#ffffff',
              padding: '1rem 1.5rem',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(219, 39, 119, 0.3)'
            }}>
              <Heart size={24} fill="#ffffff" />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '0.2rem' }}>Wrapped with Love</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Counter */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3.5rem'
      }}>
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass glass-card" style={{ background: '#ffffff', textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#fdf2f8',
                color: '#db2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <Icon size={24} />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#db2777', marginBottom: '0.25rem' }}>{s.number}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#6b7280' }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Brand Values */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="brand-font" style={{ fontSize: '2.4rem', color: '#1f2937' }}>Our Boutique Standards</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div key={idx} className="glass glass-card" style={{ background: '#ffffff', padding: '2rem' }}>
                <div style={{ color: '#7e22ce', marginBottom: '1rem' }}>
                  <Icon size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>{v.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.92rem', lineHeight: '1.6' }}>{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
