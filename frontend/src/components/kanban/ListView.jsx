import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Calendar, CheckSquare } from 'lucide-react';
import { AvatarGroup } from '../shared/Avatar';
import Badge from '../shared/Badge';
import { useProject } from '../../context/ProjectContext';

const getPriorityColor = (p) => {
  if (p === 'urgent') return '#ef4444';
  if (p === 'high') return '#f97316';
  if (p === 'medium') return '#f59e0b';
  if (p === 'low') return '#10b981';
  return '#94a3b8';
};

const getDueDateStyle = (dueDate) => {
  if (!dueDate) return null;
  const isOverdue = new Date(dueDate) < new Date(new Date().setHours(0,0,0,0));
  const isToday = new Date(dueDate).toDateString() === new Date().toDateString();
  if (isOverdue) return { color: '#ef4444' };
  if (isToday) return { color: '#f59e0b' };
  return { color: '#475569' };
};

const ListRow = ({ task, onClick }) => {
  const dateStyle = getDueDateStyle(task.dueDate);
  const checklistTotal = task.checklists?.length || 0;
  const checklistDone = task.checklists?.filter(c => c.done).length || 0;

  return (
    <div
      onClick={() => onClick(task)}
      style={{
        height: '48px',
        padding: '0 12px',
        display: 'grid',
        gridTemplateColumns: '24px 1fr 120px 100px 80px 80px',
        alignItems: 'center',
        gap: '12px',
        borderRadius: 'var(--radius-md)',
        borderBottom: '1px solid rgba(30,40,64,0.5)',
        cursor: 'pointer',
        transition: 'background 0.15s'
      }}
      className="hover:bg-bg-card-hover"
    >
      {/* Col 1: Priority */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(task.priority) }} />
      </div>

      {/* Col 2: Title */}
      <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {task.title}
      </div>

      {/* Col 3: Assignees */}
      <div style={{ display: 'flex' }}>
        <AvatarGroup users={task.assignees || []} max={3} size="sm" />
      </div>

      {/* Col 4: Due date */}
      <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', ...(dateStyle || { color: 'transparent' }) }}>
        {task.dueDate ? (
          <>
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </>
        ) : null}
      </div>

      {/* Col 5: Labels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {task.labels && task.labels.length > 0 && (
          <>
            <Badge variant="primary" size="sm" style={{ maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.labels[0]}</Badge>
            {task.labels.length > 1 && (
              <Badge variant="default" size="sm">+{task.labels.length - 1}</Badge>
            )}
          </>
        )}
      </div>

      {/* Col 6: Progress */}
      <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {checklistTotal > 0 && (
          <>
            <CheckSquare size={12} />
            {checklistDone}/{checklistTotal}
          </>
        )}
      </div>
    </div>
  );
};

const StatusGroup = ({ status, tasks, onClickTask, defaultExpanded }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const bodyRef = useRef(null);

  // We use max-height trick for smooth expand/collapse
  const contentHeight = expanded && bodyRef.current ? bodyRef.current.scrollHeight : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          height: '40px', display: 'flex', alignItems: 'center', gap: '10px',
          cursor: 'pointer', padding: '0 12px', borderRadius: 'var(--radius-md)',
          transition: 'background 0.15s'
        }}
        className="hover:bg-[rgba(255,255,255,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,0,0,0.03)]"
      >
        <ChevronRight 
          size={14} 
          color="#475569" 
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
        />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.color }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: status.color }}>
          {status.title}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '10px' }}>
          {tasks.length}
        </span>
      </div>

      <div 
        ref={bodyRef}
        style={{
          maxHeight: expanded ? '2000px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.25s ease'
        }}
      >
        <div style={{ paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tasks.map(task => (
            <ListRow key={task._id} task={task} onClick={onClickTask} />
          ))}
          {tasks.length === 0 && (
            <div style={{ padding: '8px 24px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No tasks in this group
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ListView = ({ tasks, onTaskClick }) => {
  const { currentProject } = useProject();
  
  const getProjectColumns = () => {
    if (currentProject?.taskStatuses && currentProject.taskStatuses.length > 0) {
      return [...currentProject.taskStatuses].sort((a, b) => a.order - b.order);
    }
    return [
      { id: 'todo', title: 'Todo', color: 'var(--status-todo)', order: 1000 },
      { id: 'in_progress', title: 'In Progress', color: 'var(--status-in-progress)', order: 2000 },
      { id: 'review', title: 'Review', color: 'var(--status-review)', order: 3000 },
      { id: 'testing', title: 'Testing', color: 'var(--status-testing)', order: 4000 },
      { id: 'done', title: 'Done', color: 'var(--status-done)', order: 5000 }
    ];
  };

  const statuses = getProjectColumns();

  // Group tasks by status
  const groupedTasks = statuses.map(status => ({
    status,
    tasks: tasks.filter(t => t.status === status.id).sort((a, b) => a.order - b.order)
  }));

  return (
    <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
      
      {/* Column Headers Row */}
      <div style={{
        height: '32px',
        padding: '0 12px 0 20px', // slight indent to match row
        display: 'grid',
        gridTemplateColumns: '24px 1fr 120px 100px 80px 80px',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-default)',
        marginBottom: '8px',
        fontSize: '11px',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 500
      }}>
        <div></div>
        <div>Task</div>
        <div>Assignees</div>
        <div>Due date</div>
        <div>Labels</div>
        <div>Progress</div>
      </div>

      {groupedTasks.map((group, index) => (
        <StatusGroup 
          key={group.status.id} 
          status={group.status} 
          tasks={group.tasks} 
          onClickTask={onTaskClick}
          defaultExpanded={index < 2} // expand first two by default
        />
      ))}
    </div>
  );
};

export default ListView;
