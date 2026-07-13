import React from 'react';

const shimmerStyle = {
  background: 'linear-gradient(90deg, var(--border-default) 25%, #243050 50%, var(--border-default) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

const Skeleton = ({ width, height, borderRadius = '6px', style = {} }) => {
  return (
    <div style={{
      width, height, borderRadius, ...shimmerStyle, ...style
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  );
};

export const SkeletonText = ({ width = '100%', height = '14px', borderRadius = '4px' }) => (
  <Skeleton width={width} height={height} borderRadius={borderRadius} />
);

export const SkeletonAvatar = ({ size = '32px' }) => (
  <Skeleton width={size} height={size} borderRadius="50%" />
);

export const SkeletonCard = () => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    gap: '12px'
  }}>
    <SkeletonAvatar size="40px" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
      <SkeletonText width="60%" height="12px" />
      <SkeletonText width="40%" height="12px" />
    </div>
  </div>
);

export default Skeleton;
