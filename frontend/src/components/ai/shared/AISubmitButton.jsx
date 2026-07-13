import React from 'react';

const AISubmitButton = ({ label, icon: Icon, loading, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        height: '44px',
        background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        color: 'var(--bg-page)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        width: '100%',
        opacity: disabled ? 0.5 : (loading ? 0.8 : 1),
        boxShadow: (disabled || loading) ? 'none' : '0 4px 12px rgba(6,182,212,0.25)',
        ...(loading ? {
          backgroundSize: '200% 100%',
          animation: 'ai-thinking 1.5s linear infinite'
        } : {})
      }}
      onMouseOver={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = 'linear-gradient(135deg, #22d3ee 0%, #38bdf8 100%)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(6,182,212,0.35)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(6,182,212,0.25)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(6,182,212,0.25)';
        }
      }}
    >
      {loading ? (
        <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        Icon && <Icon size={16} />
      )}
      {loading ? 'Thinking...' : label}
    </button>
  );
};

export default AISubmitButton;
