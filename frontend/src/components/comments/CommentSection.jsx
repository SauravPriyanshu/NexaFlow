import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import commentService from '../../services/commentService';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';

const CommentSection = ({ taskId, projectId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const toast = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await commentService.getCommentsByTask(taskId);
        setComments(res.data.data.comments || []);
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoading(false);
      }
    };
    if (taskId) fetchComments();
  }, [taskId]);

  useEffect(() => {
    if (!socket || !taskId) return;

    const handleNewComment = (newComment) => {
      if (newComment.taskId !== taskId) return;
      
      setComments(prev => {
        if (newComment.parentId) {
          return prev.map(c => {
            if (c._id === newComment.parentId) {
              if (c.replies?.some(r => r._id === newComment._id)) return c;
              return { ...c, replies: [...(c.replies || []), newComment] };
            }
            return c;
          });
        } 
        if (prev.some(c => c._id === newComment._id)) return prev;
        return [newComment, ...prev]; 
      });
    };

    const handleUpdatedComment = (updatedComment) => {
      if (updatedComment.taskId !== taskId) return;
      
      setComments(prev => {
        if (updatedComment.parentId) {
          return prev.map(c => {
            if (c._id === updatedComment.parentId) {
              return {
                ...c,
                replies: c.replies?.map(r => r._id === updatedComment._id ? updatedComment : r)
              };
            }
            return c;
          });
        }
        return prev.map(c => c._id === updatedComment._id ? updatedComment : c);
      });
    };

    socket.on('comment:new', handleNewComment);
    socket.on('comment:updated', handleUpdatedComment);

    return () => {
      socket.off('comment:new', handleNewComment);
      socket.off('comment:updated', handleUpdatedComment);
    };
  }, [socket, taskId]);

  const handleCreateComment = async (content, parentId = null) => {
    try {
      const res = await commentService.createComment({
        content,
        taskId,
        projectId,
        parentId
      });
      
      const newComment = res.data.data.comment;
      
      if (parentId) {
        setComments(prev => prev.map(c => {
          if (c._id === parentId) {
            return { ...c, replies: [...(c.replies || []), newComment] };
          }
          return c;
        }));
      } else {
        setComments(prev => [newComment, ...prev]);
      }
    } catch (err) {
      toast.error('Failed to post comment');
      throw err; 
    }
  };

  const handleUpdateComment = async (id, content) => {
    try {
      await commentService.updateComment(id, content);
    } catch (err) {
      toast.error('Failed to update comment');
      throw err;
    }
  };

  const handleDeleteComment = async (id) => {
    setComments(prev => {
      const isTopLevel = prev.some(c => c._id === id);
      if (isTopLevel) {
        return prev.map(c => {
          if (c._id === id) {
            if (c.replies && c.replies.length > 0) {
              return { ...c, isDeleted: true, content: '[deleted]' };
            }
            return null; 
          }
          return c;
        }).filter(Boolean);
      }
      return prev.map(c => {
        if (c.replies?.some(r => r._id === id)) {
          return {
            ...c,
            replies: c.replies.filter(r => r._id !== id)
          };
        }
        return c;
      });
    });

    try {
      await commentService.deleteComment(id);
    } catch (err) {
      toast.error('Failed to delete comment');
      const res = await commentService.getCommentsByTask(taskId);
      setComments(res.data.data.comments || []);
    }
  };

  const handleToggleLike = async (id) => {
    // Optimistic UI update
    const { user } = toast; // wait, toast doesn't have user. let's just let socket handle it, but wait!
    try {
      await commentService.toggleLike(id);
    } catch (err) {
      toast.error('Failed to like comment');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Comments
        {!loading && comments.length > 0 && (
          <span style={{ padding: '2px 8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            {comments.length}
          </span>
        )}
      </h3>

      <div style={{ marginBottom: '24px' }}>
        <CommentInput onSubmit={(content) => handleCreateComment(content)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1,2].map(i => (
            <div key={i} style={{ display: 'flex', gap: '12px' }} className="animate-pulse">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                <div style={{ height: '14px', width: '120px', background: 'var(--bg-card)', borderRadius: '4px' }} />
                <div style={{ height: '14px', width: '80%', background: 'var(--bg-card)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', background: 'var(--bg-card)', border: '1px dashed var(--border-default)', borderRadius: '8px' }}>
          No comments yet. Start the conversation!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {comments.map(comment => (
            <CommentItem 
              key={comment._id}
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
              onReply={(parentId, content) => handleCreateComment(content, parentId)}
              onLike={handleToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
