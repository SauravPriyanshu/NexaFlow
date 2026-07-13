import React, { useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

const MessageSearch = ({ 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  resultCount, 
  currentMatchIndex, 
  onNext, 
  onPrev 
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when mounted
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div style={{
      height: '56px',
      padding: '0 20px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideDown 0.2s ease-out forwards',
      transformOrigin: 'top'
    }}>
      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>

      <Search size={18} color="#475569" />
      
      <input
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search in this channel..."
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: '14px',
          color: 'var(--text-primary)',
          outline: 'none'
        }}
      />

      {searchQuery && resultCount > 0 && (
        <span style={{ fontSize: '12px', color: '#475569' }}>
          {currentMatchIndex + 1} of {resultCount} results
        </span>
      )}

      {searchQuery && resultCount === 0 && (
        <span style={{ fontSize: '12px', color: '#475569' }}>
          0 results
        </span>
      )}

      <div style={{ display: 'flex', gap: '4px' }}>
        <button 
          onClick={onPrev}
          disabled={resultCount === 0}
          style={{
            width: '28px', height: '28px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', color: resultCount === 0 ? 'var(--border-default)' : 'var(--text-secondary)',
            cursor: resultCount === 0 ? 'default' : 'pointer'
          }}
          className={resultCount > 0 ? "hover:bg-hover transition-colors" : ""}
        >
          <ChevronUp size={16} />
        </button>
        <button 
          onClick={onNext}
          disabled={resultCount === 0}
          style={{
            width: '28px', height: '28px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', color: resultCount === 0 ? 'var(--border-default)' : 'var(--text-secondary)',
            cursor: resultCount === 0 ? 'default' : 'pointer'
          }}
          className={resultCount > 0 ? "hover:bg-hover transition-colors" : ""}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--border-default)', margin: '0 4px' }} />

      <button 
        onClick={onClose}
        style={{
          width: '28px', height: '28px', borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
        }}
        className="hover:bg-hover hover:text-text-primary transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default MessageSearch;
