import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Check, Circle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Backdrop */}
      <div 
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div style={{
        position: 'relative',
        width: '480px',
        maxWidth: '90vw',
        height: '600px',
        maxHeight: '80vh',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        zIndex: 51,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <span style={{
                padding: '2px 8px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', fontSize: '11px', fontWeight: 600
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                className="hover:text-accent transition-colors"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
            <button 
              onClick={onClose}
              style={{ color: 'var(--text-muted)' }}
              className="hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '13px' }}>You have no notifications.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif._id}
                onClick={() => {
                  if (!notif.isRead) markRead(notif._id);
                  if (notif.link) {
                    navigate(notif.link);
                    onClose();
                  }
                }}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  background: notif.isRead ? 'transparent' : 'rgba(6,182,212,0.05)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
                className="hover:bg-hover transition-colors group"
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {!notif.isRead && <Circle size={8} fill="var(--accent)" color="var(--accent)" />}
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {notif.title}
                    </h4>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px', opacity: 0.7 }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(NotificationDropdown);
