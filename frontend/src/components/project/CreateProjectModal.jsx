import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import Modal from '../shared/Modal';

const COLORS = ['#06b6d4','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#f97316','#6366f1'];

const CreateProjectModal = ({ isOpen, onClose, orgId }) => {
  const { createProject } = useProject();
  const [formData, setFormData] = useState({
    name: '', description: '', color: COLORS[0], dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await createProject({ ...formData, orgId });
      setFormData({ name: '', description: '', color: COLORS[0], dueDate: '' });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button 
        type="button" 
        onClick={onClose} 
        style={{
          padding: '8px 16px', fontSize: '14px', fontWeight: 500,
          color: 'var(--text-secondary)', borderRadius: '6px'
        }}
        className="hover:bg-hover transition-colors"
      >
        Cancel
      </button>
      <button 
        type="submit" 
        form="create-project-form"
        style={{
          padding: '8px 16px', fontSize: '14px', fontWeight: 500,
          background: 'var(--accent)', color: '#fff', borderRadius: '6px',
          opacity: loading ? 0.7 : 1
        }}
        className="transition-colors hover:bg-accent-hover"
      >
        {loading ? 'Creating...' : 'Create project'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New project" size="md">
      <form id="create-project-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Project name <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Marketing Campaign"
            required
            style={{
              width: '100%', height: '40px',
              background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', padding: '0 14px',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
            }}
            className="focus:border-accent focus:ring-[3px] focus:ring-accent/10 transition-all"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What is this project about?"
            style={{
              width: '100%', minHeight: '80px', maxHeight: '160px',
              background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.5,
              resize: 'vertical', fontFamily: 'inherit', outline: 'none'
            }}
            className="focus:border-accent focus:ring-[3px] focus:ring-accent/10 transition-all"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Project color
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {COLORS.map(c => {
              const isSelected = formData.color === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: c, cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'transform var(--transition-fast)',
                    borderColor: isSelected ? 'white' : 'transparent',
                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 0 3px rgba(255,255,255,0.1)' : 'none'
                  }}
                  className={!isSelected ? "hover:scale-110" : ""}
                />
              )
            })}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Due date <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            style={{
              width: '100%', height: '40px',
              background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', padding: '0 14px',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              colorScheme: 'dark'
            }}
            className="focus:border-accent focus:ring-[3px] focus:ring-accent/10 transition-all"
          />
        </div>

      </form>
      <div data-modal-footer>{footer}</div>
    </Modal>
  );
};

export default CreateProjectModal;
