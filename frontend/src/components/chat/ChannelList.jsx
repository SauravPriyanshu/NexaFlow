import React from 'react';
import { MoreHorizontal, Plus, ArrowLeft } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChannelList = ({ project, activeChannel, setActiveChannel, setChannelName }) => {
  const { onlineUsers } = useSocket();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleChannelSelect = (id, name) => {
    setActiveChannel(id);
    setChannelName(name);
  };

  const isGeneralActive = activeChannel === `project:${project._id}`;

  return (
    <div style={{
      width: '240px', flexShrink: 0,
      background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-default)',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* HEADER */}
      <div style={{
        height: '56px', padding: '0 16px', borderBottom: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <button 
          onClick={() => project?.orgId && navigate(`/orgs/${typeof project.orgId === 'object' ? project.orgId._id : project.orgId}/projects`)}
          style={{
            width: '28px', height: '28px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', background: 'transparent',
            border: '1px solid var(--border-default)'
          }}
          className="hover:bg-hover hover:text-text-primary transition-colors flex-shrink-0"
        >
          <ArrowLeft size={14} />
        </button>
        <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600, flex: 1 }} className="truncate">
          {project.name}
        </h2>
        <button style={{ color: 'var(--text-muted)' }} className="hover:text-text-primary transition-colors flex-shrink-0">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
        
        {/* CHANNELS SECTION */}
        <div style={{ fontSize: '10px', fontWeight: 600, color: '#475569', letterSpacing: '0.08em', padding: '12px 8px 6px' }}>
          CHANNELS
        </div>
        
        <div
          onClick={() => handleChannelSelect(`project:${project._id}`, '# general')}
          style={{
            height: '32px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
            marginBottom: '2px',
            background: isGeneralActive ? 'var(--accent-dim)' : 'transparent',
            borderLeft: isGeneralActive ? '2px solid var(--accent)' : '2px solid transparent',
            padding: isGeneralActive ? '0 10px 0 8px' : '0 10px 0 10px',
            color: isGeneralActive ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          className={!isGeneralActive ? 'hover:bg-hover hover:text-text-secondary' : ''}
        >
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>#</span>
          <span style={{ fontSize: '14px', flex: 1 }}>general</span>
        </div>

        {/* DIRECT MESSAGES SECTION */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '16px', padding: '12px 8px 6px'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#475569', letterSpacing: '0.08em' }}>DIRECT MESSAGES</span>
          <button style={{ fontSize: '14px', color: 'var(--text-muted)', padding: '0 4px' }} className="hover:text-accent transition-colors">
            <Plus size={14} />
          </button>
        </div>

        <div>
          {project.members?.map(member => {
            if (member.userId._id === currentUser._id) return null; 
            
            const isOnline = onlineUsers.has(member.userId._id);
            const ids = [currentUser._id, member.userId._id].sort();
            const dmChannelId = `dm:${ids[0]}_${ids[1]}`;
            const isActive = activeChannel === dmChannelId;

            // Mock unread count
            const unreadCount = 0;

            return (
              <div
                key={member.userId._id}
                onClick={() => handleChannelSelect(dmChannelId, member.userId.name)}
                style={{
                  height: '36px', padding: '0 10px', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', transition: 'all var(--transition-fast)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingLeft: isActive ? '8px' : '10px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                className={!isActive ? 'hover:bg-hover' : ''}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'var(--bg-card)', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600
                  }}>
                    {member.userId.avatar ? <img src={member.userId.avatar} style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : member.userId.name.charAt(0)}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: '-1px', right: '-1px',
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: isOnline ? '#10b981' : '#475569',
                    border: '1.5px solid var(--bg-sidebar)'
                  }} />
                </div>
                
                <span style={{ fontSize: '14px', flex: 1 }} className="truncate">
                  {member.userId.name}
                </span>

                {unreadCount > 0 && (
                  <div style={{
                    height: '18px', minWidth: '18px', padding: '0 5px',
                    background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700,
                    borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
