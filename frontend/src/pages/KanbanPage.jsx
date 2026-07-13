import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { Filter, Layers, Plus, ArrowLeft, X, Sparkles } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useProject } from '../context/ProjectContext';
import { useAI } from '../context/AIContext';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import KanbanColumn from '../components/kanban/KanbanColumn';
import AddTaskModal from '../components/task/AddTaskModal';
import TaskDetailPanel from '../components/task/TaskDetailPanel';
import FilterPanel from '../components/kanban/FilterPanel';
import ColumnModal from '../components/kanban/ColumnModal';
import ListView from '../components/kanban/ListView';
import { AvatarGroup } from '../components/shared/Avatar';
import Tabs from '../components/shared/Tabs';
import ActivityFeed from '../components/activity/ActivityFeed';
import StatusChangeBadge from '../components/kanban/StatusChangeBadge';
import { useDragScroll } from '../hooks/useDragScroll';
import { usePageTitle } from '../hooks/usePageTitle';

const KanbanPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { columns, setColumns, fetchTasks, moveTask } = useTask();
  const { selectProject } = useProject();
  const { openAI, dispatchContextualSuggestion } = useAI();
  
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  usePageTitle(project ? `Kanban - ${project.name}` : 'Kanban');
  
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addTaskStatus, setAddTaskStatus] = useState('todo');
  
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('board');
  const [showFilter, setShowFilter] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const filterBtnRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const columnsSnapshotRef = useRef(null);

  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [draggingOverColumn, setDraggingOverColumn] = useState(null);
  const [dragInfo, setDragInfo] = useState(null);
  const [recentlyDropped, setRecentlyDropped] = useState(null);

  const { onDragStart: scrollStart, onDragEnd: scrollEnd } = useDragScroll(scrollContainerRef);

  const getProjectColumns = () => {
    if (project?.taskStatuses && project.taskStatuses.length > 0) {
      return [...project.taskStatuses].sort((a, b) => a.order - b.order);
    }
    return [
      { id: 'todo', title: 'Todo', color: 'var(--status-todo)', order: 1000 },
      { id: 'in_progress', title: 'In Progress', color: 'var(--status-in-progress)', order: 2000 },
      { id: 'review', title: 'Review', color: 'var(--status-review)', order: 3000 },
      { id: 'testing', title: 'Testing', color: 'var(--status-testing)', order: 4000 },
      { id: 'done', title: 'Done', color: 'var(--status-done)', order: 5000 }
    ];
  };

  const currentColumns = getProjectColumns();



  useEffect(() => {
    const loadData = async () => {
      setLoadingProject(true);
      try {
        const projData = await projectService.getProjectById(projectId);
        setProject(projData.data);
        selectProject(projData.data);
        await fetchTasks(projectId, currentFilters);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProject(false);
      }
    };
    if (projectId) loadData();
  }, [projectId, fetchTasks, selectProject, currentFilters]);

  useEffect(() => {
    dispatchContextualSuggestion({
      text: 'Need help converting meeting notes into tasks for this project?',
      buttonText: 'Convert Notes',
      action: () => {
        openAI('convert');
      }
    });
    return () => dispatchContextualSuggestion(null);
  }, [dispatchContextualSuggestion, openAI]);

  const handleDragStart = (result) => {
    scrollStart();
    document.body.classList.add('is-dragging');
    setDraggingTaskId(result.draggableId);
    columnsSnapshotRef.current = JSON.parse(JSON.stringify(columns));
  };

  const handleDragUpdate = (result) => {
    if (result.destination) {
      setDraggingOverColumn(result.destination.droppableId);
      setDragInfo({
        sourceStatus: result.source.droppableId,
        destStatus: result.destination.droppableId,
      });
    } else {
      setDraggingOverColumn(null);
      setDragInfo(null);
    }
  };

  const handleDragEnd = async (result) => {
    scrollEnd();
    document.body.classList.remove('is-dragging');
    setDraggingTaskId(null);
    setDraggingOverColumn(null);
    setDragInfo(null);

    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const destColumn = columns[destination.droppableId] || [];
    let newOrder;

    if (destColumn.length === 0) {
      newOrder = 1000;
    } else if (destination.index === 0) {
      newOrder = destColumn[0].order / 2;
    } else if (destination.index >= destColumn.length) {
      newOrder = destColumn[destColumn.length - 1].order + 1000;
    } else {
      // In hello-pangea/dnd, if moving within the same column downwards, 
      // the index is the index *after* the splice. 
      // But we are reading from the pre-spliced state (columns).
      // Let's use the simplest logic:
      const destCopy = [...destColumn];
      const sourceCopy = [...(columns[source.droppableId] || [])];
      
      let movedTask;
      if (source.droppableId === destination.droppableId) {
        movedTask = destCopy.splice(source.index, 1)[0];
      } else {
        movedTask = sourceCopy.splice(source.index, 1)[0];
      }
      destCopy.splice(destination.index, 0, movedTask);
      
      const prevOrder = destCopy[destination.index - 1]?.order || 0;
      const nextOrder = destCopy[destination.index + 1]?.order || prevOrder + 2000;
      newOrder = (prevOrder + nextOrder) / 2;
    }

    moveTask(draggableId, source.droppableId, destination.droppableId, newOrder);

    Promise.all([
      taskService.updateTaskStatus(draggableId, { status: destination.droppableId, order: newOrder }),
      taskService.reorderTasks(projectId, [{ _id: draggableId, status: destination.droppableId, order: newOrder }])
    ]).then(() => {
      setRecentlyDropped(draggableId);
      setTimeout(() => setRecentlyDropped(null), 600);
    }).catch(() => {
      if (columnsSnapshotRef.current) {
        setColumns(columnsSnapshotRef.current);
      }
    });
  };

  const onStatusChange = async (taskId, sourceStatus, destStatus) => {
    if (sourceStatus === destStatus) return;
    
    const destColumn = columns[destStatus] || [];
    let newOrder;
    if (destColumn.length === 0) {
      newOrder = 1000;
    } else {
      newOrder = destColumn[destColumn.length - 1].order + 1000;
    }

    const prevColumnsSnapshot = { ...columns };

    try {
      moveTask(taskId, sourceStatus, destStatus, newOrder);
      await taskService.updateTaskStatus(taskId, { status: destStatus, order: newOrder });
    } catch (err) {
      console.error(err);
      setColumns(prevColumnsSnapshot);
    }
  };

  const handleSaveColumn = async (columnData) => {
    const isEditing = !!editingColumn;
    let newStatuses = [...currentColumns];

    if (isEditing) {
      newStatuses = newStatuses.map(col => col.id === columnData.id ? { ...col, ...columnData } : col);
    } else {
      const maxOrder = newStatuses.length > 0 ? Math.max(...newStatuses.map(c => c.order)) : 0;
      newStatuses.push({ ...columnData, order: maxOrder + 1000 });
    }

    try {
      const res = await projectService.updateProjectStatuses(projectId, newStatuses);
      setProject(res.data);
      selectProject(res.data);
      setIsColumnModalOpen(false);
      setEditingColumn(null);
    } catch (err) {
      console.error('Failed to save column', err);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (['todo', 'in_progress', 'review', 'testing', 'done'].includes(columnId)) return;
    const newStatuses = currentColumns.filter(c => c.id !== columnId);
    try {
      const res = await projectService.updateProjectStatuses(projectId, newStatuses);
      setProject(res.data);
      selectProject(res.data);
      setIsColumnModalOpen(false);
      setEditingColumn(null);
    } catch (err) {
      console.error('Failed to delete column', err);
    }
  };

  if (loadingProject) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-height))', overflow: 'hidden' }}>
      
      {/* KANBAN TOP BAR */}
      <div style={{
        height: '56px', padding: '0 24px', background: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-default)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => project?.orgId && navigate(`/orgs/${typeof project.orgId === 'object' ? project.orgId._id : project.orgId}/projects`)}
            aria-label="Go back"
            style={{
              width: '32px', height: '32px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', background: 'transparent',
              border: '1px solid var(--border-default)'
            }}
            className="hover:bg-hover hover:text-text-primary transition-colors mr-2"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: project?.color || '#06b6d4' }} />
          <h1 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600 }}>{project?.name}</h1>
          <AvatarGroup users={project?.members?.map(m => m.userId) || []} max={4} size="sm" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{project?.members?.length || 0} members</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          
          <button 
            ref={filterBtnRef}
            onClick={() => setShowFilter(!showFilter)}
            style={{
              height: '32px', padding: '0 12px', background: 'transparent',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
            className="hover:border-border-hover transition-colors"
          >
            <Filter size={14} /> Filter
          </button>

          {showFilter && (
            <FilterPanel 
              initialFilters={currentFilters}
              onApply={(filters) => {
                setCurrentFilters(filters);
              }}
              onClose={() => setShowFilter(false)} 
            />
          )}

          <button 
            style={{
              height: '32px', padding: '0 12px', background: 'transparent',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'default'
            }}
          >
            <Layers size={14} /> Group by: Status
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-default)', margin: '0 8px' }} />

          <button 
            onClick={() => openAI('convert')}
            style={{
              height: '32px', padding: '0 12px', background: 'transparent',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              color: 'var(--accent)', fontSize: '13px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
            className="hover:border-accent hover:bg-accent-dim transition-colors"
          >
            <Sparkles size={14} /> AI
          </button>

          <button 
            onClick={() => setIsAddTaskOpen(true)}
            style={{
              height: '32px', padding: '0 12px', background: 'var(--accent)',
              color: '#fff', borderRadius: 'var(--radius-md)',
              fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px'
            }}
            className="hover:bg-accent-hover transition-colors"
          >
            <Plus size={14} /> Add task
          </button>
        </div>
      </div>

      {/* KANBAN TABS */}
      <div style={{ height: '44px', flexShrink: 0, padding: '0 24px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-page)' }}>
        <Tabs 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          tabs={[
            { id: 'board', label: 'Board' },
            { id: 'list', label: 'List' },
            { id: 'activity', label: 'Activity' }
          ]} 
        />
      </div>

      {/* KANBAN BOARD AREA */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {activeTab === 'board' && (
          <DragDropContext 
            onDragStart={handleDragStart} 
            onDragUpdate={handleDragUpdate}
            onDragEnd={handleDragEnd}
            sensors={undefined}
            enableDefaultSensors={true}
          >
            <div 
              ref={scrollContainerRef}
              style={{
                flex: 1, padding: '20px 24px 20px',
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                overflowX: 'auto', overflowY: 'visible',
                minHeight: 'calc(100vh - 160px)',
                position: 'relative'
              }} 
              className="kanban-scrollbar"
            >
              {currentColumns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  tasks={columns[col.id] || []}
                  onAddTask={(status) => { setAddTaskStatus(status); setIsAddTaskOpen(true); }}
                  onTaskClick={(task) => setSelectedTask(task)}
                  onStatusChange={onStatusChange}
                  onEditClick={(data) => {
                    setEditingColumn(data);
                    setIsColumnModalOpen(true);
                  }}
                  draggingOverColumn={draggingOverColumn}
                  draggingTaskId={draggingTaskId}
                  recentlyDropped={recentlyDropped}
                />
              ))}
              
              {/* Add Column Button */}
              <div style={{ flexShrink: 0, paddingRight: '20px' }}>
                <button
                  onClick={() => {
                    setEditingColumn(null);
                    setIsColumnModalOpen(true);
                  }}
                  style={{
                    width: '272px', height: '48px', borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-default)', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500,
                    marginTop: '28px'
                  }}
                  className="hover:border-accent hover:text-accent transition-colors"
                >
                  <Plus size={16} /> Add column
                </button>
              </div>
            </div>
            
            {draggingTaskId && dragInfo?.sourceStatus !== dragInfo?.destStatus && (
              <StatusChangeBadge 
                sourceStatus={dragInfo?.sourceStatus} 
                destStatus={dragInfo?.destStatus} 
              />
            )}
          </DragDropContext>
        )}
        
        {activeTab === 'activity' && (
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>Project Activity</h2>
              </div>
              <ActivityFeed projectId={projectId} />
            </div>
          </div>
        )}
        
        {activeTab === 'list' && (
          <ListView 
            tasks={Object.values(columns).flat()} 
            onTaskClick={(task) => setSelectedTask(task)} 
          />
        )}
      </div>

      <AddTaskModal 
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        initialStatus={addTaskStatus}
        projectId={projectId}
        orgId={project?.orgId}
      />

      {selectedTask && (
        <TaskDetailPanel
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onStatusChange={onStatusChange}
        />
      )}

      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => { setIsColumnModalOpen(false); setEditingColumn(null); }}
        onSave={handleSaveColumn}
        onDelete={handleDeleteColumn}
        columnData={editingColumn}
      />
    </div>
  );
};

export default KanbanPage;
