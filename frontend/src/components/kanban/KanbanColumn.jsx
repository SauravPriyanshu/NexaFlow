import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Pencil } from 'lucide-react';
import TaskCard from './TaskCard';

function getDraggableStyle(style, snapshot) {
  if (!snapshot.isDragging) {
    return {
      ...style,
      transform: style?.transform || undefined,
    };
  }

  // When dragging: use the library's transform exactly as-is.
  // Do NOT override or recalculate. Just add visual enhancements.
  return {
    ...style,
    // Smooth the movement slightly but keep it snappy
    transition: snapshot.isDropAnimating
      ? 'transform 180ms cubic-bezier(0.2, 0, 0, 1), opacity 180ms ease, box-shadow 180ms ease'
      : undefined,
    // Visual lift effect
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(6,182,212,0.5)',
    opacity: 0.96,
    borderRadius: '8px',
    // Slight rotation for natural feel
    transform: style?.transform
      ? `${style.transform} rotate(1.2deg)`
      : undefined,
    // Ensure it floats above everything
    zIndex: 9999,
    cursor: 'grabbing',
  };
}

const KanbanColumn = ({ 
  id, 
  title, 
  tasks, 
  color, 
  onAddTask, 
  onTaskClick, 
  onStatusChange, 
  onEditClick,
  draggingOverColumn,
  draggingTaskId,
  recentlyDropped
}) => {
  const isAnyTaskDragging = draggingTaskId !== null;
  const isActiveColumn = draggingOverColumn === id;

  let columnStyle = {
    width: '272px', minWidth: '272px', flexShrink: 0,
    marginRight: '14px',
    display: 'flex', flexDirection: 'column',
    height: '100%',
    maxHeight: 'calc(100vh - 56px - 56px - 44px - 40px)',
    borderRadius: '12px',
    transition: 'opacity 0.2s ease',
  };

  if (isAnyTaskDragging && !isActiveColumn) {
    columnStyle.opacity = 0.6;
  } else if (isActiveColumn) {
    columnStyle.opacity = 1;
  }

  return (
    <div style={columnStyle}>
      {/* COLUMN HEADER */}
      <div className="group" style={{ flexShrink: 0, padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          width: isActiveColumn ? '10px' : '8px', 
          height: isActiveColumn ? '10px' : '8px', 
          borderRadius: '50%', 
          background: color,
          boxShadow: isActiveColumn ? `0 0 0 3px color-mix(in srgb, ${color} 20%, transparent)` : 'none',
          transition: 'all 0.2s ease'
        }} />
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: color, textTransform: 'capitalize' }}>
          {title}
        </h3>
        <div style={{
          height: '20px', minWidth: '20px', padding: '0 6px',
          borderRadius: 'var(--radius-full)',
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          color: color,
          fontSize: '12px', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {tasks.length}
        </div>
        {onEditClick && (
          <button 
            onClick={() => onEditClick({ id, title, color })}
            style={{
              marginLeft: 'auto', width: '22px', height: '22px', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-hover hover:text-text-primary transition-all"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* DROPPABLE AREA */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => {
          const isOver = snapshot.isDraggingOver;
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                flex: 1, overflowY: 'auto', overflowX: 'visible',
                padding: '6px 4px', borderRadius: '8px', minHeight: '80px',
                transition: 'opacity 0.2s ease, background 0.15s ease, border-color 0.15s ease',
                background: isOver ? 'rgba(6,182,212,0.12)' : 'transparent',
                border: isOver ? '1.5px dashed rgba(6,182,212,0.6)' : '1px solid transparent',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}
              className="hover-scrollbar"
            >
              {tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      style={getDraggableStyle(dragProvided.draggableProps.style, dragSnapshot)}
                    >
                      <TaskCard 
                        task={task} 
                        index={index} 
                        onClick={() => onTaskClick(task)}
                        onStatusChange={onStatusChange}
                        isDragging={dragSnapshot.isDragging}
                        isRecentlyDropped={recentlyDropped === task._id}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
};

export default React.memo(KanbanColumn);
