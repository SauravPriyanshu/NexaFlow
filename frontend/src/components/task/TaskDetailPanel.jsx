import React, { useState, useEffect } from 'react';
import { Calendar, Trash, UserPlus, CheckSquare, Plus, X } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { useAI } from '../../context/AIContext';
import taskService from '../../services/taskService';
import SlidePanel from '../shared/SlidePanel';
import Select from '../shared/Select';
import FileSection from './FileSection';
import CommentSection from '../comments/CommentSection';
import ActivityMiniFeed from './ActivityMiniFeed';

const Section = ({ title, children, headerRight }) => (
  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      {headerRight}
    </div>
    {children}
  </div>
);

const TaskDetailPanel = ({ isOpen, onClose, task, onStatusChange }) => {
  const { updateTask, removeTask } = useTask();
  const { currentProject } = useProject();
  const toast = useToast();
  const { openAI, dispatchContextualSuggestion } = useAI();
  
  const [localTask, setLocalTask] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newLabelText, setNewLabelText] = useState('');
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);

  useEffect(() => {
    if (task) setLocalTask({ ...task });
  }, [task]);

  useEffect(() => {
    if (isOpen && localTask?.title) {
      dispatchContextualSuggestion({
        text: `Would you like to summarize the recent activity and comments for task "${localTask.title}"?`,
        buttonText: 'Summarize Task',
        action: () => {
          openAI('summarize');
        }
      });
    } else {
      dispatchContextualSuggestion(null);
    }
    return () => dispatchContextualSuggestion(null);
  }, [isOpen, localTask?.title, dispatchContextualSuggestion, openAI]);

  const handleFileUpload = (e) => {
    console.log('File upload placeholder', e.target.files);
  };

  if (!isOpen || !localTask) return null;

  const handleUpdate = async (updates) => {
    try {
      setLocalTask(prev => ({ ...prev, ...updates }));
      updateTask(localTask._id, updates);
      await taskService.updateTask(localTask._id, updates);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(localTask._id);
      removeTask(localTask._id);
      toast.success('Task deleted successfully');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (val) => {
    if (onStatusChange && localTask.status !== val) {
      const oldStatus = localTask.status;
      setLocalTask(prev => ({ ...prev, status: val })); // Optimistic UI update
      try {
        await onStatusChange(localTask._id, oldStatus, val);
      } catch (err) {
        setLocalTask(prev => ({ ...prev, status: oldStatus })); // Revert on failure
      }
    }
  };
  const handlePriorityChange = (val) => handleUpdate({ priority: val });

  const handleAddChecklist = async (e) => {
    if (e.key === 'Enter' && newChecklistText.trim()) {
      const newItem = { id: Math.random().toString(36).substr(2, 9), text: newChecklistText.trim(), done: false };
      const newChecklists = [...(localTask.checklists || []), newItem];
      await handleUpdate({ checklists: newChecklists });
      setNewChecklistText('');
    }
  };

  const toggleChecklist = async (id, done) => {
    const newChecklists = localTask.checklists.map(c => c.id === id ? { ...c, done } : c);
    setLocalTask(prev => ({ ...prev, checklists: newChecklists }));
    updateTask(localTask._id, { checklists: newChecklists });
    try {
      await taskService.updateChecklist(localTask._id, { checklistId: id, done });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteChecklist = async (id) => {
    const newChecklists = localTask.checklists.filter(c => c.id !== id);
    await handleUpdate({ checklists: newChecklists });
  };

  const handleAddLabel = async (e) => {
    if (e.key === 'Enter' && newLabelText.trim()) {
      const lbl = newLabelText.trim();
      if (!(localTask.labels || []).includes(lbl)) {
        await handleUpdate({ labels: [...(localTask.labels || []), lbl] });
      }
      setNewLabelText('');
      setShowAddLabel(false);
    }
  };

  const handleAddAssignee = async (userId) => {
    if (!localTask.assignees?.find(a => a._id === userId)) {
      const userObj = currentProject.members.find(m => m.userId._id === userId).userId;
      const newAssignees = [...(localTask.assignees || []), userObj];
      // Update backend with array of IDs
      await taskService.updateTask(localTask._id, { assignees: newAssignees.map(a => a._id) });
      // Update local state with objects
      setLocalTask(prev => ({ ...prev, assignees: newAssignees }));
      
      // Also update context task so board is in sync
      const res = await taskService.getTaskById(localTask._id);
      updateTask(res.data.data);
    }
    setShowAssigneePicker(false);
  };

  const removeAssignee = async (userId) => {
    const newAssignees = (localTask.assignees || []).filter(a => a._id !== userId);
    await taskService.updateTask(localTask._id, { assignees: newAssignees.map(a => a._id) });
    setLocalTask(prev => ({ ...prev, assignees: newAssignees }));
    const res = await taskService.getTaskById(localTask._id);
    updateTask(res.data.data);
  };

  const removeLabel = async (label) => {
    await handleUpdate({ labels: localTask.labels.filter(l => l !== label) });
  };


  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title="Task Details" width="560px">
      
      {/* PANEL HEADER / TITLE */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
        {isEditingTitle ? (
          <textarea
            autoFocus
            style={{
              width: '100%', fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)',
              background: 'var(--bg-input)', border: 'none', borderRadius: '6px', padding: '4px 8px', outline: 'none',
              resize: 'none', overflow: 'hidden'
            }}
            value={localTask.title}
            onChange={(e) => setLocalTask({...localTask, title: e.target.value})}
            onBlur={() => { setIsEditingTitle(false); handleUpdate({ title: localTask.title }); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.ctrlKey) e.currentTarget.blur(); }}
            rows={2}
          />
        ) : (
          <h2 
            style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', padding: '4px 8px', marginLeft: '-8px', borderRadius: '6px' }}
            className="hover:bg-hover transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            {localTask.title}
          </h2>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <div style={{ width: '140px' }}>
            <Select 
              value={localTask.status} 
              onChange={handleStatusChange} 
              options={
                currentProject?.taskStatuses && currentProject.taskStatuses.length > 0
                  ? currentProject.taskStatuses.map(s => ({ value: s.id, label: s.title }))
                  : [
                      { value: 'todo', label: 'Todo' }, { value: 'in_progress', label: 'In Progress' },
                      { value: 'review', label: 'Review' }, { value: 'testing', label: 'Testing' }, { value: 'done', label: 'Done' }
                    ]
              } 
            />
          </div>
          <div style={{ width: '120px' }}>
            <Select 
              value={localTask.priority} 
              onChange={handlePriorityChange} 
              options={[
                { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }
              ]} 
            />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar hardware-scroll">
        
        <Section title="Assignees">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative' }}>
            {(localTask.assignees || []).map(u => (
              <div key={u._id} className="group" style={{
                height: '28px', background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-full)', padding: '0 8px 0 4px',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {u.avatar ? <img src={u.avatar} style={{width:'100%', height:'100%', borderRadius:'50%'}} /> : u.name.charAt(0)}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.name.split(' ')[0]}</span>
                <button onClick={() => removeAssignee(u._id)} className="opacity-0 group-hover:opacity-100 hover:text-error transition-all" style={{ color: 'var(--text-muted)' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
              <button 
                onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                style={{
                  height: '24px', border: 'none', background: 'var(--accent)',
                  borderRadius: '4px', padding: '0 10px', fontSize: '12px', color: '#fff',
                  display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                }} className="hover:bg-accent-hover transition-colors">
                Add
              </button>

            {showAssigneePicker && currentProject && (
              <div style={{
                position: 'absolute', top: '100%', left: '0', marginTop: '8px', zIndex: 10,
                width: '200px', background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: '8px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '150px', overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderBottom: '1px solid var(--border-default)', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Assignees</span>
                  <button type="button" onClick={() => setShowAssigneePicker(false)} style={{ color: 'var(--text-muted)' }}><X size={14}/></button>
                </div>
                {currentProject.members.filter(m => !(localTask.assignees || []).find(a => a._id === m.userId._id)).map(m => (
                  <div 
                    key={m.userId._id} 
                    onClick={() => handleAddAssignee(m.userId._id)}
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
                {currentProject.members.filter(m => !(localTask.assignees || []).find(a => a._id === m.userId._id)).length === 0 && (
                  <div style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No more members to add.
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>

        <Section title="Due date">
          <input
            type="date"
            value={localTask.dueDate ? localTask.dueDate.split('T')[0] : ''}
            onChange={(e) => handleUpdate({ dueDate: e.target.value })}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              colorScheme: 'dark', cursor: 'pointer'
            }}
          />
        </Section>

        <Section title="Labels">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(localTask.labels || []).map(lbl => {
              const hash = lbl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const colors = ['#06b6d4','#8b5cf6','#10b981','#f59e0b','#ec4899'];
              const c = colors[hash % colors.length];
              return (
                <div key={lbl} className="group" style={{
                  height: '22px', padding: '0 8px', borderRadius: '4px',
                  background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c,
                  fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  {lbl}
                  <button onClick={() => removeLabel(lbl)} className="opacity-0 group-hover:opacity-100 hover:text-[#fff] transition-all">
                    <X size={10} />
                  </button>
                </div>
              );
            })}
            
            {showAddLabel ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  autoFocus
                  value={newLabelText}
                  onChange={e => setNewLabelText(e.target.value)}
                  onKeyDown={handleAddLabel}
                  placeholder="Type label name..."
                  style={{ 
                    height: '26px', fontSize: '13px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', 
                    borderRadius: '4px', padding: '0 8px', color: 'var(--text-primary)', outline: 'none', width: '120px'
                  }}
                />
                <button 
                  onClick={() => handleAddLabel({ key: 'Enter' })}
                  style={{ padding: '4px 8px', background: 'var(--accent)', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                >
                  Add
                </button>
                <button 
                  onClick={() => setShowAddLabel(false)}
                  style={{ padding: '4px', color: 'var(--text-muted)' }}
                  className="hover:text-text-primary"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddLabel(true)}
                style={{ 
                  height: '24px', padding: '0 10px', fontSize: '12px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px',
                  color: '#fff', background: 'var(--accent)', border: 'none', cursor: 'pointer'
                }}
                className="hover:bg-accent-hover transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </Section>

        <Section title="Description">
          {isEditingDesc ? (
            <div>
              <textarea
                autoFocus
                style={{
                  width: '100%', minHeight: '100px', background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical'
                }}
                className="focus:border-accent focus:ring-[3px] focus:ring-accent/10"
                value={localTask.description}
                onChange={(e) => setLocalTask({...localTask, description: e.target.value})}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  onClick={() => { setIsEditingDesc(false); handleUpdate({ description: localTask.description }); }}
                  style={{ padding: '6px 12px', background: 'var(--accent)', color: '#fff', borderRadius: '4px', fontSize: '13px', fontWeight: 500 }}
                  className="hover:bg-accent-hover transition-colors"
                >Save</button>
                <button 
                  onClick={() => setIsEditingDesc(false)}
                  style={{ padding: '6px 12px', color: 'var(--text-muted)', fontSize: '13px' }}
                  className="hover:text-text-primary"
                >Cancel</button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingDesc(true)}
              style={{ fontSize: '14px', color: localTask.description ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'text', lineHeight: 1.5, minHeight: '40px' }}
            >
              {localTask.description || 'Add description...'}
            </div>
          )}
        </Section>

        <Section 
          title="Checklist" 
          headerRight={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {(localTask.checklists || []).filter(c => c.done).length} of {(localTask.checklists || []).length}
              </span>
              <button style={{ color: 'var(--text-muted)' }} className="hover:text-error transition-colors" onClick={() => handleUpdate({ checklists: [] })}>
                <Trash size={14} />
              </button>
            </div>
          }
        >
          {localTask.checklists && localTask.checklists.length > 0 && (
            <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s ease',
                width: `${((localTask.checklists.filter(c => c.done).length / localTask.checklists.length) * 100) || 0}%`
              }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {(localTask.checklists || []).map(item => (
              <div key={item.id} className="group" style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', 
                background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '6px' 
              }}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) => toggleChecklist(item.id, e.target.checked)}
                  style={{
                    width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)',
                    border: '1.5px solid var(--border-default)', borderRadius: '4px'
                  }}
                />
                <span style={{
                  flex: 1, fontSize: '14px', color: item.done ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: item.done ? 'line-through' : 'none'
                }}>
                  {item.text}
                </span>
                <button 
                  onClick={() => deleteChecklist(item.id)}
                  style={{ color: 'var(--text-muted)' }}
                  className="opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px dashed var(--border-default)', borderRadius: '6px' }}>
            <input 
              value={newChecklistText}
              onChange={e => setNewChecklistText(e.target.value)}
              onKeyDown={handleAddChecklist}
              placeholder="Add an item..."
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
            />
            <button 
              onClick={() => handleAddChecklist({ key: 'Enter' })}
              style={{ height: '24px', padding: '0 10px', background: 'var(--accent)', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
              className="hover:bg-accent-hover transition-colors"
            >
              Add
            </button>
          </div>
        </Section>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <FileSection taskId={localTask._id} projectId={localTask.projectId} />
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <CommentSection taskId={localTask._id} projectId={localTask.projectId} />
        </div>

        <ActivityMiniFeed taskId={localTask._id} projectId={localTask.projectId} />

      </div>

      {/* FOOTER */}
      <div style={{
        padding: '12px 20px', borderTop: '1px solid var(--border-default)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Created {new Date(localTask.createdAt).toLocaleDateString()}
        </div>
        {showConfirmDelete ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowConfirmDelete(false)}
              style={{
                height: '28px', padding: '0 10px', fontSize: '13px', fontWeight: 500,
                borderRadius: '4px', color: 'var(--text-muted)'
              }}
              className="hover:bg-hover transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              style={{
                height: '28px', padding: '0 10px', fontSize: '13px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '4px',
                color: '#fff', background: 'var(--color-error)'
              }}
              className="hover:bg-error/90 transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowConfirmDelete(true)}
            style={{
              height: '28px', padding: '0 10px', fontSize: '13px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '4px',
              color: 'var(--color-error)'
            }}
            className="hover:bg-error/10 transition-colors"
          >
            <Trash size={14} /> Delete
          </button>
        )}
      </div>

    </SlidePanel>
  );
};

export default TaskDetailPanel;
