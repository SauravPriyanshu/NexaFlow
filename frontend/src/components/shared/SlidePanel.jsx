import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const SlidePanel = ({ isOpen, onClose, title, subtitle, children, width = '480px' }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
          opacity: isClosing ? 0 : 1,
          transition: 'opacity 200ms ease-out'
        }} 
      />
      
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width,
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-default)',
        zIndex: 41,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: isClosing ? 'translateX(100%)' : 'translateX(0)',
        transition: 'transform 250ms ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          height: '56px',
          padding: '0 20px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button 
            onClick={onClose}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>{title}</h2>
            {subtitle && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 0 }} className="custom-scrollbar">
          {children}
        </div>

      </div>
    </>
  );
};

export default SlidePanel;
