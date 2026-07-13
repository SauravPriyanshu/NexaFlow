import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Select from '../shared/Select';
import taskService from '../../services/taskService';
import { useTask } from '../../context/TaskContext';
import { useProject } from '../../context/ProjectContext';
import { X } from 'lucide-react';

const AddTaskModal = ({ isOpen, onClose, initialStatus = 'todo', projectId, orgId }) => {
  const { addTask } = useTask();
  const { currentProject } = useProject();
  
  const [formData, setFormData] = useState({
    title: '',
    status: initialStatus,
    priority: 'medium',
    dueDate: '',
    assignees: [] 
  });
  
  const [loading, setLoading] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const response = await taskService.createTask({
        ...formData, projectId, orgId
      });
      addTask(response.data);
      onClose();
      setFormData({
        title: '', status: initialStatus, priority: 'medium', dueDate: '', assignees: []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        type="submit" form="add-task-form"
        style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, background: 'var(--accent)', color: '#fff', borderRadius: '6px', opacity: loading ? 0.7 : 1 }}
        className="transition-colors hover:bg-accent-hover"
      >
        {loading ? 'Adding...' : 'Add task'}
      </button>
    </>
  );

  const statusOptions = currentProject?.taskStatuses && currentProject.taskStatuses.length > 0
    ? currentProject.taskStatuses.map(s => ({ value: s.id, label: s.title }))
    : [
      { value: 'todo', label: 'Todo' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'review', label: 'Review' },
      { value: 'testing', label: 'Testing' },
      { value: 'done', label: 'Done' }
    ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add task" size="sm">
      <form id="add-task-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Task title"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Status</label>
            <Select 
              value={formData.status} 
              onChange={(v) => handleSelectChange('status', v)} 
              options={statusOptions} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Priority</label>
            <Select 
              value={formData.priority} 
              onChange={(v) => handleSelectChange('priority', v)} 
              options={priorityOptions} 
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Assignees</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative' }}>
            {formData.assignees.map(userId => {
              const u = currentProject?.members.find(m => m.userId._id === userId)?.userId;
              if (!u) return null;
              return (
                <div key={userId} className="group" style={{
                  height: '28px', background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-full)', padding: '0 8px 0 4px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {u.avatar ? <img src={u.avatar} style={{width:'100%', height:'100%', borderRadius:'50%'}} /> : u.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.name.split(' ')[0]}</span>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, assignees: prev.assignees.filter(id => id !== userId) }))} 
                    className="opacity-0 group-hover:opacity-100 hover:text-error transition-all" 
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
            
            <button 
              type="button" 
              onClick={() => setShowAssigneePicker(!showAssigneePicker)}
              style={{
                height: '24px', border: 'none', background: 'var(--accent)',
                borderRadius: '4px', padding: '0 10px', fontSize: '12px', color: '#fff',
                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
              }} 
              className="hover:bg-accent-hover transition-colors"
            >
              Add
            </button>

            {showAssigneePicker && currentProject && (
              <div style={{
                width: '100%', marginTop: '8px', background: 'var(--bg-input)', 
                border: '1px solid var(--border-default)', borderRadius: '6px', padding: '4px',
                display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '150px', overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderBottom: '1px solid var(--border-default)', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Assignees</span>
                  <button type="button" onClick={() => setShowAssigneePicker(false)} style={{ color: 'var(--text-muted)' }}><X size={14}/></button>
                </div>
                {currentProject.members.filter(m => !formData.assignees.includes(m.userId._id)).map(m => (
                  <div 
                    key={m.userId._id} 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, assignees: [...prev.assignees, m.userId._id] }));
                    }}
                    style={{ 
                      padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '4px' 
                    }}
                    className="hover:bg-hover transition-colors"
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      {m.userId.avatar ? <img src={m.userId.avatar} style={{width:'100%', height:'100%', borderRadius:'50%'}} /> : m.userId.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{m.userId.name}</span>
                  </div>
                ))}
                {currentProject.members.filter(m => !formData.assignees.includes(m.userId._id)).length === 0 && (
                  <div style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No more members to add.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Due date <span style={{ opacity: 0.7 }}>(optional)</span>
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
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
            }}
            className="focus:border-accent focus:ring-[3px] focus:ring-accent/10 transition-all"
          />
        </div>

      </form>
      <div data-modal-footer>{footer}</div>
    </Modal>
  );
};

export default AddTaskModal;
