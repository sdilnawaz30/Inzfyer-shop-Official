import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, AlertCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { processImageForUpload } from '../utils/imageProcessing';

const ProductModal = ({ isOpen, onClose, onSave, productToEdit, categories = [], onAddNewCategory, showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    price: '',
    sale_price: '',
    stock: '10',
    gst_rate: '18.00',
    description: '',
    is_active: true,
    featured: false,
    new_arrival: false
  });

  const [images, setImages] = useState([]); // Array of { file: File, url: string, is_primary: boolean, sort_order: number, id: string }
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [createdProductId, setCreatedProductId] = useState(null); // Track ID if insert succeeds but later steps fail

  useEffect(() => {
    setCreatedProductId(null);
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        sku: productToEdit.sku || '',
        category_id: productToEdit.category_id || (categories.length > 0 ? categories[0].id : ''),
        price: productToEdit.price || '',
        sale_price: productToEdit.sale_price || '',
        gst_rate: productToEdit.gst_rate || '18.00',
        stock: productToEdit.stock?.toString() || '0',
        description: productToEdit.description || '',
        is_active: productToEdit.is_active ?? true,
        featured: productToEdit.featured || false,
        new_arrival: productToEdit.new_arrival || false
      });
      
      if (productToEdit.images) {
        setImages(productToEdit.images.map((img) => ({
          url: img.image_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
          id: img.id
        })).sort((a, b) => a.sort_order - b.sort_order));
      } else {
        setImages([]);
      }
    } else {
      const autoSku = `INZ-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        name: '',
        sku: autoSku,
        category_id: categories.length > 0 ? categories[0].id : '',
        price: '',
        sale_price: '',
        gst_rate: '18.00',
        stock: '10',
        description: '',
        is_active: true,
        featured: false,
        new_arrival: true
      });
      setImages([]);
    }
    setError(null);
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 20) {
      setError("Maximum of 20 images allowed per product.");
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} is not a valid image format.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} exceeds the 5MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    const newImages = validFiles.map((file, index) => {
      const tempUrl = URL.createObjectURL(file);
      return {
        file,
        url: tempUrl,
        is_primary: images.length === 0 && index === 0, // First uploaded image is primary by default
        sort_order: images.length + index
      };
    });

    setImages(prev => [...prev, ...newImages]);
  };

  const setPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImgs = prev.filter((_, i) => i !== index);
      // Ensure one is primary if any left
      if (newImgs.length > 0 && !newImgs.some(img => img.is_primary)) {
        newImgs[0].is_primary = true;
      }
      return newImgs.map((img, i) => ({ ...img, sort_order: i })); // reindex sort_order
    });
  };

  const moveImage = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newImgs = [...images];
      [newImgs[index - 1], newImgs[index]] = [newImgs[index], newImgs[index - 1]];
      setImages(newImgs.map((img, i) => ({ ...img, sort_order: i })));
    } else if (direction === 'down' && index < images.length - 1) {
      const newImgs = [...images];
      [newImgs[index + 1], newImgs[index]] = [newImgs[index], newImgs[index + 1]];
      setImages(newImgs.map((img, i) => ({ ...img, sort_order: i })));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // 1. Validation
      const price = parseFloat(formData.price);
      const sale_price = formData.sale_price ? parseFloat(formData.sale_price) : null;
      const stock = parseInt(formData.stock, 10) || 0;

      if (price < 0) throw new Error("Price cannot be negative.");
      if (sale_price !== null && sale_price < 0) throw new Error("Sale price cannot be negative.");
      if (stock < 0) throw new Error("Stock cannot be negative.");
      if (!formData.name.trim()) throw new Error("Product name is required.");
      if (!formData.sku.trim()) throw new Error("SKU is required.");

      // 2. Validate Duplicate SKU
      let productId = productToEdit?.id || createdProductId;
      
      const { data: skuCheck, error: skuErr } = await supabase
        .from('products')
        .select('id')
        .eq('sku', formData.sku.trim())
        .maybeSingle();
      
      if (skuErr) throw new Error(`Database error while verifying SKU: ${skuErr.message}`);
      if (skuCheck && skuCheck.id !== productId) {
        throw new Error(`A product with SKU '${formData.sku}' already exists.`);
      }

      // 3. Generate Safe Unique Slug
      let baseSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let finalSlug = productToEdit?.slug;

      if (!finalSlug) {
        let slugIsUnique = false;
        let slugCounter = 0;
        while (!slugIsUnique) {
          const testSlug = slugCounter === 0 ? baseSlug : `${baseSlug}-${slugCounter}`;
          const { data: slugCheck, error: checkErr } = await supabase.from('products').select('id').eq('slug', testSlug).maybeSingle();
          if (checkErr) throw new Error(`Database error checking slug: ${checkErr.message}`);
          if (!slugCheck || slugCheck.id === productId) {
            finalSlug = testSlug;
            slugIsUnique = true;
          } else {
            slugCounter++;
          }
        }
      }

      // 4. Upload new images to Supabase Storage
      const finalImages = [...images];
      const uploadedFilePaths = []; // Track to cleanup if DB fails

      try {
        for (let i = 0; i < finalImages.length; i++) {
          if (finalImages[i].file) {
            const file = finalImages[i].file;
            const { fullBlob, thumbBlob } = await processImageForUpload(file);
            
            const baseFileName = `${formData.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const fullFileName = `${baseFileName}.webp`;
            const thumbFileName = `${baseFileName}-thumb.webp`;
            
            // Upload Full Size Image
            const { error: fullUploadError } = await supabase.storage
              .from('product-images')
              .upload(fullFileName, fullBlob, { contentType: 'image/webp' });

            if (fullUploadError) {
              if (fullUploadError.message.includes('Bucket not found')) {
                throw new Error("Storage Bucket 'product-images' not found. Please create a public bucket named 'product-images' in your Supabase dashboard.");
              }
              if (fullUploadError.message.includes('row-level security') || fullUploadError.message.includes('row level security')) {
                throw new Error("You don't have permission to upload images. Please check the 'product-images' bucket RLS policies.");
              }
              throw new Error(`Failed to upload full image: ${fullUploadError.message}`);
            }
            uploadedFilePaths.push(fullFileName);

            // Upload Thumbnail Image
            const { error: thumbUploadError } = await supabase.storage
              .from('product-images')
              .upload(thumbFileName, thumbBlob, { contentType: 'image/webp' });

            if (thumbUploadError) {
              throw new Error(`Failed to upload thumbnail: ${thumbUploadError.message}`);
            }
            uploadedFilePaths.push(thumbFileName);

            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fullFileName);
            finalImages[i].url = publicUrl;
            delete finalImages[i].file;
          }
        }

        // 5. Upsert Product details
        const productPayload = {
          name: formData.name.trim(),
          slug: finalSlug,
          sku: formData.sku.trim(),
          description: formData.description,
          category_id: formData.category_id || null,
          price,
          sale_price,
          gst_rate: parseFloat(formData.gst_rate) || 18.00,
          stock: parseInt(formData.stock),
          is_active: formData.is_active,
          featured: formData.featured,
          new_arrival: formData.new_arrival
        };

        let stockDiff = 0;

        if (productId) {
          const oldStock = parseInt(productToEdit?.stock || 0, 10);
          stockDiff = stock - oldStock;
          
          const { error: updateErr } = await supabase.from('products').update(productPayload).eq('id', productId);
          if (updateErr) throw new Error(`Failed to update product: ${updateErr.message}`);
        } else {
          stockDiff = stock;
          const { data, error: insertErr } = await supabase.from('products').insert(productPayload).select('id').single();
          if (insertErr) {
             if (insertErr.message.includes('duplicate key value violates unique constraint')) {
                throw new Error(`A product with this Slug or SKU already exists. (${insertErr.message})`);
             }
             if (insertErr.message.includes('row-level security')) {
                throw new Error("You don't have permission to create products. Please run the RLS SQL script for the 'products' table.");
             }
             throw new Error(`Failed to create product: ${insertErr.message}`);
          }
          productId = data.id;
          setCreatedProductId(productId);
        }

      // Log inventory movement if stock changed
      if (stockDiff !== 0) {
        const { error: moveErr } = await supabase.from('inventory_movements').insert({
          product_id: productId,
          movement_type: productToEdit ? 'MANUAL_ADJUSTMENT' : 'RESTOCK',
          quantity: stockDiff,
          notes: 'Admin updated catalog'
        });
        if (moveErr) console.error("Failed to log inventory movement:", moveErr);
      }

      // 4. Upsert Images
      // First, get current DB images to see if any need deleting
      if (productToEdit) {
        const { data: existingImgs } = await supabase.from('product_images').select('id, image_url').eq('product_id', productId);
        const newImgUrls = finalImages.map(img => img.url);
        const imgsToDelete = existingImgs?.filter(img => !newImgUrls.includes(img.image_url)) || [];
        
        if (imgsToDelete.length > 0) {
          // Delete from DB
          await supabase.from('product_images').delete().in('id', imgsToDelete.map(img => img.id));
          
          // Delete from Storage Bucket
          const filesToDelete = imgsToDelete
            .map(img => {
              const match = img.image_url.match(/\/storage\/v1\/object\/public\/product-images\/(.+)$/);
              return match ? match[1] : null;
            })
            .filter(Boolean);

          if (filesToDelete.length > 0) {
            const { error: removeError } = await supabase.storage.from('product-images').remove(filesToDelete);
            if (removeError) {
               console.warn("Failed to delete some old images from storage:", removeError);
            }
          }
        }
      }

      // Separate new vs existing images to avoid UUID issues and upsert constraints
      const newImages = finalImages
        .filter(img => !img.id)
        .map((img, idx) => ({
          product_id: productId,
          image_url: img.url,
          sort_order: idx,
          is_primary: img.is_primary || false
        }));

      const existingImages = finalImages
        .filter(img => img.id)
        .map((img, idx) => ({
          id: img.id,
          product_id: productId,
          image_url: img.url,
          sort_order: idx,
          is_primary: img.is_primary || false
        }));

      if (newImages.length > 0) {
        const { error: insertImgError } = await supabase.from('product_images').insert(newImages);
        if (insertImgError) throw insertImgError;
      }

      if (existingImages.length > 0) {
        const { error: updateImgError } = await supabase.from('product_images').upsert(existingImages);
        if (updateImgError) throw updateImgError;
      }

        if (showToast) {
          showToast(productToEdit ? "Product successfully updated!" : "Product successfully published!", "success");
        }

        onSave({
          id: productId,
          ...productPayload
        });
        
      } catch (dbErr) {
        // Cleanup orphaned storage files if the database transaction failed AFTER image upload
        if (uploadedFilePaths.length > 0 && !productId) {
           console.log("Cleaning up orphaned files:", uploadedFilePaths);
           await supabase.storage.from('product-images').remove(uploadedFilePaths);
        }
        throw dbErr; // Re-throw to be caught by the outer block
      }
    } catch (err) {
      console.error("Product Save Error:", err);
      // Give more user-friendly messages for null id issues
      if (err.message && err.message.includes('violates not-null constraint') && err.message.includes('id')) {
        setError(`Database configuration error: Missing DEFAULT gen_random_uuid() on the table's ID column. ${err.message}`);
      } else {
        setError(err.message || "An unknown error occurred while saving the product.");
      }
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
        style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#fff', borderRadius: '24px' }}
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

        {error && (
          <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Images Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: '#2C181B' }}>
              Product Images (WebP preferred)
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {images.map((img, idx) => (
                <div key={idx} style={{
                  width: '120px', height: '140px', position: 'relative', border: img.is_primary ? '2px solid #A63A4B' : '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#f9fafb'
                }}>
                  <img src={img.url} alt="preview" style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
                  {img.is_primary && (
                    <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#A63A4B', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Primary</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', alignItems: 'center', background: '#fff', height: '46px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button type="button" onClick={() => moveImage(idx, 'up')} disabled={idx === 0} style={{ border: 'none', background: 'transparent', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: '#5C4347' }}><ArrowUp size={14} /></button>
                      <button type="button" onClick={() => moveImage(idx, 'down')} disabled={idx === images.length - 1} style={{ border: 'none', background: 'transparent', cursor: idx === images.length - 1 ? 'not-allowed' : 'pointer', color: '#5C4347' }}><ArrowDown size={14} /></button>
                    </div>
                    <button type="button" onClick={() => removeImage(idx)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                  {!img.is_primary && (
                    <button type="button" onClick={() => setPrimaryImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.8)', border: 'none', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>Set Primary</button>
                  )}
                </div>
              ))}

              <label style={{
                width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f9fafb', color: '#6b7280'
              }}>
                <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Add Image</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>Product Name *</label>
              <input required name="name" type="text" placeholder="e.g. Cream Ribbon Bunny Plushie" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>SKU Code *</label>
              <input required name="sku" type="text" placeholder="INZ-PLUSH-001" value={formData.sku} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#2C181B', margin: 0 }}>Category</label>
                {onAddNewCategory && (
                  <button type="button" onClick={onAddNewCategory} style={{ background: 'none', border: 'none', color: '#be185d', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                    + New Category
                  </button>
                )}
              </div>
              <select name="category_id" value={formData.category_id} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff' }}>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                {categories.length === 0 && <option value="">No categories available</option>}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>Stock Units *</label>
              <input required name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>Selling Price (₹) *</label>
              <input required name="price" type="number" step="0.01" min="0" placeholder="1899" value={formData.price} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>Discount Price (₹)</label>
              <input name="sale_price" type="number" step="0.01" min="0" placeholder="Optional" value={formData.sale_price} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>GST Rate (%) *</label>
              <input required name="gst_rate" type="number" step="0.01" min="0" max="100" placeholder="18.00" value={formData.gst_rate} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#2C181B' }}>Product Description</label>
            <textarea rows="3" name="description" placeholder="Enter product description, materials, and gift care details..." value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#5C4347' }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Product is Active
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#5C4347' }}>
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /> Featured Item
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#5C4347' }}>
              <input type="checkbox" name="new_arrival" checked={formData.new_arrival} onChange={handleChange} /> New Arrival Tag
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', borderTop: '1px solid #F8D7D0', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem' }} disabled={isSaving}>
              {isSaving ? 'Saving...' : (productToEdit ? 'Save Changes' : 'Publish Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
