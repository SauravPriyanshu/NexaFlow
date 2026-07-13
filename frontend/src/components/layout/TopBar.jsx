import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User, Settings, LogOut, Sparkles, Wand2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAI } from '../../context/AIContext';
import { useSearch } from '../../context/SearchContext';
import Avatar from '../shared/Avatar';
import NotificationDropdown from './NotificationDropdown';

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { currentProject } = useProject();
  const { unreadCount } = useNotifications();
  const { openAI } = useAI();
  const { setIsOpen: openSearch } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAITooltip, setShowAITooltip] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        openAI();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch, openAI]);

  // Generate mock breadcrumbs based on URL (stub logic for now)
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0 || paths[0] === 'dashboard') {
      return [{ label: 'Dashboard' }];
    }
    
    const crumbs = [];
    if (currentProject) {
      crumbs.push({ label: 'Org', path: `/orgs/${currentProject.orgId}/projects` });
      crumbs.push({ label: currentProject.name, path: `/projects/${currentProject._id}/kanban` });
      if (paths.includes('files')) crumbs.push({ label: 'Files' });
      else if (paths.includes('chat')) crumbs.push({ label: 'Chat' });
      else crumbs.push({ label: 'Board' });
    } else {
      crumbs.push({ label: 'NexaFlow' });
      crumbs.push({ label: paths[0].charAt(0).toUpperCase() + paths[0].slice(1) });
    }
    
    return crumbs.slice(0, 3);
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border-default)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexShrink: 0
    }}>
      
      {/* Mobile Hamburger */}
      <button 
        className="md:hidden"
        style={{ color: 'var(--text-muted)' }}
        onClick={onMenuClick}
        aria-label="Open Menu"
      >
        <Menu size={20} />
      </button>

      {/* LEFT: Breadcrumbs */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>›</span>}
            {idx === breadcrumbs.length - 1 ? (
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path || '#'} style={{ fontSize: '14px', color: 'var(--text-secondary)' }} className="hover:text-text-main transition-colors">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* RIGHT: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        {/* Search */}
        <button onClick={() => openSearch(true)} style={{
          width: '200px',
          height: '32px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }} className="hidden sm:flex hover:border-accent transition-colors">
          <Search size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', flex: 1, textAlign: 'left' }}>Search...</span>
          <div style={{
            background: 'var(--border-default)',
            color: 'var(--text-muted)',
            fontSize: '10px',
            padding: '1px 5px',
            borderRadius: '4px'
          }}>⌘K</div>
        </button>

        {showNotifications && (
          <NotificationDropdown onClose={() => setShowNotifications(false)} />
        )}

        <div style={{ borderLeft: '1px solid var(--border-default)', height: '20px', margin: '0 4px' }} className="hidden sm:block" />

        {/* AI Button */}
        <div style={{ position: 'relative' }} onMouseEnter={() => setShowAITooltip(true)} onMouseLeave={() => setShowAITooltip(false)}>
          <button 
            onClick={() => openAI()}
            aria-label="Open AI Assistant"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--ai-surface)',
              border: '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(6,182,212,0.1)';
              e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(6,182,212,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--ai-surface)';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span className="ai-gradient-text" style={{ display: 'flex', alignItems: 'center' }}>
              <Wand2 size={16} />
            </span>
          </button>
          
          {showAITooltip && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#161b27',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}>
              AI Assistant ⌘J
            </div>
          )}
        </div>

        {/* Notifications */}
        <button 
          onClick={() => setShowNotifications(true)}
          aria-label="View Notifications"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
          className="hover:bg-hover group transition-colors"
        >
          <Bell size={18} color="var(--text-muted)" className="group-hover:text-text-main transition-colors" />
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#ef4444',
              color: 'white',
              fontSize: '9px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--bg-sidebar)'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Open Profile Menu"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1.5px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--accent)',
              fontSize: '12px',
              fontWeight: 600
            }}
            className="hover:border-accent transition-colors"
          >
            {user?.avatar ? (
              <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </button>

          {isProfileOpen && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                onClick={() => setIsProfileOpen(false)} 
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '200px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '6px',
                zIndex: 100,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                <div style={{ padding: '10px', borderBottom: '1px solid var(--border-default)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }} className="truncate">{user?.name || 'User'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="truncate">{user?.email || 'email@example.com'}</div>
                </div>

                <button 
                  onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                  style={{
                  width: '100%', height: '32px', padding: '0 10px', borderRadius: '6px',
                  fontSize: '14px', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }} className="hover:bg-hover hover:text-text-main transition-colors">
                  <User size={16} /> Profile
                </button>
                <button 
                  onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                  style={{
                  width: '100%', height: '32px', padding: '0 10px', borderRadius: '6px',
                  fontSize: '14px', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }} className="hover:bg-hover hover:text-text-main transition-colors">
                  <Settings size={16} /> Settings
                </button>
                
                <div style={{ borderBottom: '1px solid var(--border-default)', margin: '4px 0' }} />
                
                <button 
                  onClick={handleLogout}
                  style={{
                    width: '100%', height: '32px', padding: '0 10px', borderRadius: '6px',
                    fontSize: '14px', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }} 
                  className="hover:bg-hover hover:text-error transition-colors group"
                >
                  <LogOut size={16} className="group-hover:text-error transition-colors" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default TopBar;
