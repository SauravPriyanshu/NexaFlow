import React from 'react';

const VARIANTS = {
  default: { bg: 'var(--border-default)', color: 'var(--text-secondary)' },
  success: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  warning: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  danger: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  info: { bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
  purple: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }
};

const SIZES = {
  sm: { fontSize: '11px', padding: '2px 8px', borderRadius: '4px' },
  md: { fontSize: '12px', padding: '3px 10px', borderRadius: '6px' }
};

const Badge = ({ label, variant = 'default', size = 'md' }) => {
  const v = VARIANTS[variant] || VARIANTS.default;
  const s = SIZES[size] || SIZES.md;
  
  return (
    <span style={{
      background: v.bg,
      color: v.color,
      fontSize: s.fontSize,
      padding: s.padding,
      borderRadius: s.borderRadius,
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap'
    }}>
      {label}
    </span>
  );
};

export default Badge;
