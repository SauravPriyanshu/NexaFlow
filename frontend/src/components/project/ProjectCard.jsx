import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Folder, MoreHorizontal } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Avatar, { AvatarGroup } from '../shared/Avatar';
import Badge from '../shared/Badge';
import ConfirmDialog from '../shared/ConfirmDialog';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { toggleFavorite, deleteProject, updateProject } = useProject();
  const { user } = useAuth();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef(null);

  const isFavorited = project.isFavorited?.includes(user?._id) || project.isFavorited?.length > 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(project._id);
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    await updateProject(project._id, { status: project.status === 'active' ? 'archived' : 'active' });
  };

  const handleDelete = async () => {
    await deleteProject(project._id);
  };

  const taskCount = project.stats?.totalTasks || 0;
  const completedCount = project.stats?.completedTasks || 0;
  const progressPct = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <>
      <div 
        onClick={() => navigate(`/projects/${project._id}/kanban`)}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 0,
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="hover:border-border-hover hover:-translate-y-[2px] shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
      >
        {/* TOP COLOR BAR */}
        <div style={{ height: '4px', background: project.color || '#06b6d4', flexShrink: 0 }} />
        
        {/* CARD BODY */}
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* ROW 1: Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: `${project.color || '#06b6d4'}26`, // ~15% opacity hex
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Folder size={14} color={project.color || '#06b6d4'} />
              </div>
              <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
                {project.name}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={handleFavorite}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isFavorited ? '#f59e0b' : 'var(--text-muted)'
                }}
                className="hover:text-[#f59e0b] hover:bg-hover transition-colors"
              >
                <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
              
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
                  style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                  className="hover:bg-hover transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showDropdown && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)', padding: '4px', width: '160px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 10
                    }}
                  >
                    <button onClick={handleArchive} className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-hover hover:text-text-primary rounded">
                      {project.status === 'active' ? 'Archive' : 'Restore'}
                    </button>
                    <button onClick={() => { setShowDropdown(false); setShowDeleteConfirm(true); }} className="w-full text-left px-3 py-1.5 text-sm text-error hover:bg-error/10 rounded">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ROW 2: Description */}
          <div style={{
            fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', minHeight: '39px', marginBottom: '16px'
          }}>
            {project.description || 'No description provided.'}
          </div>

          {/* ROW 3: Progress bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tasks</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{completedCount}/{taskCount} completed</span>
            </div>
            <div style={{ height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: project.color || '#06b6d4', borderRadius: '2px' }} />
            </div>
          </div>

          {/* ROW 4: Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <AvatarGroup users={project.members?.map(m => m.userId) || []} max={3} size="sm" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {project.status === 'active' ? (
                <Badge label="Active" variant="success" size="sm" />
              ) : (
                <Badge label="Archived" variant="default" size="sm" />
              )}

              {project.dueDate && (
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px',
                  color: new Date(project.dueDate) < new Date() ? 'var(--color-error)' : 'var(--text-muted)' 
                }}>
                  <Clock size={12} />
                  <span style={{ fontSize: '12px' }}>
                    {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
};

export default ProjectCard;
