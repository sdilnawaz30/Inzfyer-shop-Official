import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import axios from 'axios';

const CategoryModal = ({ isOpen, onClose, onSave, categoryToEdit, showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    is_active: true
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
        slug: categoryToEdit.slug || '',
        is_active: categoryToEdit.is_active ?? categoryToEdit.isActive ?? true
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        is_active: true
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (!formData.name.trim()) throw new Error("Category name is required.");

      const generatedSlug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const payload = {
        name: formData.name.trim(),
        slug: generatedSlug,
        is_active: formData.is_active,
        isActive: formData.is_active
      };

      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await axios.post('/api/admin/action', {
        action: 'saveCategory',
        payload: {
          id: categoryToEdit?.id || null,
          category: payload,
          ...payload
        }
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (!res.data.success) {
         throw new Error(res.data.message || "Failed to save category via backend.");
      }

      if (showToast) {
        showToast(categoryToEdit ? "Category updated successfully!" : "Category created successfully!", "success");
      }

      onSave(res.data.category || { id: categoryToEdit?.id, ...payload });
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
        style={{ maxWidth: '500px', width: '90%', padding: '2rem', background: '#fff', borderRadius: '24px' }}
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
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
