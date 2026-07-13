import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, matchPath, Link, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Calendar, Plus, Settings, Hash, FolderOpen, LayoutDashboard, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import Logo from '../shared/Logo';
import CreateOrgModal from '../org/CreateOrgModal';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';
import projectService from '../../services/projectService';

const Sidebar = ({ onClose, isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { currentProject, projects, fetchProjects } = useProject();
  const { theme, toggleTheme } = useTheme();
  
  const [orgs, setOrgs] = useState([]);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const navigate = useNavigate();
  
  let activeOrgId = null;
  const orgMatch = matchPath({ path: "/orgs/:orgId/*" }, location.pathname);
  if (orgMatch) {
    activeOrgId = orgMatch.params.orgId;
  } else if (currentProject) {
    activeOrgId = currentProject.orgId;
  }

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await axiosInstance.get('/orgs');
        setOrgs(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch orgs for sidebar', error);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (activeOrgId) {
      fetchProjects(activeOrgId);
    }
  }, [activeOrgId, fetchProjects]);

  const COLORS = ['#06b6d4','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899'];
  const getOrgColor = (name) => {
    if (!name) return COLORS[0];
    return COLORS[name.charCodeAt(0) % COLORS.length];
  };

  const navItemStyle = ({ isActive }) => ({
    height: '36px',
    padding: isCollapsed ? '0' : (isActive ? '0 10px 0 18px' : '0 10px'),
    borderRadius: isActive ? '0 6px 6px 0' : '6px',
    marginLeft: isActive ? '-8px' : '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    gap: '10px',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
    marginBottom: '2px',
    background: isActive ? 'var(--accent-dim)' : 'transparent',
    borderLeft: isActive ? '2px solid var(--accent)' : 'none',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight: isActive ? 500 : 400,
  });

  const navIconStyle = (isActive) => ({
    color: isActive ? 'var(--accent)' : 'var(--text-muted)'
  });

  return (
    <>
    <div style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ height: 'var(--topbar-height)', padding: isCollapsed ? '0' : '0 16px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', borderBottom: '1px solid var(--border-default)' }}>
        {isCollapsed ? <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '20px' }}>N</div> : <Logo size="md" />}
      </div>

      <div style={{ padding: '8px' }}>
        {!isCollapsed && <div style={{ fontSize: '10px', fontWeight: 600, color: '#475569', letterSpacing: '0.08em', padding: '12px 8px 6px' }}>WORKSPACE</div>}
        <NavLink to="/dashboard" style={navItemStyle} className="group hover:bg-hover hover:text-text-primary" onClick={onClose}>
          {({ isActive }) => (
            <>
              <Home size={18} style={navIconStyle(isActive)} className="group-hover:text-text-primary" />
              <span style={{ fontSize: '14px', display: isCollapsed ? 'none' : 'block' }}>Home</span>
            </>
          )}
        </NavLink>
        <NavLink to="/tasks" style={navItemStyle} className="group hover:bg-hover hover:text-text-primary" onClick={onClose}>
          {({ isActive }) => (
            <>
              <CheckSquare size={18} style={navIconStyle(isActive)} className="group-hover:text-text-primary" />
              <span style={{ fontSize: '14px', display: isCollapsed ? 'none' : 'block' }}>My Tasks</span>
            </>
          )}
        </NavLink>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          {!isCollapsed && <div style={{ fontSize: '10px', fontWeight: 600, color: '#475569', letterSpacing: '0.08em', padding: '12px 8px 6px' }}>ORGANIZATIONS</div>}
          <button 
            style={{ color: '#475569', display: isCollapsed ? 'none' : 'block' }} 
            className="hover:text-accent mr-2"
            onClick={() => setIsCreateOrgModalOpen(true)}
            aria-label="Create Organization"
          >
            <Plus size={16} />
          </button>
        </div>

        <div>
          {orgs.map(org => {
            const isActiveOrg = org._id === activeOrgId;
            return (
              <div key={org._id}>
                <Link to={`/orgs/${org._id}/projects`} onClick={onClose}>
                  <div style={{
                    height: '32px', padding: isCollapsed ? '0' : '0 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '8px', cursor: 'pointer',
                    background: isActiveOrg ? 'var(--accent-dim)' : 'transparent',
                    color: isActiveOrg ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }} className="hover:bg-hover">
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: getOrgColor(org.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-page)', fontSize: '10px', fontWeight: 700 }}>
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    {!isCollapsed && <span style={{ fontSize: '13px' }}>{org.name}</span>}
                  </div>
                </Link>

                {isActiveOrg && (
                  <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                    {!isCollapsed && <div style={{ padding: '0 16px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>PROJECTS</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px' }}>
                      {projects.map(proj => {
                        const isProjActive = location.pathname.includes(`/projects/${proj._id}`);
                        return (
                          <div key={proj._id}>
                            <Link to={`/projects/${proj._id}/kanban`} onClick={onClose}
                                  style={{
                                    ...navItemStyle({ isActive: isProjActive }),
                                    paddingLeft: isCollapsed ? '0' : (isProjActive ? '26px' : '16px')
                                  }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: proj.color || '#06b6d4', flexShrink: 0 }} />
                              {!isCollapsed && (
                                <span style={{ fontSize: '14px', flex: 1 }} className="truncate">{proj.name}</span>
                              )}
                            </Link>
                            
                            {/* Project Sub-menu */}
                            {isProjActive && !isCollapsed && (
                              <div style={{ paddingLeft: '32px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <NavLink to={`/projects/${proj._id}/kanban`} style={({ isActive }) => ({
                                  fontSize: '13px', padding: '6px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px',
                                  background: isActive ? 'var(--bg-input)' : 'transparent', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                                })} className="hover:bg-hover transition-colors" onClick={onClose}>
                                  <LayoutDashboard size={14} /> Board
                                </NavLink>
                                <NavLink to={`/projects/${proj._id}/chat`} style={({ isActive }) => ({
                                  fontSize: '13px', padding: '6px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px',
                                  background: isActive ? 'var(--bg-input)' : 'transparent', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                                })} className="hover:bg-hover transition-colors" onClick={onClose}>
                                  <Hash size={14} /> Chat
                                </NavLink>
                                <NavLink to={`/projects/${proj._id}/files`} style={({ isActive }) => ({
                                  fontSize: '13px', padding: '6px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px',
                                  background: isActive ? 'var(--bg-input)' : 'transparent', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                                })} className="hover:bg-hover transition-colors" onClick={onClose}>
                                  <FolderOpen size={14} /> Files
                                </NavLink>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '8px', borderTop: '1px solid var(--border-default)', display: 'flex', flexDirection: isCollapsed ? 'column' : 'row', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', gap: '8px' }}>
        {!isCollapsed && <div style={{ flex: 1 }} />}
        <button onClick={toggleTheme} aria-label="Toggle Theme" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: 'var(--text-muted)' }} className="hover:bg-hover hover:text-text-primary" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={onToggleCollapse} aria-label="Toggle Sidebar Collapse" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: 'var(--text-muted)' }} className="hover:bg-hover hover:text-text-primary">
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div style={{ height: '64px', borderTop: '1px solid var(--border-default)', padding: isCollapsed ? '0' : '0 12px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.avatar ? <img src={user.avatar} style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        {!isCollapsed && <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }} className="truncate">{user?.name || 'User'}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="truncate">{user?.email || 'email@example.com'}</div>
        </div>}
        {!isCollapsed && <Link to="/profile" aria-label="Profile Settings" style={{ color: 'var(--text-muted)' }} className="hover:text-text-primary mr-1">
          <Settings size={16} />
        </Link>}
      </div>

    </div>
      <CreateOrgModal 
        isOpen={isCreateOrgModalOpen} 
        onClose={() => setIsCreateOrgModalOpen(false)} 
        onSuccess={(org) => {
          setOrgs(prev => [...prev, org]);
          navigate(`/orgs/${org._id}/projects`);
          onClose(); // close sidebar on mobile
        }} 
      />
    </>
  );
};

export default Sidebar;
