import React, { useState } from 'react';

const FilterPanel = ({ onClose, initialFilters = {}, onApply }) => {
  const [filters, setFilters] = useState(initialFilters);

  const handlePriorityToggle = (p) => {
    setFilters(prev => {
      const current = prev.priority || [];
      if (current.includes(p)) {
        return { ...prev, priority: current.filter(x => x !== p) };
      } else {
        return { ...prev, priority: [...current, p] };
      }
    });
  };

  const handleLabelToggle = (label) => {
    setFilters(prev => {
      const current = prev.label || [];
      if (current.includes(label)) {
        return { ...prev, label: current.filter(x => x !== label) };
      } else {
        return { ...prev, label: [...current, label] };
      }
    });
  };

  const handleClear = () => {
    setFilters({});
    onApply({});
    onClose();
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 19 }} 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
      />
      <div style={{
        width: '280px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        zIndex: 20,
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
      }}>
      {/* SECTIONS */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Priority</h4>
        {['urgent', 'high', 'medium', 'low'].map(p => (
          <label key={p} style={{
            height: '32px', display: 'flex', alignItems: 'center', gap: '10px',
            borderRadius: '6px', padding: '0 8px', cursor: 'pointer'
          }} className="hover:bg-hover">
            <input 
              type="checkbox" 
              checked={(filters.priority || []).includes(p)}
              onChange={() => handlePriorityToggle(p)}
              style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} 
            />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--priority-${p})` }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p}</span>
          </label>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Labels</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['Frontend', 'Backend', 'Design', 'Bug'].map(label => {
            const isSelected = (filters.label || []).includes(label);
            return (
              <button 
                key={label}
                onClick={() => handleLabelToggle(label)}
                style={{
                  height: '24px', padding: '0 10px', borderRadius: '12px',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-default)', 
                  fontSize: '12px',
                  color: isSelected ? 'var(--accent)' : 'var(--text-secondary)', 
                  background: isSelected ? 'rgba(6,182,212,0.1)' : 'transparent'
                }} className="hover:border-accent hover:text-accent transition-colors">
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
        <button onClick={handleClear} style={{ fontSize: '13px', color: 'var(--text-muted)' }} className="hover:text-text-primary">
          Clear all
        </button>
        <button onClick={handleApply} style={{
          padding: '6px 12px', background: 'var(--accent)', color: '#fff',
          borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 500
        }} className="hover:bg-accent-hover transition-colors">
          Apply
        </button>
      </div>
      </div>
    </>
  );
};

export default FilterPanel;
