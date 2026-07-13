import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, trend, loading }) => {
  return (
    <div 
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        transition: 'all 0.2s ease',
        cursor: 'default'
      }}
      className="hover:border-border-hover"
    >
      <div style={{
        width: '40px',
        height: '40px',
        flexShrink: 0,
        borderRadius: '10px',
        background: `${color}1f`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {Icon && <Icon size={20} color={color} />}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
          {label}
        </div>
        {loading ? (
          <div style={{ width: '80px', height: '28px', background: 'var(--border-default)', borderRadius: '4px', animation: 'ai-pulse 1.5s infinite' }} />
        ) : (
          <div style={{ fontSize: '28px', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1 }}>
            {value}
          </div>
        )}
        {trend && !loading && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {trend.direction === 'up' && <TrendingUp size={12} color="#10b981" />}
            {trend.direction === 'down' && <TrendingDown size={12} color="#ef4444" />}
            {trend.direction === 'neutral' && <Minus size={12} color="#94a3b8" />}
            
            <span style={{ 
              fontSize: '12px', 
              color: trend.direction === 'up' ? '#10b981' : trend.direction === 'down' ? '#ef4444' : '#94a3b8' 
            }}>
              {trend.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
