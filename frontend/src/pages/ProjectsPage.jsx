import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Plus, FolderOpen } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import ProjectCard from '../components/project/ProjectCard';
import CreateProjectModal from '../components/project/CreateProjectModal';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const { orgId } = useParams();
  const { projects, loading, fetchProjects } = useProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); 

  useEffect(() => {
    if (orgId) {
      fetchProjects(orgId);
    }
  }, [orgId, fetchProjects]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'Active') matchesFilter = p.status === 'active';
    else if (filter === 'Archived') matchesFilter = p.status === 'archived';
    else if (filter === 'Favorited') matchesFilter = p.isFavorited?.length > 0; // Check real logic later

    return matchesSearch && matchesFilter;
  });

  const activeCount = projects.filter(p => p.status === 'active').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', fontWeight: 600 }}>Projects</h1>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {projects.length} projects · {activeCount} active
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input 
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '220px', height: '36px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '0 12px 0 36px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
              className="focus:border-accent focus:ring-[3px] focus:ring-accent/10 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              height: '36px',
              padding: '0 16px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background var(--transition-fast)'
            }}
            className="hover:bg-accent-hover"
          >
            <Plus size={16} />
            New project
          </button>
        </div>
      </div>

      {/* FILTER ROW */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['All', 'Active', 'Archived', 'Favorited'].map(f => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                height: '28px',
                padding: '0 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border-default)'}`,
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)'
              }}
              className={!isActive ? "hover:border-border-hover hover:text-text-secondary" : ""}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* PROJECT GRID */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => (
             <div key={i} style={{ height: '180px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }} className="animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center' }}>
          <FolderOpen size={48} color="var(--text-hint)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>No projects found</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Get started by creating a new project or adjust your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredProjects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        orgId={orgId}
      />
    </div>
  );
};

export default ProjectsPage;
