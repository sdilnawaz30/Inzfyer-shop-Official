import React from 'react';
import { ArrowRight, Heart, Gift, ShoppingBag, Sparkles, Star, Package, Coffee, Bookmark, Smile, Key, ShieldCheck } from 'lucide-react';
import heroImg from '../assets/new hero.png';
import './HomePage.css';

const categories = [
  { title: 'Plushies & Toys', icon: Package, count: '12 items' },
  { title: 'Gift Sets', icon: Gift, count: '8 items' },
  { title: 'Charms', icon: Key, count: '15 items' },
  { title: 'Ceramics', icon: Coffee, count: '6 items' },
  { title: 'Stationery', icon: Bookmark, count: '10 items' },
  { title: 'Keepsakes', icon: Smile, count: '7 items' },
];

const highlights = [
  { label: 'Handmade with Care', icon: Heart },
  { label: 'Perfect for Gifting', icon: Gift },
  { label: 'Spreads Good Vibes', icon: Smile },
  { label: 'Quality You Can Trust', icon: ShieldCheck },
];

const HomePage = ({ products, setActivePage, onAddToCart, onToggleWishlist, wishlist, onSelectProduct }) => {
  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 4);

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
          <div className="hero-image-frame"><img src={heroImg} alt="" /></div>
        </div>
        <div className="hero-highlights">
          {highlights.map(({ label, icon: Icon }) => <div className="hero-highlight" key={label}><span><Icon size={20} /></span><b>{label}</b></div>)}
        </div>
      </section>

      <section className="store-section">
        <div className="section-heading"><span>Handpicked collections</span><h2>Find a little <i>magic</i></h2><p>Thoughtful picks for every tiny celebration.</p></div>
        <div className="category-grid">
          {categories.map(({ title, icon: Icon, count }) => <button className="category-card" key={title} onClick={() => setActivePage('shop')}><span><Icon size={27} /></span><b>{title}</b><small>{count}</small></button>)}
        </div>
      </section>

      <section className="store-section featured-section">
        <div className="split-heading"><div className="section-heading left"><span>Curated selection</span><h2>Little things, <i>big joy.</i></h2></div><button className="text-link" onClick={() => setActivePage('shop')}>View all <ArrowRight size={18} /></button></div>
        <div className="grid-products storefront-products">
          {featuredProducts.map((product) => {
            const inWishlist = wishlist.some((item) => item.id === product.id);
            return <article className="product-card" key={product.id}>
              <div className="product-image-container">
                {product.tag && <span className="product-tag badge badge-pink">{product.tag}</span>}
                <button className={`wishlist-btn ${inWishlist ? 'active' : ''}`} onClick={() => onToggleWishlist(product)} aria-label={`Save ${product.name}`}><Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} /></button>
                <img src={product.image} alt={product.name} className="product-image" onClick={() => onSelectProduct(product)} />
              </div>
              <div className="product-copy"><small>{product.category}</small><h3 onClick={() => onSelectProduct(product)}>{product.name}</h3><div className="product-rating"><Star size={14} fill="currentColor" /> {product.rating} <span>({product.reviewsCount})</span></div><div className="product-bottom"><div><b>₹{product.price.toLocaleString('en-IN')}</b>{product.originalPrice && <del>₹{product.originalPrice.toLocaleString('en-IN')}</del>}</div><button onClick={() => onAddToCart(product)} aria-label={`Add ${product.name} to cart`}><ShoppingBag size={17} /></button></div></div>
            </article>;
          })}
        </div>
      </section>

      <section className="gift-banner"><div><span>Signature unboxing</span><h2>Wrapped with love,<br /><i>made for smiles.</i></h2><p>Every INZFYER order arrives ready to make their day, in a keepsake box with a personalised note.</p><button onClick={() => setActivePage('shop')}>Choose a gift <ArrowRight size={18} /></button></div><div className="gift-banner-mark"><Gift size={58} /><b>A little extra<br />love in every box</b></div></section>
    </div>
  );
};

export default HomePage;
