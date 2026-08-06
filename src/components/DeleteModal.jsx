import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 700, fontSize: '1.2rem' }}>
            <AlertTriangle size={22} />
            Confirm Deletion
          </div>
          <button className="wishlist-btn" onClick={onClose} style={{ position: 'static' }}>
            <X size={20} />
          </button>
        </div>
        
        <p style={{ marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Are you sure you want to remove <strong style={{ color: '#1f2937' }}>{product.name}</strong> from the catalog? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={() => onConfirm(product.id)}>
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
