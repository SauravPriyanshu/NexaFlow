import React from 'react';

const Tabs = ({ tabs = [], activeTab, onChange }) => {
  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid var(--border-default)',
      gap: 0
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="group hover:text-text-secondary transition-all"
            style={{
              padding: '0 16px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              marginBottom: '-1px', // overlap container border
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 500,
                border: isActive ? 'none' : '1px solid var(--border-default)'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
