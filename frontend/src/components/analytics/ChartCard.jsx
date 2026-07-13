import React from 'react';
import EmptyState from '../shared/EmptyState';

const ChartCard = ({ title, subtitle, children, headerRight, loading, empty, emptyIcon, emptyTitle, height = '240px' }) => {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>
              {subtitle}
            </div>
          )}
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>

      <div style={{
        padding: '20px',
        height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {loading ? (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'var(--border-default)',
            borderRadius: 'var(--radius-md)',
            animation: 'ai-pulse 1.5s infinite'
          }} />
        ) : empty ? (
          <EmptyState icon={emptyIcon} title={emptyTitle} />
        ) : (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
