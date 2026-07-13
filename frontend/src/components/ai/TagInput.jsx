import React, { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ label, placeholder, tags, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '8px' }}>{label}</div>
      <div style={{ minHeight: '44px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', transition: 'border-color 0.15s' }}>
        {tags.map((tag, i) => (
          <div key={i} style={{ height: '24px', padding: '0 8px 0 10px', borderRadius: '12px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {tag}
            <button onClick={() => removeTag(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', cursor: 'pointer', background: 'transparent' }} className="hover:text-text-primary">
              <X size={12} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            const val = inputValue.trim();
            if (val && !tags.includes(val)) {
              onChange([...tags, val]);
            }
            setInputValue('');
          }}
          placeholder={tags.length === 0 ? placeholder : 'Type feature, press Enter'}
          style={{ flex: 1, minWidth: '160px', background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)' }}
        />
      </div>
    </div>
  );
};

export default TagInput;
