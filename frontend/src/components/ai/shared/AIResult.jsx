import React, { useState } from 'react';
import { CheckCircle, Copy, X, Check } from 'lucide-react';

const AIResult = ({ title, children, copyText, onClear, extras }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: '20px', animation: 'result-in 300ms ease-out forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={14} color="#10b981" />
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div style={{ height: '18px', padding: '0 7px', borderRadius: '4px', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontSize: '10px', display: 'flex', alignItems: 'center' }}>
            Done
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {extras}
          {copyText && (
            <button
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '12px', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', transition: 'background 0.15s' }}
              className="hover:bg-white/10"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          {onClear && (
            <button
              onClick={onClear}
              style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', transition: 'background 0.15s' }}
              className="hover:bg-white/10"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '16px', overflowY: 'auto', maxHeight: '500px' }}>
        {children}
      </div>
    </div>
  );
};

export default AIResult;
