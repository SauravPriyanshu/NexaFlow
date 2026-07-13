import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import taskService from '../services/taskService';
import { useToast } from './ToastContext';
import { useSocket } from './SocketContext';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [columns, setColumns] = useState({
    todo: [],
    in_progress: [],
    review: [],
    testing: [],
    done: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { socket } = useSocket();

  const fetchTasks = useCallback(async (projectId, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getTasksByProject(projectId, filters);
      setColumns(response.data || { todo: [], in_progress: [], review: [], testing: [], done: [] });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch tasks';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addTask = useCallback((task) => {
    setColumns(prev => {
      const status = task.status || 'todo';
      if (prev[status]?.find(t => t._id === task._id)) {
        return prev;
      }
      return {
        ...prev,
        [status]: [...prev[status], task]
      };
    });
  }, []);

  const moveTask = useCallback((taskId, fromStatus, toStatus, newOrder) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      const taskIndex = newColumns[fromStatus].findIndex(t => t._id === taskId);
      if (taskIndex === -1) return prev;

      // Clone the array so we don't mutate the old state
      newColumns[fromStatus] = [...newColumns[fromStatus]];
      const [task] = newColumns[fromStatus].splice(taskIndex, 1);
      
      const updatedTask = { ...task, status: toStatus, order: newOrder };

      // Insert into new column and sort
      newColumns[toStatus] = [...newColumns[toStatus], updatedTask].sort((a, b) => a.order - b.order);

      return newColumns;
    });
  }, []);

  const updateTask = useCallback((id, data) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      let found = false;

      for (const status in newColumns) {
        const taskIndex = newColumns[status].findIndex(t => t._id === id);
        if (taskIndex !== -1) {
          newColumns[status][taskIndex] = { ...newColumns[status][taskIndex], ...data };
          found = true;
          break;
        }
      }

      return found ? newColumns : prev;
    });
  }, []);

  const removeTask = useCallback((id) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      let found = false;

      for (const status in newColumns) {
        const taskIndex = newColumns[status].findIndex(t => t._id === id);
        if (taskIndex !== -1) {
          newColumns[status].splice(taskIndex, 1);
          found = true;
          break;
        }
      }

      return found ? newColumns : prev;
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (task) => {
      // Avoid duplicates if we created it ourselves and it's already in the list
      setColumns(prev => {
        const exists = Object.values(prev).some(col => col.some(t => t._id === task._id));
        if (exists) return prev;
        
        const status = task.status || 'todo';
        return {
          ...prev,
          [status]: [...prev[status], task]
        };
      });
    };

    const handleTaskUpdated = ({ taskId, changes }) => {
      updateTask(taskId, changes);
    };

    const handleTaskStatusChanged = ({ taskId, oldStatus, newStatus, order }) => {
      moveTask(taskId, oldStatus, newStatus, order);
    };

    const handleTaskDeleted = ({ taskId }) => {
      removeTask(taskId);
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:status_changed', handleTaskStatusChanged);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:status_changed', handleTaskStatusChanged);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket, moveTask, updateTask, removeTask]);

  return (
    <TaskContext.Provider value={{
      columns,
      loading,
      error,
      fetchTasks,
      addTask,
      moveTask,
      updateTask,
      removeTask,
      setColumns // Expose for direct optimistic updates during dnd
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
