import React from 'react';

const AIThinking = () => {
  return (
    <div style={{ margin: '20px 0', background: 'var(--ai-surface)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', animation: 'ai-pulse 1.2s ease-in-out infinite', animationDelay: '0s' }} />
        <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', animation: 'ai-pulse 1.2s ease-in-out infinite', animationDelay: '0.2s' }} />
        <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', animation: 'ai-pulse 1.2s ease-in-out infinite', animationDelay: '0.4s' }} />
      </div>
      <div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>NexaFlow AI is thinking...</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Usually takes 3–8 seconds</div>
      </div>
    </div>
  );
};

export default AIThinking;
