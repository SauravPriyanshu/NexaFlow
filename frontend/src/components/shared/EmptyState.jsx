import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '56px', height: '56px',
        borderRadius: '12px',
        background: 'var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        {Icon && <Icon size={24} color="#475569" />}
      </div>
      
      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '8px' }}>
        {title}
      </h3>
      
      <p style={{
        fontSize: '14px', color: 'var(--text-muted)',
        maxWidth: '300px', lineHeight: 1.6
      }}>
        {description}
      </p>
      
      {action && (
        <button 
          onClick={action.onClick}
          className="hover:bg-accent-hover transition-colors"
          style={{
            marginTop: '20px',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 500,
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '6px'
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
