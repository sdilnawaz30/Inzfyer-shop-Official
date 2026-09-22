import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import axios from 'axios';
import { processImageForUpload } from '../utils/imageProcessing';

const CategoryModal = ({ isOpen, onClose, onSave, categoryToEdit, showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    is_active: true
  });
  
  const [image, setImage] = useState(null); // { file: File, url: string }
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
        slug: categoryToEdit.slug || '',
        is_active: categoryToEdit.is_active ?? categoryToEdit.isActive ?? true
      });
      if (categoryToEdit.imageUrl || categoryToEdit.image_url) {
        setImage({ url: categoryToEdit.imageUrl || categoryToEdit.image_url });
      } else {
        setImage(null);
      }
    } else {
      setFormData({
        name: '',
        slug: '',
        is_active: true
      });
      setImage(null);
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(`File ${file.name} is not a valid image format.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(`File ${file.name} exceeds the 5MB size limit.`);
      return;
    }

    const tempUrl = URL.createObjectURL(file);
    setImage({ file, url: tempUrl });
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (!formData.name.trim()) throw new Error("Category name is required.");

      // 1. Authenticate for validation
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Authentication required for validation.");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const categoryId = categoryToEdit?.id;

      // 2. Slug Validation Loop
      let baseSlug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let finalSlug = categoryToEdit?.slug;
      let slugIsUnique = false;
      let slugCounter = 0;
      let testSlug = finalSlug || baseSlug;

      while (!slugIsUnique) {
        const res = await axios.post('/api/admin/action', {
          action: 'validateCategorySlug',
          payload: {
            slug: testSlug,
            excludeCategoryId: categoryId
          }
        }, config);

        if (res.data.slugAvailable) {
          finalSlug = testSlug;
          slugIsUnique = true;
        } else {
          slugCounter++;
          testSlug = `${baseSlug}-${slugCounter}`;
        }
      }

      // 3. Image Upload
      let uploadedFilePath = null;
      let finalImageUrl = image?.url || null;

      if (image?.file) {
        const { fullBlob } = await processImageForUpload(image.file);
        const baseFileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const fullFileName = `categories/${baseFileName}.webp`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fullFileName, fullBlob, { contentType: 'image/webp' });

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error("Image storage is currently unavailable (Bucket not found).");
          }
          if (uploadError.message.includes('row-level security') || uploadError.message.includes('row level security') || uploadError.message.includes('new row violates row-level security')) {
            throw new Error("You don't have permission to upload this image.");
          }
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        uploadedFilePath = fullFileName;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fullFileName);
        finalImageUrl = publicUrl;
      }

      // 4. Upsert Category Data
      const payload = {
        name: formData.name.trim(),
        slug: finalSlug,
        imageUrl: finalImageUrl,
        is_active: formData.is_active,
        isActive: formData.is_active
      };

      try {
        const res = await axios.post('/api/admin/action', {
          action: 'saveCategory',
          payload: {
            id: categoryId || null,
            category: payload,
            ...payload
          }
        }, config);
        
        if (!res.data.success) {
           throw new Error(res.data.message || "Failed to save category via backend.");
        }

        if (showToast) {
          showToast(categoryToEdit ? "Category updated successfully!" : "Category created successfully!", "success");
        }

        onSave(res.data.category || { id: categoryId, ...payload });
      } catch (dbErr) {
        // Cleanup if DB save fails
        if (uploadedFilePath) {
          await supabase.storage.from('product-images').remove([uploadedFilePath]);
        }
        throw dbErr;
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "An unexpected error occurred.";
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div 
        className="modal-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '500px', width: 'calc(100vw - 24px)', padding: 'clamp(1rem, 3vw, 2rem)', background: '#fff', borderRadius: '24px', maxHeight: 'calc(100vh - 24px)', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F8D7D0', paddingBottom: '0.85rem' }}>
          <div>
            <span className="badge badge-pink" style={{ marginBottom: '0.2rem' }}>
              <Sparkles size={12} /> Catalog Manager
            </span>
            <h2 className="brand-font" style={{ fontSize: '1.8rem', color: '#2C181B' }}>
              {categoryToEdit ? 'Edit Category' : 'Add New Category'}
            </h2>
          </div>
          <button className="wishlist-btn" onClick={onClose} style={{ position: 'static' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>
              Category Image (Optional)
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {image ? (
                <div style={{
                  width: '120px', height: '140px', position: 'relative', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#f9fafb'
                }}>
                  <img src={image.url} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 8px', alignItems: 'center', background: '#fff', height: '40px' }}>
                    <button type="button" onClick={removeImage} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label style={{
                  width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f9fafb', color: '#6b7280'
                }}>
                  <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>Category Name *</label>
            <input required name="name" type="text" placeholder="e.g. Plushies" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
          </div>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>Slug (URL identifier)</label>
            <input name="slug" type="text" placeholder="Auto-generated if left empty" value={formData.slug} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#5C4347' }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Category is Active
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', borderTop: '1px solid #F8D7D0', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem' }} disabled={isSaving}>
              {isSaving ? 'Saving...' : (categoryToEdit ? 'Save Changes' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
