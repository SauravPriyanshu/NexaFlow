import React from 'react';
import { ArrowRight } from 'lucide-react';

const STATUS_CONFIG = {
  todo: { label: 'Todo', color: '#94a3b8' },
  in_progress: { label: 'In Progress', color: '#06b6d4' },
  review: { label: 'Review', color: '#8b5cf6' },
  testing: { label: 'Testing', color: '#f59e0b' },
  done: { label: 'Done', color: '#10b981' }
};

const StatusChangeBadge = ({ sourceStatus, destStatus }) => {
  if (!sourceStatus || !destStatus || sourceStatus === destStatus) return null;

  const src = STATUS_CONFIG[sourceStatus] || { label: sourceStatus, color: '#94a3b8' };
  const dst = STATUS_CONFIG[destStatus] || { label: destStatus, color: '#06b6d4' };

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '20px',
        padding: '6px 14px 6px 10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'badge-appear 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: src.color }} />
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{src.label}</span>
        
        <ArrowRight size={14} color="#475569" />
        
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dst.color }} />
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{dst.label}</span>
      </div>
    </div>
  );
};

export default StatusChangeBadge;
