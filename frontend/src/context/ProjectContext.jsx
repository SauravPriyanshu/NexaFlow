import React, { createContext, useContext, useState, useCallback } from 'react';
import projectService from '../services/projectService';
import { useToast } from './ToastContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchProjects = useCallback(async (orgId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectService.getProjectsByOrg(orgId);
      setProjects(response.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch projects';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const selectProject = useCallback((project) => {
    setCurrentProject(project);
  }, []);

  const createProject = useCallback(async (data) => {
    try {
      const response = await projectService.createProject(data);
      setProjects(prev => [response.data, ...prev]);
      toast.success('Project created successfully');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create project';
      toast.error(message);
      throw err;
    }
  }, [toast]);

  const updateProject = useCallback(async (id, data) => {
    try {
      const response = await projectService.updateProject(id, data);
      setProjects(prev => prev.map(p => p._id === id ? response.data : p));
      if (currentProject?._id === id) {
        setCurrentProject(response.data);
      }
      toast.success('Project updated');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update project';
      toast.error(message);
      throw err;
    }
  }, [currentProject, toast]);

  const deleteProject = useCallback(async (id) => {
    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      if (currentProject?._id === id) {
        setCurrentProject(null);
      }
      toast.success('Project deleted');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete project';
      toast.error(message);
      throw err;
    }
  }, [currentProject, toast]);

  const toggleFavorite = useCallback(async (id) => {
    try {
      const response = await projectService.toggleFavorite(id);
      setProjects(prev => prev.map(p => {
        if (p._id === id) {
          const isFavorited = response.data.favorited;
          // Optimistically update the isFavorited array (this is just for UI, the backend handles the actual array)
          // We don't have the user ID here easily, so we just toggle the presence of any item for now 
          // or ideally re-fetch the project or return the updated project from backend. 
          // Assuming backend toggleFavorite returns { favorited: true/false }.
          return { ...p, isFavorited: isFavorited ? ['dummy'] : [] }; 
        }
        return p;
      }));
    } catch (err) {
      toast.error('Failed to toggle favorite');
    }
  }, [toast]);

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      loading,
      error,
      fetchProjects,
      selectProject,
      createProject,
      updateProject,
      deleteProject,
      toggleFavorite
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
