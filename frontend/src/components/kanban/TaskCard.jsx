import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import { Paperclip, MessageSquare, Calendar, CheckSquare, ChevronDown, GripVertical } from 'lucide-react';
import { AvatarGroup } from '../shared/Avatar';
import { useProject } from '../../context/ProjectContext';

const priorityColors = {
  urgent: 'var(--priority-urgent)',
  high: 'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low: 'var(--priority-low)'
};

const statusOptions = [
  { value: 'todo', label: 'Todo', color: '#64748b' },
  { value: 'in_progress', label: 'In Progress', color: '#06b6d4' },
  { value: 'review', label: 'Review', color: '#8b5cf6' },
  { value: 'testing', label: 'Testing', color: '#f59e0b' },
  { value: 'done', label: 'Done', color: '#10b981' }
];

const TaskCard = ({ task, index, onClick, onStatusChange, isDragging, isRecentlyDropped }) => {
  const { currentProject: project } = useProject();
  const pColor = priorityColors[task.priority];
  const [menuPos, setMenuPos] = useState(null);

  const dynamicStatusOptions = project?.taskStatuses && project.taskStatuses.length > 0 
    ? project.taskStatuses.map(s => ({ value: s.id, label: s.title, color: s.color || '#64748b' }))
    : statusOptions;

  const currentStatusOpt = dynamicStatusOptions.find(o => o.value === task.status);
  const statusColor = currentStatusOpt?.color || 'var(--text-secondary)';

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = dynamicStatusOptions.length * 32 + 8; // approx height
    const spaceBelow = window.innerHeight - rect.bottom;
    
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      // Flip upwards
      setMenuPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
    } else {
      // Default downwards
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
  };

  const getDueDateDisplay = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const isPast = date < today && task.status !== 'done';
    const isToday = date.getTime() === today.getTime() && task.status !== 'done';
    
    let color = 'var(--text-muted)';
    if (isPast) color = '#ef4444';
    else if (isToday) color = '#f59e0b';
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color }}>
        <Calendar size={11} />
        <span style={{ fontSize: '11px', fontWeight: 500 }}>Due:</span>
        <span style={{ fontSize: '11px' }}>
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    );
  };

  const getPriorityBadge = () => {
    if (task.priority !== 'urgent' && task.priority !== 'high') return null;
    const isUrgent = task.priority === 'urgent';
    return (
      <div style={{
        height: '18px', padding: '0 6px', borderRadius: '3px',
        fontSize: '11px', fontWeight: 500,
        background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)',
        color: isUrgent ? '#ef4444' : '#f97316',
        display: 'flex', alignItems: 'center'
      }}>
        <span style={{ opacity: 0.8, marginRight: '3px' }}>Priority:</span> {isUrgent ? 'Urgent' : 'High'}
      </div>
    );
  };

  return (
    <>
      <div
        onClick={onClick}
        style={{
          background: isDragging ? 'var(--bg-card-hover)' : 'var(--bg-card)',
          border: '1.5px solid',
          borderColor: isDragging ? 'rgba(6,182,212,0.6)' : 'var(--border-default)',
          borderRadius: '8px',
          padding: '12px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          position: 'relative',
          transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
          animation: isRecentlyDropped ? 'land-flash 600ms ease forwards' : 'none',
          overflow: 'hidden'
        }}
        className={`group hover:border-accent hover:bg-[var(--bg-card-hover)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] ${!isDragging ? 'active:scale-[0.98] active:transition-[transform_0.1s_ease]' : ''}`}
      >
            {/* Shimmer Line for Dragging */}
            {isDragging && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent, #06b6d4, #8b5cf6, transparent)',
                animation: 'shimmer-line 1.5s linear infinite',
                backgroundSize: '200% 100%'
              }} />
            )}

            {/* DRAG HANDLE */}
            <div 
              style={{
                position: 'absolute', top: '10px', right: '10px',
                width: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '4px',
                opacity: isDragging ? 1 : 0,
                transition: 'opacity 0.15s ease'
              }}
              className="group-hover:opacity-60"
            >
              <GripVertical size={14} color="#475569" />
            </div>

            {/* PRIORITY BAR */}
            {pColor && (
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: '3px', borderRadius: '8px 0 0 8px',
                background: pColor
              }} />
            )}

            <div style={{ paddingLeft: '8px', paddingRight: '16px' }}>
              
              {/* ROW 1: Labels */}
              {task.labels && task.labels.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {task.labels.slice(0, 3).map(label => {
                    const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const colors = ['#06b6d4','#8b5cf6','#10b981','#f59e0b','#ec4899'];
                    const c = colors[hash % colors.length];
                    return (
                      <span key={label} style={{
                        height: '18px', padding: '0 7px', borderRadius: '3px',
                        fontSize: '11px', fontWeight: 500,
                        background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c,
                        display: 'flex', alignItems: 'center'
                      }}>
                        <span style={{ opacity: 0.7, marginRight: '2px' }}>#</span>
                        {label}
                      </span>
                    )
                  })}
                  {task.labels.length > 3 && (
                    <span style={{
                      height: '18px', padding: '0 7px', borderRadius: '3px',
                      fontSize: '11px', fontWeight: 500,
                      background: 'var(--bg-input)', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center'
                    }}>
                      +{task.labels.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* ROW 2: Title */}
              <div style={{
                fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', marginBottom: '10px'
              }}>
                {task.title}
              </div>

              {/* ROW 3: Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div 
                    onClick={handleOpenMenu} 
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
                      color: statusColor,
                      border: `1px solid color-mix(in srgb, ${statusColor} 30%, transparent)`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      height: '20px'
                    }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <span style={{ fontWeight: 600 }}>
                      {currentStatusOpt?.label || task.status}
                    </span>
                    <ChevronDown size={12} style={{ marginLeft: '2px' }} />
                  </div>
                  {getPriorityBadge()}
                  {getDueDateDisplay()}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {task.checklists && task.checklists.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--text-muted)' }}>
                      <CheckSquare size={12} />
                      <span style={{ fontSize: '11px' }}>{task.checklists.filter(c => c.done).length}/{task.checklists.length}</span>
                    </div>
                  )}

                  {task.commentCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--text-muted)' }}>
                      <MessageSquare size={12} />
                      <span style={{ fontSize: '11px' }}>{task.commentCount}</span>
                    </div>
                  )}

                  {task.attachmentCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--text-muted)' }}>
                      <Paperclip size={12} />
                      <span style={{ fontSize: '11px' }}>{task.attachmentCount}</span>
                    </div>
                  )}

                  {task.assignees && task.assignees.length > 0 && (
                    <div style={{ marginLeft: '4px' }}>
                      <AvatarGroup users={task.assignees} max={2} size="sm" />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
    {menuPos && createPortal(
      <>
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 9998 }} 
          onClick={(e) => { e.stopPropagation(); setMenuPos(null); }} 
          onMouseDown={e => e.stopPropagation()}
        />
        <div 
          style={{
            position: 'fixed',
            top: menuPos.top,
            bottom: menuPos.bottom,
            left: menuPos.left,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            zIndex: 9999,
            padding: '4px',
            minWidth: '130px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          {dynamicStatusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                setMenuPos(null);
                if (onStatusChange) onStatusChange(task._id, task.status, opt.value);
              }}
              onMouseDown={e => e.stopPropagation()}
              style={{
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                color: task.status === opt.value ? opt.color : 'var(--text-primary)',
                background: task.status === opt.value ? `color-mix(in srgb, ${opt.color} 15%, transparent)` : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              className="hover:bg-hover transition-colors"
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.color }} />
              {opt.label}
            </button>
          ))}
        </div>
      </>,
      document.body
    )}
    </>
  );
};

export default React.memo(TaskCard);
