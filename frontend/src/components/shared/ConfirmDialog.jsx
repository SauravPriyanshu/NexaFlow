import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, variant = 'danger' }) => {
  
  const isDanger = variant === 'danger';
  const Icon = isDanger ? Trash : AlertTriangle;
  const color = isDanger ? '#ef4444' : '#f59e0b';
  const bg = isDanger ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="Confirmation">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Icon size={32} color={color} />
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {message}
        </p>

      </div>
      
      <div data-modal-footer>
        <button 
          onClick={onClose}
          className="hover:bg-hover transition-colors"
          style={{
            padding: '8px 16px', fontSize: '14px', fontWeight: 500,
            color: 'var(--text-secondary)', borderRadius: '6px'
          }}
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className="transition-colors"
          style={{
            padding: '8px 16px', fontSize: '14px', fontWeight: 500,
            background: color, color: '#fff', borderRadius: '6px'
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
