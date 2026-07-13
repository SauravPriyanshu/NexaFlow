import React from 'react';

const SubTypeSelector = ({ options, value, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              height: '28px',
              padding: '0 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border-default)'}`,
              transition: 'all 0.15s',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)'
            }}
            className={!isActive ? "hover:bg-white/5 hover:text-text-secondary" : ""}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default SubTypeSelector;
