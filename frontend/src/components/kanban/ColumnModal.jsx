import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import ConfirmDialog from '../shared/ConfirmDialog';

const COLORS = [
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e',
  '#f97316', '#eab308', '#10b981', '#14b8a6', '#64748b'
];

const DEFAULT_COLUMNS = ['todo', 'in_progress', 'review', 'testing', 'done'];

const ColumnModal = ({ isOpen, onClose, onSave, onDelete, columnData }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (columnData) {
        setTitle(columnData.title || '');
        setColor(columnData.color || COLORS[0]);
      } else {
        setTitle('');
        setColor(COLORS[0]);
      }
    }
  }, [isOpen, columnData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      id: columnData ? columnData.id : title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now(),
      title: title.trim(),
      color
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div 
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} 
        onClick={onClose} 
      />
      <div style={{
        position: 'relative',
        width: '400px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {columnData ? 'Edit Column' : 'Add Column'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px' }} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
          }
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Column Name
            </label>
            <input 
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. In Review"
              style={{
                width: '100%', height: '36px', padding: '0 12px',
                background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Color Theme
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: c, border: color === c ? `2px solid #fff` : '2px solid transparent',
                    boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  className="hover:scale-110 transition-transform"
                >
                  {color === c && <Check size={16} color="#fff" />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {columnData && !DEFAULT_COLUMNS.includes(columnData.id) && (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                style={{
                  padding: '8px 16px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#ef4444', borderRadius: '6px', fontWeight: 500, marginRight: 'auto'
                }}
                className="hover:bg-red-500 hover:text-white transition-colors"
              >
                Delete Column
              </button>
            )}
            <button 
              type="button" onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '14px', color: 'var(--text-secondary)', borderRadius: '6px' }}
              className="hover:bg-hover transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim()}
              style={{
                padding: '8px 16px', fontSize: '14px', background: 'var(--accent)', 
                color: '#fff', borderRadius: '6px', fontWeight: 500,
                opacity: title.trim() ? 1 : 0.5
              }}
              className="hover:bg-accent-hover transition-colors"
            >
              Save Column
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          onDelete(columnData.id);
        }}
        title="Delete Column"
        message="Are you sure you want to delete this column? Any tasks inside will automatically be moved to the default Todo column."
        confirmLabel="Delete Column"
      />
    </div>
  );
};

export default ColumnModal;
