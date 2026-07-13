import React, { useState, useEffect } from 'react';

const CacheIndicator = () => {
  const [status, setStatus] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (!import.meta.env.DEV) return;

    let hideTimer;
    
    const handleCacheEvent = (e) => {
      const cacheStatus = e.detail;
      setStatus(cacheStatus);
      setVisible(true);

      // Hide after 3 seconds (opacity fades out before unmounting)
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 3000);
    };

    window.addEventListener('nexaflow:cache', handleCacheEvent);
    
    return () => {
      window.removeEventListener('nexaflow:cache', handleCacheEvent);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!import.meta.env.DEV || (!visible && !status)) return null;

  const isHit = status === 'HIT';

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      zIndex: 99,
      height: '24px',
      padding: '0 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 500,
      fontFamily: 'monospace',
      display: 'flex',
      alignItems: 'center',
      background: isHit ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.1)',
      color: isHit ? '#10b981' : '#f59e0b',
      border: `1px solid ${isHit ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.2)'}`,
      opacity: visible ? 1 : 0,
      transition: visible ? 'opacity 150ms ease-in' : 'opacity 500ms ease-out',
      pointerEvents: 'none'
    }}>
      {isHit ? '⚡ Cache HIT' : '○ Cache MISS'}
    </div>
  );
};

export default CacheIndicator;
