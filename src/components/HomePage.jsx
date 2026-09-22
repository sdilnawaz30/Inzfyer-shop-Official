import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart, Gift, ShoppingBag, Sparkles, Star, Package, Coffee, Bookmark, Smile, Key, Truck, Lock, Camera } from 'lucide-react';
import heroImg from '../assets/new hero.png';
import ResponsiveImage from './ResponsiveImage';
import { fetchFeaturedProducts, fetchRecentProducts, fetchCategories } from '../utils/productQueries';
import './HomePage.css';

const highlights = [
  { label: 'Delivery in 5–7 Days', icon: Truck },
  { label: 'Secure Payments', icon: Lock },
  { label: 'Handmade Quality', icon: Heart },
];

const HomePage = ({ setActivePage, onAddToCart, onToggleWishlist, wishlist, onSelectProduct, setSelectedCategory }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [featured, recent, categoriesData] = await Promise.all([
          fetchFeaturedProducts(4),
          fetchRecentProducts(4),
          fetchCategories()
        ]);
        setFeaturedProducts(featured);
        setRecentProducts(recent);
        setStoreCategories(categoriesData || []);
      } catch (error) {
        console.error("Failed to load home page data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="storefront animate-fade-in">
      <section className="pink-hero">
        <div className="pink-hero-copy">
          <div className="new-drop"><Sparkles size={17} /> NEW DROP</div>
          <h1><span className="hero-title-line">Collect <span>Cute.</span></span><br /><span className="hero-title-line">Carry <em>Joy.</em></span></h1>
          <div className="hero-rule"><Heart size={15} fill="currentColor" /></div>
          <p>Handmade plushies, charms &amp; adorable gifts made to <strong>brighten every day.</strong></p>
          <button className="hero-cta" onClick={() => setActivePage('shop')}>Shop Now <ArrowRight size={22} /></button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-image-frame"><img src={heroImg} alt="" fetchpriority="high" /></div>
        </div>
        <div className="hero-highlights">
          {highlights.map(({ label, icon: Icon }) => <div className="hero-highlight" key={label}><span><Icon size={20} /></span><b>{label}</b></div>)}
        </div>
      </section>

      {storeCategories && storeCategories.length > 0 && (
        <section className="store-section">
          <div className="section-heading"><span>Handpicked collections</span><h2>Find a little <i>magic</i></h2><p>Thoughtful picks for every tiny celebration.</p></div>
          <div className="category-grid">
            {storeCategories.map((cat) => (
              <button 
                className="category-card" 
                key={cat.id} 
                onClick={() => { 
                  if(setSelectedCategory) setSelectedCategory(cat.name); 
                  setActivePage('shop'); 
                }}
              >
                <span>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '19px' }} />
                  ) : (
                    <Package size={27} />
                  )}
                </span>
                <b>{cat.name}</b>
                <small>{cat.productCount || 0} {cat.productCount === 1 ? 'item' : 'items'}</small>
              </button>
            ))}
          </div>
        </section>
      )}



      <section className="why-choose-section">
        <div className="section-heading"><span>Our Promise</span><h2>Why Choose <i>INZFYER</i></h2><p>Crafted to bring a little more magic to your day.</p></div>
        <div className="why-choose-grid">
          <div className="why-choose-card">
            <span className="why-choose-icon"><Heart size={28} /></span>
            <h3>Handmade with Care</h3>
            <p>Every piece is carefully crafted with love and attention to detail.</p>
          </div>
          <div className="why-choose-card">
            <span className="why-choose-icon"><Gift size={28} /></span>
            <h3>Affordable Cute Gifts</h3>
            <p>Spread joy and good vibes without breaking the bank.</p>
          </div>
          <div className="why-choose-card">
            <span className="why-choose-icon"><Sparkles size={28} /></span>
            <h3>Unique & Aesthetic</h3>
            <p>Stand out with our specially curated, aesthetic designs.</p>
          </div>
        </div>
      </section>

      <section className="gift-banner"><div><span>Signature unboxing</span><h2>Wrapped with love,<br /><i>made for smiles.</i></h2><p>Every INZFYER order arrives ready to make their day, in a keepsake box with a personalised note.</p><button onClick={() => setActivePage('shop')}>Choose a gift <ArrowRight size={18} /></button></div><div className="gift-banner-mark"><Gift size={58} /><b>A little extra<br />love in every box</b></div></section>

      {/* SEO Section */}
      <section className="seo-section" style={{ maxWidth: '900px', margin: '4rem auto', padding: '0 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#2C181B', marginBottom: '1.5rem' }} className="brand-font">
          Cute Handmade Gifts Online in India
        </h2>
        <p style={{ color: '#5C4347', lineHeight: '1.8', fontSize: '1.05rem', margin: '0 auto', textAlign: 'justify', textAlignLast: 'center' }}>
          Looking for the perfect way to spread joy? At INZFYER, we specialize in curating the most adorable and unique <strong>handmade gifts</strong> available online in India. From our incredibly soft, high-quality plushies to our aesthetic charm collections and beautifully crafted ceramics, every item is thoughtfully designed to bring a smile to your loved ones' faces. We believe that gifting shouldn't be expensive, which is why we offer a wide range of <strong>affordable cute products</strong> that never compromise on quality or charm. Whether you're planning a magical birthday surprise, an anniversary treat, or just a little something to make someone's day, our products are absolutely <strong>perfect for gifting</strong>. Best of all, we provide fast, secure <strong>delivery across India</strong> right to your doorstep, making your gift-giving experience completely hassle-free. Shop with INZFYER today and add a little magic to your everyday moments.
        </p>
      </section>
    </div>
  );
};

export default HomePage;
