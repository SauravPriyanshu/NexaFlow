import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import activityService from '../../services/activityService';
import { useToast } from '../../context/ToastContext';
import { CheckSquare, MessageSquare, FileText, Settings, UserPlus, FolderKanban } from 'lucide-react';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatActionText = (activity) => {
  const map = {
    'task.created': 'created task',
    'task.updated': 'updated task',
    'task.deleted': 'deleted task',
    'task.status_changed': `moved task to ${String(activity.metadata?.newStatus || '').replace('_', ' ')}`,
    'task.assigned': 'assigned a task to',
    'task.commented': 'commented on task',
    'project.created': 'created project',
    'project.updated': 'updated project',
    'project.archived': 'archived project',
    'file.uploaded': 'uploaded file',
    'file.deleted': 'deleted file',
    'member.invited': 'invited a member to',
    'member.removed': 'removed a member from',
    'comment.created': 'commented on',
    'comment.deleted': 'deleted a comment on'
  };
  return map[activity.action] || activity.action;
};

const getActionIcon = (action) => {
  if (!action) return <Settings size={14} color="var(--text-muted)" />;
  if (action.startsWith('task')) return <CheckSquare size={14} color="#10b981" />;
  if (action.startsWith('comment')) return <MessageSquare size={14} color="#f59e0b" />;
  if (action.startsWith('file')) return <FileText size={14} color="#3b82f6" />;
  if (action.startsWith('member')) return <UserPlus size={14} color="#8b5cf6" />;
  if (action.startsWith('project')) return <FolderKanban size={14} color="#06b6d4" />;
  return <Settings size={14} color="var(--text-muted)" />;
};

const ActivityItem = ({ activity }) => {
  return (
    <div 
      className="group"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px',
        borderBottom: '1px solid rgba(30, 40, 64, 0.5)', transition: 'background var(--transition-fast)',
        borderRadius: '8px',
        animation: 'slideInFade 0.3s ease-out forwards'
      }}
    >
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700,
        color: 'var(--text-secondary)'
      }}>
        {activity.actorId?.avatar ? (
          <img src={activity.actorId.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          (activity.actorId?.name?.charAt(0) || '?').toUpperCase()
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ paddingRight: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', marginRight: '4px' }}>{activity.actorId?.name || 'Someone'}</span>
            {formatActionText(activity)}
            {activity.entityName && (
              <span style={{ color: 'var(--accent)', marginLeft: '4px', cursor: 'pointer', fontWeight: 500 }} className="hover:underline break-words">
                {activity.entityName}
              </span>
            )}
          </p>
          <div style={{ fontSize: '11px', color: 'var(--text-hint)', marginTop: '4px' }}>
            {formatTime(activity.createdAt)}
          </div>
        </div>
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {getActionIcon(activity.action)}
        </div>
      </div>
      <style>{`
        @keyframes slideInFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const ActivityFeed = ({ projectId, orgId, limit = 10 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { socket } = useSocket();
  const toast = useToast();

  const fetchActivities = async (pageNum = 1) => {
    try {
      let res;
      if (projectId) {
        res = await activityService.getProjectActivity(projectId, pageNum, limit);
      } else if (orgId) {
        res = await activityService.getOrgActivity(orgId, pageNum, limit);
      } else {
        return;
      }
      const newItems = res.data?.data?.activities || [];
      const pagination = res.data?.data?.pagination || { page: 1, totalPages: 1 };

      if (pageNum === 1) {
        setActivities(newItems);
      } else {
        setActivities(prev => [...(prev || []), ...newItems]);
      }

      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load activity', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId || orgId) {
      setLoading(true);
      fetchActivities(1);
    } else {
      setLoading(false);
    }
  }, [projectId, orgId]);

  useEffect(() => {
    if (!socket || (!projectId && !orgId)) return;

    const handleNewActivity = (activity) => {
      if (!activity) return;
      if ((projectId && activity.projectId === projectId) || 
          (orgId && !projectId && activity.orgId === orgId)) {
        setActivities(prev => {
          const current = prev || [];
          if (current.some(a => a._id === activity._id)) return current;
          return [activity, ...current];
        });
      }
    };

    socket.on('activity:new', handleNewActivity);

    return () => {
      socket.off('activity:new', handleNewActivity);
    };
  }, [socket, projectId, orgId]);

  // Group activities by date
  const groupedActivities = (activities || []).reduce((acc, activity) => {
    if (!activity) return acc;
    const date = new Date(activity.createdAt || Date.now());
    let dateStr = date.toLocaleDateString();
    
    // Make nice strings for today/yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday';
    }
    
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(activity);
    return acc;
  }, {});

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginRight: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          Live Activity
        </h3>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="custom-scrollbar hardware-scroll hover:bg-transparent">
        {loading && page === 1 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--text-sub)' }}>Loading activity...</div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--text-hint)' }}>No activity recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(groupedActivities).map(([date, acts]) => (
              <div key={date}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '4px' }}>
                  {date}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {acts.map(activity => (
                    <ActivityItem key={activity._id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
            
            {hasMore && (
              <button 
                onClick={() => fetchActivities(page + 1)}
                style={{
                  marginTop: '16px', padding: '8px', fontSize: '12px', fontWeight: 500, color: 'var(--accent)',
                  width: '100%', textAlign: 'center'
                }}
                className="hover:underline"
              >
                Load earlier activity
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
