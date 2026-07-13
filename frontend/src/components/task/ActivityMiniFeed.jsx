import React, { useEffect, useState } from 'react';
import activityService from '../../services/activityService';
import { useSocket } from '../../context/SocketContext';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d);
};

const ActivityMiniFeed = ({ taskId, projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { socket } = useSocket();

  const fetchActivities = async (pageNum = 1) => {
    try {
      const limit = 5;
      const res = await activityService.getTaskActivity(taskId, pageNum, limit);
      const newItems = res.data.data.activities;
      const pagination = res.data.data.pagination;

      if (pageNum === 1) {
        setActivities(newItems);
      } else {
        setActivities(prev => [...prev, ...newItems]);
      }

      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load task activity', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId && projectId) {
      setLoading(true);
      fetchActivities(1);
    }
  }, [taskId, projectId]);

  useEffect(() => {
    if (!socket) return;
    const handleNewActivity = (activity) => {
      if (activity.entityId === taskId || activity.metadata?.taskId === taskId) {
        setActivities(prev => [activity, ...prev].slice(0, 10));
      }
    };
    socket.on('activity:new', handleNewActivity);
    return () => socket.off('activity:new', handleNewActivity);
  }, [socket, taskId]);

  if (loading) return <div className="text-xs text-text-sub py-2">Loading activity...</div>;
  if (activities.length === 0) return null;

  return (
    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-default)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recent Activity
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activities.map(activity => (
          <div key={activity._id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--border-default)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>
              {activity.actorId?.avatar ? (
                <img src={activity.actorId.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>{(activity.actorId?.name?.charAt(0) || '?').toUpperCase()}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4', margin: 0 }}>
                <span style={{ fontWeight: 600 }}>{activity.actorId?.name || 'Someone'}</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{activity.action.replace('_', ' ')}</span>
              </p>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {formatTime(activity.createdAt)}
              </div>
            </div>
          </div>
        ))}
        {hasMore && (
          <button 
            onClick={() => fetchActivities(page + 1)}
            style={{
              marginTop: '8px', padding: '6px', fontSize: '11px', fontWeight: 500, color: 'var(--accent)',
              width: '100%', textAlign: 'center', background: 'transparent', border: 'none', cursor: 'pointer'
            }}
            className="hover:underline"
          >
            Load earlier activity
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityMiniFeed;
