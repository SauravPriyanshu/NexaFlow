import React from 'react';

const AITextarea = ({ label, value, onChange, placeholder, maxChars, minHeight = '120px', monospace }) => {
  const chars = value?.length || 0;
  const ratio = maxChars ? chars / maxChars : 0;
  
  let counterColor = 'var(--text-muted)';
  if (ratio > 0.95) counterColor = '#ef4444';
  else if (ratio > 0.8) counterColor = '#f59e0b';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
          {label}
        </div>
        {maxChars && (
          <div style={{ fontSize: '12px', color: counterColor }}>
            {chars.toLocaleString()} / {maxChars.toLocaleString()}
          </div>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight,
          maxHeight: '320px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          color: 'var(--text-primary)',
          fontSize: monospace ? '13px' : '14px',
          fontFamily: monospace ? "'Courier New', Courier, monospace" : "inherit",
          lineHeight: 1.6,
          resize: 'vertical',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--border-focus)';
          e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-default)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
};

export default AITextarea;
