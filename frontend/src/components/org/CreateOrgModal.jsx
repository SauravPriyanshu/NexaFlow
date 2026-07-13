import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Modal from '../shared/Modal';
import axiosInstance from '../../utils/axiosInstance';
import { useToast } from '../../context/ToastContext';

const CreateOrgModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isOpen || !isMounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/orgs', { name, description });
      toast.success('Organization created successfully');
      onSuccess(response.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <>
      <button 
        type="button" onClick={onClose} 
        style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', borderRadius: '6px' }}
        className="hover:bg-hover transition-colors"
      >
        Cancel
      </button>
      <button 
        type="submit" form="create-org-form"
        style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, background: 'var(--accent)', color: '#fff', borderRadius: '6px', opacity: isLoading ? 0.7 : 1 }}
        className="transition-colors hover:bg-accent-hover"
      >
        {isLoading ? 'Creating...' : 'Create organization'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create organization" size="md">
      <form id="create-org-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corp"
            required
            autoFocus
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
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Description <span style={{ opacity: 0.7 }}>(optional)</span>
          </label>
          <textarea
            name="description"
            placeholder="What does your organization do?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%', minHeight: '90px',
              background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical'
            }}
            className="focus:border-accent focus:ring-[3px] focus:ring-accent/10 transition-all"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Upload logo <span style={{ opacity: 0.7 }}>(optional)</span>
          </label>
          <div style={{
            border: '2px dashed var(--border-default)', borderRadius: 'var(--radius-md)',
            height: '88px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }} className="hover:bg-hover hover:border-border-hover transition-all group">
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-input)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px'
            }} className="group-hover:bg-accent/10 transition-colors">
              <Upload size={16} className="text-text-muted group-hover:text-accent transition-colors" />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }} className="group-hover:text-accent transition-colors">
              Click to upload image
            </span>
          </div>
        </div>
      </form>
      <div data-modal-footer>{footer}</div>
    </Modal>
  );
};

export default CreateOrgModal;
