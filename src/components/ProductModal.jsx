import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Tag, Package, DollarSign, Barcode } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Plushies & Toys',
    price: '',
    originalPrice: '',
    stock: '',
    tag: 'New Arrival',
    image: '',
    description: ''
  });

  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (productToEdit) {
      const skuVal = productToEdit.sku || `INZ-${productToEdit.id.toUpperCase()}`;
      setFormData({
        ...productToEdit,
        sku: skuVal,
        price: productToEdit.price || '',
        originalPrice: productToEdit.originalPrice || '',
        stock: productToEdit.stock || '',
        image: productToEdit.image || '',
        tag: productToEdit.tag || 'New Arrival',
        description: productToEdit.description || ''
      });
      setImagePreview(productToEdit.image || '');
    } else {
      const autoSku = `INZ-SKU-${Math.floor(1000 + Math.random() * 9000)}`;
      const defaultImg = 'https://images.unsplash.com/photo-1558060370-d644479be6f7?auto=format&fit=crop&w=800&q=80';
      setFormData({
        name: '',
        sku: autoSku,
        category: 'Plushies & Toys',
        price: '',
        originalPrice: '',
        stock: '10',
        tag: 'New Arrival',
        image: defaultImg,
        description: 'Handcrafted luxury boutique piece made with organic cotton and satin ribbons.'
      });
      setImagePreview(defaultImg);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'image') {
      setImagePreview(value);
    }
  };

  // Image File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setFormData(prev => ({ ...prev, image: base64Data }));
        setImagePreview(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPrice = parseFloat(formData.price) || 0;
    const finalOrigPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : null;
    
    onSave({
      ...formData,
      id: productToEdit ? productToEdit.id : `inz-${Date.now()}`,
      price: finalPrice,
      originalPrice: finalOrigPrice,
      stock: parseInt(formData.stock, 10) || 0,
      sku: formData.sku || `INZ-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      rating: productToEdit ? productToEdit.rating : 5.0,
      reviewsCount: productToEdit ? productToEdit.reviewsCount : 1,
      isFeatured: true
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', padding: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F8D7D0', paddingBottom: '0.85rem' }}>
          <div>
            <span className="badge badge-pink" style={{ marginBottom: '0.2rem' }}>
              <Sparkles size={12} /> Catalog Manager
            </span>
            <h2 className="brand-font" style={{ fontSize: '1.8rem', color: '#2C181B' }}>
              {productToEdit ? 'Edit Product Details' : 'Add New Boutique Product'}
            </h2>
          </div>
          <button className="wishlist-btn" onClick={onClose} style={{ position: 'static' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload & Live Preview Section */}
          <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '18px',
              overflow: 'hidden',
              background: '#F8D7D0',
              border: '2px dashed rgba(166, 58, 75, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={32} color="#8C2E3C" />
              )}
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: '#2C181B' }}>
                Image Upload & Media
              </label>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <label className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '0.55rem 0.9rem', cursor: 'pointer', borderColor: '#A63A4B', color: '#A63A4B' }}>
                  <Upload size={16} /> Choose File
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <input 
                name="image" 
                type="text" 
                placeholder="Or paste image URL (https://...)"
                value={formData.image}
                onChange={handleChange}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Name & SKU */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
                Product Name *
              </label>
              <input 
                required
                name="name" 
                type="text" 
                placeholder="e.g. Cream Ribbon Bunny Plushie" 
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
                SKU Code *
              </label>
              <input 
                required
                name="sku" 
                type="text" 
                placeholder="INZ-PLUSH-001" 
                value={formData.sku}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category & Badge Tag */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
                Category
              </label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Plushies & Toys">Plushies & Toys</option>
                <option value="Keychains & Charms">Keychains & Charms</option>
                <option value="Luxury Gift Sets">Luxury Gift Sets</option>
                <option value="Boutique Ceramics">Boutique Ceramics</option>
                <option value="Aesthetic Stationery">Aesthetic Stationery</option>
                <option value="Baby Keepsakes">Baby Keepsakes</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
                Badge Tag
              </label>
              <input 
                name="tag"
                type="text"
                placeholder="e.g. Bestseller / New Arrival"
                value={formData.tag}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Price, Discount Original Price & Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
                Selling Price (₹) *
              </label>
              <input 
                required
                name="price" 
                type="number" 
                min="0"
                placeholder="1899"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
                Original Price (₹)
              </label>
              <input 
                name="originalPrice" 
                type="number" 
                min="0"
                placeholder="2499"
                value={formData.originalPrice}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
                Stock Units *
              </label>
              <input 
                required
                name="stock" 
                type="number" 
                min="0"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
              Product Description
            </label>
            <textarea 
              rows="3"
              name="description"
              placeholder="Enter product description, materials, and gift care details..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', borderTop: '1px solid #F8D7D0', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem' }}>
              {productToEdit ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
