import React, { useState } from 'react';
import { ListTodo, PlusSquare, Check, User, ExternalLink, Plus, CheckCircle } from 'lucide-react';
import { useAI } from '../../../context/AIContext';
import SubTypeSelector from '../shared/SubTypeSelector';
import AITextarea from '../shared/AITextarea';
import AISubmitButton from '../shared/AISubmitButton';
import AIThinking from '../shared/AIThinking';
import AIError from '../shared/AIError';
import taskService from '../../../services/taskService';
import { useProject } from '../../../context/ProjectContext';
import { useNavigate } from 'react-router-dom';

const ConvertTab = () => {
  const { tabState, updateTabState, runAI, loading, error, rateLimitCountdown, closeAI } = useAI();
  const state = tabState.convert;
  const { currentProject } = useProject();
  const navigate = useNavigate();

  const [addingIds, setAddingIds] = useState([]);
  const [addLoading, setAddLoading] = useState(false);

  const placeholders = {
    meeting_notes: "Alex will set up Redis caching by Friday\nSam to review the auth PR\nJordan is responsible for the UI redesign",
    requirements: "The system shall allow users to...\nUsers must be able to...",
    chat: "Paste the discussion..."
  };

  const handleSubmit = () => {
    updateTabState('convert', { addedTaskIds: [] });
    runAI('convert', state);
  };

  const handleAddTask = async (task, index) => {
    if (!currentProject) return;
    try {
      setAddingIds(prev => [...prev, index]);
      await taskService.createTask({
        title: task.title,
        description: task.description,
        priority: ['low', 'medium', 'high', 'urgent'].includes((task.priority || '').toLowerCase().trim()) 
          ? (task.priority || '').toLowerCase().trim() 
          : 'medium',
        projectId: currentProject._id,
        orgId: typeof currentProject.orgId === 'object' ? currentProject.orgId._id : currentProject.orgId,
        status: 'todo'
      });
      updateTabState('convert', prev => ({ addedTaskIds: [...prev.addedTaskIds, index] }));
    } catch (err) {
      console.error(err);
    } finally {
      setAddingIds(prev => prev.filter(id => id !== index));
    }
  };

  const handleAddAll = async () => {
    if (!currentProject || !state.result?.tasks) return;
    setAddLoading(true);
    for (let i = 0; i < state.result.tasks.length; i++) {
      if (!state.addedTaskIds.includes(i)) {
        await handleAddTask(state.result.tasks[i], i);
      }
    }
    setAddLoading(false);
  };

  const getPriorityColor = (p) => {
    if (p === 'urgent') return 'var(--priority-urgent)';
    if (p === 'high') return 'var(--priority-high)';
    if (p === 'medium') return 'var(--priority-medium)';
    if (p === 'low') return 'var(--priority-low)';
    return 'var(--status-todo)';
  };

  const tasks = state.result?.tasks || [];
  const allAdded = tasks.length > 0 && state.addedTaskIds.length === tasks.length;

  return (
    <div>
      <SubTypeSelector
        options={[
          { value: 'meeting_notes', label: '📋 Meeting notes' },
          { value: 'requirements', label: '📋 Requirements doc' },
          { value: 'chat', label: '💬 Chat thread' }
        ]}
        value={state.subType}
        onChange={(val) => updateTabState('convert', { subType: val })}
      />

      <AITextarea
        label="Content to convert"
        placeholder={placeholders[state.subType]}
        value={state.content}
        onChange={(val) => updateTabState('convert', { content: val })}
        maxChars={8000}
        minHeight="160px"
      />

      <AISubmitButton
        label="Extract tasks"
        icon={ListTodo}
        loading={loading}
        disabled={!state.content.trim()}
        onClick={handleSubmit}
      />
      
      {loading && <AIThinking />}
      <AIError error={error} onRetry={handleSubmit} countdown={rateLimitCountdown} />
      
      {state.result && !loading && (
        <div style={{ marginTop: '20px', animation: 'result-in 300ms ease-out forwards' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
              {tasks.length} tasks found
            </div>
            
            <button
              onClick={handleAddAll}
              disabled={allAdded || addLoading || !currentProject}
              style={{
                height: '28px', padding: '0 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: (allAdded || addLoading || !currentProject) ? 'not-allowed' : 'pointer',
                background: allAdded ? 'transparent' : 'var(--accent)', color: allAdded ? 'var(--color-success)' : 'white',
                border: allAdded ? '1px solid var(--border-default)' : 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s'
              }}
              className={!allAdded && !addLoading ? "hover:bg-accent-hover" : ""}
            >
              {allAdded ? <Check size={14} /> : <PlusSquare size={14} />}
              {addLoading ? `Adding ${state.addedTaskIds.length}/${tasks.length}...` : (allAdded ? 'All added' : 'Add all to board')}
            </button>
          </div>

          {!currentProject && !allAdded && (
            <div style={{ marginBottom: '14px', fontSize: '12px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '8px 12px', borderRadius: '6px' }}>
              Please select a project from the top bar to add these tasks.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map((task, i) => {
              const isAdded = state.addedTaskIds.includes(i);
              const isAdding = addingIds.includes(i);
              
              return (
                <div key={i} style={{
                  background: isAdded ? 'rgba(16,185,129,0.03)' : 'var(--bg-card)',
                  border: `1px solid ${isAdded ? 'rgba(16,185,129,0.3)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', gap: '12px', transition: 'border-color 0.15s'
                }}>
                  <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isAdded ? 'var(--color-success)' : 'var(--bg-input)', border: `1.5px solid ${isAdded ? 'var(--color-success)' : 'var(--border-default)'}`
                    }}>
                      {isAdded && <Check size={12} color="white" />}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{
                        fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        height: '18px', padding: '0 6px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em',
                        background: `${getPriorityColor(task.priority)}1a`, color: getPriorityColor(task.priority), display: 'flex', alignItems: 'center'
                      }}>
                        {task.priority || 'medium'}
                      </div>
                      {task.assignee && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} />
                          {task.assignee}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <button
                      onClick={() => handleAddTask(task, i)}
                      disabled={isAdded || isAdding || !currentProject}
                      style={{
                        height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: (isAdded || isAdding || !currentProject) ? 'not-allowed' : 'pointer',
                        background: 'transparent', color: isAdded ? '#10b981' : 'var(--text-secondary)',
                        border: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.15s'
                      }}
                      className={!isAdded && !isAdding ? "hover:bg-white/5" : ""}
                    >
                      {isAdding ? (
                        <svg style={{ animation: 'spin 1s linear infinite', width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      ) : isAdded ? (
                        <><Check size={14} /> Added</>
                      ) : (
                        <><Plus size={14} /> Add</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {allAdded && currentProject && (
            <div style={{ marginTop: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} color="#10b981" />
              <div style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary)' }}>
                {tasks.length} tasks created successfully!
              </div>
              <button 
                onClick={() => {
                  navigate(`/projects/${currentProject._id}/kanban`);
                  closeAI();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '28px', padding: '0 12px', borderRadius: '6px', fontSize: '12px', background: 'transparent', color: '#10b981', cursor: 'pointer' }}
                className="hover:bg-green-500/10 transition-colors"
              >
                View on board <ExternalLink size={14} />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ConvertTab;
