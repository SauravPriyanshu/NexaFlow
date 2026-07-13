import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZES = {
  sm: '400px',
  md: '520px',
  lg: '640px'
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'auto';
      }, 150); // exit animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    opacity: isClosing ? 0 : 1,
    transition: 'opacity 200ms ease-out'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: SIZES[size] || SIZES.md,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    transform: isClosing ? 'scale(0.95) translateY(8px)' : 'scale(1) translateY(0)',
    opacity: isClosing ? 0 : 1,
    transition: 'all 200ms ease-out',
    display: 'flex',
    flexDirection: 'column'
  };

  const mainChildren = [];
  let footerChild = null;

  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && child.props['data-modal-footer']) {
      footerChild = child;
    } else {
      mainChildren.push(child);
    }
  });

  return createPortal(
    <div style={overlayStyle} onClick={handleOverlayClick} ref={modalRef}>
      <div 
        style={cardStyle} 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 id="modal-title" style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="hover:bg-hover transition-colors"
            style={{
              width: '28px', height: '28px',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {mainChildren}
        </div>

        {/* Footer */}
        {footerChild && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            {footerChild}
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default Modal;
