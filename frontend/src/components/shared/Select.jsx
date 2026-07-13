import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ options = [], value, onChange, placeholder, size = 'md' }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          height: '48px',
          padding: '0 36px 0 16px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '14px',
          appearance: 'none',
          outline: 'none',
          transition: 'all var(--transition-fast)',
          cursor: 'pointer'
        }}
        className="focus:border-accent focus:ring-[3px] focus:ring-accent/10 hover:border-border-hover"
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown 
        size={16} 
        color="var(--text-muted)"
        style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
};

export default Select;
