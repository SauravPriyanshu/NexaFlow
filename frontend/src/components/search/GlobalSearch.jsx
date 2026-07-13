import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Clock, Folder, Users, File as FileIcon, 
  CheckSquare, ArrowUpLeft, LayoutDashboard, Bell, ChevronRight, SearchX 
} from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { highlightMatch } from '../../utils/highlightMatch';
import Avatar from '../shared/Avatar';

const GlobalSearch = () => {
  const { 
    isOpen, closeSearch, query, setQuery, results, loading,
    activeFilter, setFilter, highlightedIndex, navigateResults,
    recentSearches, saveRecentSearch, flatResults
  } = useSearch();
  
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateResults(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateResults(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < flatResults.length) {
          handleResultClick(flatResults[highlightedIndex].type, flatResults[highlightedIndex].item);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, flatResults, navigateResults, closeSearch]);

  const handleResultClick = (type, item) => {
    saveRecentSearch(query);
    closeSearch();
    if (type === 'task') {
      navigate(`/projects/${item.projectId?._id || item.projectId}/kanban`);
    } else if (type === 'project') {
      navigate(`/projects/${item._id}/kanban`);
    } else if (type === 'user') {
      // User profile stub
    } else if (type === 'file') {
      navigate(`/projects/${item.projectId?._id || item.projectId}/files`);
    }
  };

  const handleQuickAccess = (path) => {
    closeSearch();
    navigate(path);
  };

  const getPriorityColor = (p) => {
    if (p === 'urgent') return '#ef4444';
    if (p === 'high') return '#f97316';
    if (p === 'medium') return '#f59e0b';
    if (p === 'low') return '#10b981';
    return '#94a3b8';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIconColor = (name = '') => {
    const ext = name.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    if (['doc', 'docx'].includes(ext)) return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
    if (['xls', 'xlsx', 'csv'].includes(ext)) return { color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  };

  if (!isOpen) return null;

  // Track rendering index for highlighting mapping
  let currentIndex = 0;

  return (
    <>
      {/* OVERLAY */}
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
        onClick={closeSearch}
      />
      
      {/* SEARCH CONTAINER */}
      <div style={{
        position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', maxWidth: '100vw', zIndex: 61,
        animation: 'search-in 200ms ease-out forwards',
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', 
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '85vh', overflow: 'hidden'
      }}>
        
        {/* SEARCH INPUT ROW */}
        <div style={{ height: '56px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ position: 'relative', flexShrink: 0, width: '20px', height: '20px' }}>
            {loading ? (
              <svg style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <Search size={20} color="#475569" style={{ transition: 'opacity 150ms' }} />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, people, files..."
            style={{
              flex: 1, height: '100%', background: 'transparent', border: 'none', outline: 'none',
              fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'inherit'
            }}
          />
          <div style={{ height: '22px', padding: '0 6px', background: 'var(--bg-sidebar)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            ESC
          </div>
        </div>

        {/* FILTER ROW */}
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-default)', overflowX: 'auto' }} className="no-scrollbar">
          {[
            { id: 'all', label: 'All', icon: <div style={{width:'12px', height:'12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2px'}}><div style={{background:'currentColor', borderRadius:'1px'}}/><div style={{background:'currentColor', borderRadius:'1px'}}/><div style={{background:'currentColor', borderRadius:'1px'}}/><div style={{background:'currentColor', borderRadius:'1px'}}/></div> },
            { id: 'task', label: 'Tasks', icon: <CheckSquare size={12}/> },
            { id: 'project', label: 'Projects', icon: <Folder size={12}/> },
            { id: 'user', label: 'People', icon: <Users size={12}/> },
            { id: 'file', label: 'Files', icon: <FileIcon size={12}/> }
          ].map(f => {
            const isActive = activeFilter === f.id;
            const hasResults = results[f.id + 's']?.length > 0;
            const labelText = hasResults && f.id !== 'all' ? `${f.label} · ${results[f.id + 's'].length}` : f.label;
            
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  height: '26px', padding: '0 10px', borderRadius: '13px', fontSize: '12px', cursor: 'pointer',
                  border: `1px solid ${isActive ? 'var(--accent-border)' : 'transparent'}`, whiteSpace: 'nowrap', transition: 'all 0.15s ease',
                  background: isActive ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? 'var(--accent)' : '#475569',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
                className={!isActive ? "hover:text-text-secondary hover:bg-white/5" : ""}
              >
                {f.icon} {labelText}
              </button>
            );
          })}
        </div>

        {/* RESULTS BODY */}
        <div style={{ maxHeight: '440px', overflowY: 'auto', padding: '8px' }}>
          
          {query.length < 2 && (
            <div style={{ padding: '8px 0' }}>
              {recentSearches.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ padding: '6px 8px', fontSize: '11px', color: '#475569', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Recent searches
                  </div>
                  {recentSearches.map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => setQuery(s)}
                      style={{ height: '36px', padding: '0 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'background 0.15s' }}
                      className="hover:bg-white/5 group"
                    >
                      <Clock size={14} color="#475569" />
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', flex: 1 }}>{s}</span>
                      <ArrowUpLeft size={14} color="#475569" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div style={{ padding: '6px 8px', fontSize: '11px', color: '#475569', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Quick access
                </div>
                {[
                  { label: 'Dashboard', icon: LayoutDashboard, tint: '#06b6d4', path: '/dashboard' },
                  { label: 'My Tasks', icon: CheckSquare, tint: '#8b5cf6', path: '/tasks' },
                  { label: 'Notifications', icon: Bell, tint: '#f59e0b', path: '/dashboard' },
                  { label: 'Files', icon: Folder, tint: '#10b981', path: '/dashboard' } // fallback
                ].map((qa, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleQuickAccess(qa.path)}
                    style={{ height: '40px', padding: '0 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.15s' }}
                    className="hover:bg-white/5 group"
                  >
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${qa.tint}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <qa.icon size={14} color={qa.tint} />
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', flex: 1 }}>{qa.label}</span>
                    <ChevronRight size={14} color="#475569" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && query.length >= 2 && (
            <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: '52px', padding: '0 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border-default)', animation: 'ai-pulse 1.5s infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '10px', width: '60%', background: 'var(--border-default)', borderRadius: '4px', marginBottom: '8px', animation: 'ai-pulse 1.5s infinite' }} />
                    <div style={{ height: '10px', width: '40%', background: 'var(--border-default)', borderRadius: '4px', animation: 'ai-pulse 1.5s infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && (
            <div>
              {['tasks', 'projects', 'users', 'files'].map(type => {
                if (!results[type] || results[type].length === 0) return null;
                const items = results[type].slice(0, 4);
                
                return (
                  <div key={type} style={{ marginBottom: '8px' }}>
                    <div style={{ padding: '8px 10px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{type}</div>
                      {results[type].length > 4 && <div style={{ fontSize: '12px', color: 'var(--accent)', cursor: 'pointer' }}>See all {results[type].length} results</div>}
                    </div>

                    {items.map(item => {
                      const isHighlighted = highlightedIndex === currentIndex;
                      const itemIndex = currentIndex;
                      currentIndex++; // increment for next item
                      
                      const Wrapper = ({ children }) => (
                        <div 
                          onClick={() => handleResultClick(type.slice(0,-1), item)}
                          style={{
                            height: '52px', padding: '0 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px',
                            cursor: 'pointer', transition: 'background 0.15s', userSelect: 'none',
                            background: isHighlighted ? 'var(--accent-dim)' : 'transparent'
                          }}
                          className={!isHighlighted ? "hover:bg-white/5" : ""}
                        >
                          {children}
                        </div>
                      );

                      if (type === 'tasks') {
                        const pColor = getPriorityColor(item.priority);
                        const isOverdue = new Date(item.dueDate) < new Date();
                        return (
                          <Wrapper key={item._id}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: `${pColor}1f`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckSquare size={16} color={pColor} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {highlightMatch(item.title, query)}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.project?.color || 'var(--accent)' }} />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.project?.name || 'Project'}</span>
                                <span style={{ fontSize: '12px', color: '#475569' }}>·</span>
                                <div style={{ height: '16px', padding: '0 6px', borderRadius: '8px', fontSize: '10px', background: 'var(--bg-sidebar)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                  {item.status?.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                            {item.dueDate && (
                              <div style={{ fontSize: '12px', color: isOverdue ? '#ef4444' : '#475569', flexShrink: 0 }}>
                                {new Date(item.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </Wrapper>
                        );
                      }
                      
                      if (type === 'projects') {
                        return (
                          <Wrapper key={item._id}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${item.color || 'var(--accent)'}26`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Folder size={16} color={item.color || 'var(--accent)'} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {highlightMatch(item.name, query)}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {item.members?.length || 0} members · {item.taskCount || 0} tasks
                              </div>
                            </div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color || 'var(--accent)', flexShrink: 0 }} />
                          </Wrapper>
                        );
                      }

                      if (type === 'users') {
                        return (
                          <Wrapper key={item._id}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <Avatar user={item} size="md" />
                              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', border: '1px solid var(--bg-card)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {highlightMatch(item.name, query)}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.email}</div>
                            </div>
                            {item.skills?.length > 0 && (
                              <div style={{ height: '18px', padding: '0 7px', borderRadius: '4px', background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', fontSize: '11px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                {item.skills[0]}
                              </div>
                            )}
                          </Wrapper>
                        );
                      }

                      if (type === 'files') {
                        const fStyle = getFileIconColor(item.name);
                        return (
                          <Wrapper key={item._id}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: fStyle.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileIcon size={18} color={fStyle.color} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {highlightMatch(item.name, query)}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {item.project?.name || 'Project'} · {formatSize(item.size)}
                              </div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#475569', flexShrink: 0 }}>
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
                            </div>
                          </Wrapper>
                        );
                      }

                      return null;
                    })}
                  </div>
                );
              })}

              {Object.values(results).every(arr => !arr || arr.length === 0) && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <SearchX size={32} color="var(--border-default)" />
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    No results for <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>"{query}"</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>Try searching with different keywords</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SEARCH FOOTER */}
        <div style={{ height: '40px', padding: '0 16px', borderTop: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ background: 'var(--bg-sidebar)', borderRadius: '4px', padding: '1px 5px', fontSize: '10px' }}>↑↓</div>
              <span>Navigate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ background: 'var(--bg-sidebar)', borderRadius: '4px', padding: '1px 5px', fontSize: '10px' }}>↵</div>
              <span>Open</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ background: 'var(--bg-sidebar)', borderRadius: '4px', padding: '1px 5px', fontSize: '10px' }}>ESC</div>
              <span>Close</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Powered by NexaFlow
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </>
  );
};

export default GlobalSearch;
