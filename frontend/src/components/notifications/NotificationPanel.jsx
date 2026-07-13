import React, { useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';
import SlidePanel from '../shared/SlidePanel';
import Avatar from '../shared/Avatar';
import EmptyState from '../shared/EmptyState';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotifications();

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      // fetch more logic
    }
  };

  const headerExtra = unreadCount > 0 ? (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <button 
        onClick={markAllRead}
        style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}
        className="hover:underline"
      >
        Mark all read
      </button>
    </div>
  ) : null;

  return (
    <SlidePanel 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Notifications" 
      width="380px"
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : ''}
    >
      {/* We need to inject the mark all read button into header, but SlidePanel doesn't explicitly support a headerRight prop.
          Wait, I built SlidePanel without a headerRight prop. Let me hack it by putting it at the top of the body, or just above the list. 
          Actually, I can just put it at the top of the panel body for now since it's easiest. */}
      
      {unreadCount > 0 && (
        <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--border-default)' }}>
          <button onClick={markAllRead} style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }} className="hover:underline">
            Mark all read
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} onScroll={handleScroll}>
        {loading && notifications.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '14px' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ marginTop: '40px' }}>
            <EmptyState 
              icon={Bell} 
              title="All caught up" 
              description="No new notifications at the moment."
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notif) => (
              <div 
                key={notif._id}
                onClick={() => {
                  if (!notif.isRead) markRead(notif._id);
                  onClose();
                }}
                className="group"
                style={{
                  padding: notif.isRead ? '14px 20px' : '14px 20px 14px 17px',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                  background: notif.isRead ? 'transparent' : 'rgba(6,182,212,0.04)',
                  borderLeft: notif.isRead ? 'none' : '3px solid var(--accent)'
                }}
              >
                <Avatar user={notif.actorId} size="lg" />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px' }}>
                    {notif.title}
                  </div>
                  <div style={{
                    fontSize: '13px', color: 'var(--text-muted)',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {!notif.isRead && (
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '6px' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SlidePanel>
  );
};

export default NotificationPanel;
