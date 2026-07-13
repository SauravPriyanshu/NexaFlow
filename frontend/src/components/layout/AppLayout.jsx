import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

import ErrorBoundary from '../shared/ErrorBoundary';
import GlobalSearch from '../search/GlobalSearch';
import AIPanel from '../ai/AIPanel';
import CacheIndicator from '../dev/CacheIndicator';

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K for Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Custom event or logic to open search modal
        window.dispatchEvent(new CustomEvent('open-search'));
      }
      // Esc to close mobile menu
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-page)' }}>
          <a href="#main-content"
            style={{ position:'absolute', top:'-40px', left:0,
              padding:'8px', background:'var(--accent)', color:'#0f1117',
              zIndex:999, ':focus': { top:0 } }}
            className="skip-link">
            Skip to main content
          </a>
          
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 40
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`md:static fixed top-0 bottom-0 z-50 transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`} style={{ width: isSidebarCollapsed ? '64px' : '240px', '--sidebar-width': isSidebarCollapsed ? '64px' : '240px' }}>
            <Sidebar 
              onClose={() => setIsMobileMenuOpen(false)} 
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          {/* Main Layout Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
            
            <main id="main-content" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>
          </div>

          {import.meta.env.DEV && <CacheIndicator />}

    </div>
  );
};

export default AppLayout;
