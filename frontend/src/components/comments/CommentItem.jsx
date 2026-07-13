import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import CommentInput from './CommentInput';
import { Reply, Heart, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../shared/ConfirmDialog';

const CommentItem = ({ comment, depth = 0, onUpdate, onDelete, onReply, onLike }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showMoreReplies, setShowMoreReplies] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [localHasLiked, setLocalHasLiked] = useState(comment.likes?.includes(user?._id));
  const [localLikeCount, setLocalLikeCount] = useState(comment.likes?.length || 0);

  React.useEffect(() => {
    setLocalHasLiked(comment.likes?.includes(user?._id));
    setLocalLikeCount(comment.likes?.length || 0);
  }, [comment.likes, user?._id]);
  
  const isAuthor = comment.authorId?._id === user?._id;
  const isDeleted = comment.isDeleted;

  const renderContent = (text) => {
    if (isDeleted) return <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>This comment was deleted</span>;
    
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} style={{ color: 'var(--accent)', cursor: 'pointer' }} className="hover:underline">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleEditSubmit = async (newContent) => {
    await onUpdate(comment._id, newContent);
    setIsEditing(false);
  };

  const handleReplySubmit = async (content) => {
    await onReply(comment._id, content);
    setIsReplying(false);
  };

  const visibleReplies = showMoreReplies ? comment.replies : comment.replies?.slice(0, 2);
  const hiddenRepliesCount = (comment.replies?.length || 0) - (visibleReplies?.length || 0);
  
  const handleLikeClick = async () => {
    const prevHasLiked = localHasLiked;
    const prevLikeCount = localLikeCount;
    setLocalHasLiked(!prevHasLiked);
    setLocalLikeCount(prev => prevHasLiked ? prev - 1 : prev + 1);
    try {
      await onLike(comment._id);
    } catch (err) {
      setLocalHasLiked(prevHasLiked);
      setLocalLikeCount(prevLikeCount);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      marginLeft: depth > 0 ? '32px' : '0',
      paddingLeft: depth > 0 ? '16px' : '0',
      borderLeft: depth > 0 ? '2px solid var(--border-default)' : 'none'
    }}>
      
      <div className="group" style={{ display: 'flex', gap: '12px' }}>
        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
          background: isDeleted ? 'transparent' : 'var(--accent-dim)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600,
          marginTop: '4px'
        }}>
          {!isDeleted && comment.authorId?.avatar ? (
            <img src={comment.authorId.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: isDeleted ? 'transparent' : 'var(--accent)' }}>
              {!isDeleted && comment.authorId?.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content Block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isDeleted ? '[Deleted]' : comment.authorId?.name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {comment.isEdited && !isDeleted && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div style={{ marginTop: '8px' }}>
              <CommentInput 
                autoFocus 
                initialValue={comment.content} 
                onSubmit={handleEditSubmit} 
                onCancel={() => setIsEditing(false)} 
              />
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {renderContent(comment.content)}
            </div>
          )}

          {/* Hover Actions */}
          {!isEditing && !isDeleted && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <button 
                onClick={() => setIsReplying(!isReplying)} 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}
                className="hover:text-text-main transition-colors"
              >
                <Reply size={14} /> Reply
              </button>
              
              <button 
                onClick={handleLikeClick}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: localHasLiked ? 'var(--accent)' : 'var(--text-muted)' }}
                className="hover:text-accent transition-colors"
              >
                <Heart size={14} fill={localHasLiked ? 'var(--accent)' : 'none'} /> {localLikeCount > 0 && localLikeCount} Like
              </button>
              {isAuthor && (
                <>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}
                    className="hover:text-text-main transition-colors"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)} 
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}
                    className="hover:text-error transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(comment._id);
        }}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Reply Input */}
      {isReplying && (
        <div style={{ marginTop: '12px', marginLeft: '44px' }}>
          <CommentInput 
            autoFocus 
            onSubmit={handleReplySubmit} 
            onCancel={() => setIsReplying(false)} 
            placeholder="Write a reply..."
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {visibleReplies.map(reply => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              depth={depth + 1} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              onLike={onLike}
            />
          ))}
          
          {hiddenRepliesCount > 0 && (
            <button 
              onClick={() => setShowMoreReplies(true)}
              style={{
                marginLeft: '32px', paddingLeft: '16px', fontSize: '13px', fontWeight: 500, color: 'var(--accent)',
                display: 'flex', alignItems: 'center'
              }}
              className="hover:underline"
            >
              <div style={{ width: '16px', height: '1px', background: 'var(--border-default)', marginRight: '8px', marginLeft: '-16px' }} />
              Show {hiddenRepliesCount} more {hiddenRepliesCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default CommentItem;
