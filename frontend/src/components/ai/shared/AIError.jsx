import React from 'react';
import { AlertCircle } from 'lucide-react';

const AIError = ({ error, onRetry, countdown }) => {
  if (!error) return null;

  return (
    <div style={{ marginTop: '20px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', gap: '12px' }}>
      <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', color: '#f1f5f9' }}>
          {countdown !== null && countdown > 0 ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Rate limit reached. Try again in 
              <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 600, borderRadius: '4px', padding: '0 6px', fontSize: '13px' }}>
                {countdown}s
              </span>
            </span>
          ) : (
            error
          )}
        </div>
        {onRetry && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
            <button
              onClick={onRetry}
              disabled={countdown !== null && countdown > 0}
              style={{
                height: '28px', padding: '0 12px', borderRadius: '6px', fontSize: '12px', cursor: (countdown !== null && countdown > 0) ? 'not-allowed' : 'pointer',
                background: (countdown !== null && countdown > 0) ? 'transparent' : 'rgba(239,68,68,0.15)',
                color: (countdown !== null && countdown > 0) ? 'var(--text-muted)' : '#ef4444',
                border: 'none', transition: 'background 0.15s'
              }}
              className={(countdown === null || countdown <= 0) ? "hover:bg-red-500/20" : ""}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIError;
