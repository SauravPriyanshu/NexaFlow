import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Smile, Reply, Pencil, Trash2, X, Ban, FileText, Eye, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { useToast } from '../../context/ToastContext';
import EmojiPicker from 'emoji-picker-react';
import { useTheme } from '../../context/ThemeContext';

// Portal-based emoji picker — renders at document.body so it never shifts the chat layout
const FloatingEmojiPicker = ({ anchorRef, onEmojiClick, onClose, theme }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const pickerH = 350;
    const pickerW = 350;
    // Prefer to open above the button; fall back to below if not enough space
    const top = rect.top - pickerH - 8 > 0
      ? rect.top - pickerH - 8
      : rect.bottom + 8;
    // Align right edge of picker with right edge of button; clamp to viewport
    const left = Math.max(8, Math.min(rect.right - pickerW, window.innerWidth - pickerW - 8));
    setPos({ top, left });
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (anchorRef.current && anchorRef.current.contains(e.target)) return;
      onClose();
    };
    // Slight delay so the button's own click doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose, anchorRef]);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
      }}
      // Stop propagation so clicking inside the picker doesn't bubble to the document handler
      onMouseDown={e => e.stopPropagation()}
    >
      <EmojiPicker
        onEmojiClick={(e) => { onEmojiClick(e.emoji); onClose(); }}
        theme={theme === 'dark' ? 'dark' : 'light'}
        height={350}
        width={340}
      />
    </div>,
    document.body
  );
};

const MessageBubble = ({ message, showHeader, onReply, isHighlighted }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();

  const senderId = typeof message.senderId === 'object'
    ? message.senderId
    : { _id: message.senderId, name: 'Unknown', avatar: null };
  const isMine = senderId._id === user._id || senderId._id?.toString() === user._id?.toString();

  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [optimisticContent, setOptimisticContent] = useState(null); // instant edit update
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletedLocally, setIsDeletedLocally] = useState(false); // instant optimistic delete
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || {});

  // Sync local reactions state if the server/socket updates the message prop
  useEffect(() => {
    setReactions(message.reactions || {});
  }, [message.reactions]);

  const bubbleRef = useRef(null);
  
  useEffect(() => {
    if (isHighlighted && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  // Ref on the Smile button so the portal can calculate position from it
  const smileBtnRef = useRef(null);

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const handleEditSubmit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    const oldContent = message.content;
    setOptimisticContent(editContent);
    setIsEditing(false);
    try {
      await axiosInstance.patch(`/chat/${message._id}`, { content: editContent });
    } catch (err) {
      setOptimisticContent(null); // Revert on fail
      toast.error('Failed to edit message');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    // Optimistic: mark as deleted immediately so UI updates without waiting for socket
    setIsDeletedLocally(true);
    setShowDeleteConfirm(false);
    try {
      await axiosInstance.delete(`/chat/${message._id}`);
    } catch (err) {
      setIsDeletedLocally(false); // Revert on failure
      setShowDeleteConfirm(true);
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReact = useCallback(async (emoji) => {
    // Determine what to send to the backend
    let emojiToSend = emoji;
    const prev = reactions;
    const alreadyReacted = Object.entries(prev).find(([, users]) => users.includes(user._id));
    if (alreadyReacted && alreadyReacted[0] === emoji) {
      emojiToSend = null; // Toggle off if clicking the same emoji
    }

    // Optimistically update UI
    setReactions(prev => {
      const updated = {};
      Object.entries(prev).forEach(([em, users]) => {
        const filtered = users.filter(uid => uid !== user._id);
        if (filtered.length > 0) updated[em] = filtered;
      });
      if (emojiToSend) {
        updated[emoji] = [...(updated[emoji] || []), user._id];
      }
      return updated;
    });

    try {
      await axiosInstance.patch(`/chat/${message._id}/react`, { emoji: emojiToSend });
    } catch (err) {
      toast.error('Failed to update reaction');
      // Ideally revert state here, but omitting for brevity/simplicity as socket will overwrite
    }
  }, [user._id, message._id, reactions, toast]);

  const handleReply = () => { if (onReply) onReply(message); };

  return (
    <div
      ref={bubbleRef}
      style={{
        display: 'flex', gap: '16px', padding: '4px 20px',
        margin: showHeader ? '12px -20px 0' : '2px -20px 0',
        transition: 'background 0.5s ease',
        background: isHighlighted ? 'rgba(6,182,212,0.15)' : (isHovering ? 'var(--bg-card)' : 'transparent'),
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* AVATAR */}
      <div style={{ width: '40px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        {showHeader && (
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--accent-dim)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 600, overflow: 'hidden'
          }}>
            {senderId.avatar
              ? <img src={senderId.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (senderId.name || 'U').charAt(0).toUpperCase()
            }
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: showHeader ? '2px' : '0' }}>

        {showHeader && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {senderId.name}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}

        {/* WhatsApp-style Reply Preview */}
        {message.replyTo && message.replyTo.messageId && (
          <div style={{
            marginBottom: '4px', padding: '6px 10px',
            borderLeft: '4px solid var(--accent)',
            background: 'var(--bg-input)', borderRadius: '6px',
            fontSize: '13px', color: 'var(--text-secondary)',
            display: 'flex', flexDirection: 'column', gap: '2px',
            opacity: 0.8
          }}>
            <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '12px' }}>
              {message.replyTo.senderName}
            </span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {message.replyTo.content}
            </span>
          </div>
        )}

        <div style={{ position: 'relative' }}>
          {isEditing ? (
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '8px', marginTop: '4px' }}>
              <textarea
                autoFocus
                onFocus={(e) => {
                  const val = e.target.value;
                  e.target.value = '';
                  e.target.value = val;
                }}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '15px', resize: 'none', outline: 'none' }}
                rows={2}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); }
                  if (e.key === 'Escape') { setIsEditing(false); setEditContent(message.content); }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => { setIsEditing(false); setEditContent(message.content); }} style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="hover:text-text-primary">Cancel</button>
                <button onClick={handleEditSubmit} style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>Save Changes</button>
              </div>
            </div>
          ) : (() => {
            const isEffectivelyDeleted = isDeletedLocally || message.isDeleted;
            const deletedByRole = message.deletedByRole;

            let deletedText = 'This message was deleted';
            if (isDeletedLocally && isMine) {
              deletedText = 'You deleted this message';
            } else if (deletedByRole === 'self') {
              deletedText = isMine ? 'You deleted this message' : 'This message was deleted';
            } else if (deletedByRole === 'owner') {
              deletedText = `This message was deleted by owner`;
            } else if (deletedByRole === 'admin') {
              deletedText = `This message was deleted by admin`;
            }

            return isEffectivelyDeleted ? (
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ban size={14} style={{ opacity: 0.6 }} /> {deletedText}
              </div>
            ) : (
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {optimisticContent || message.content}
                {message.fileUrl && (() => {
                  const backendUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
                  const fullFileUrl = message.fileUrl.startsWith('/') ? `${backendUrl}${message.fileUrl}` : message.fileUrl;
                  
                  return (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', width: 'fit-content', minWidth: '280px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={20} color="var(--accent)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {message.fileName || 'Attached File'}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                          <a href={fullFileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} className="hover:underline">
                            <Eye size={12} /> View
                          </a>
                          <a href={fullFileUrl} download target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} className="hover:text-text-primary">
                            <Download size={12} /> Download
                          </a>
                          {isMine && (
                            <button onClick={() => setShowDeleteConfirm(true)} style={{ fontSize: '12px', color: 'var(--text-error)', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} className="hover:opacity-80">
                              <Trash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {(message.editedAt || optimisticContent) && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }} className="select-none">(edited)</span>
                )}
              </div>
            );
          })()}

          {/* Reactions display */}
          {Object.keys(reactions).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {Object.entries(reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '13px',
                    background: users.includes(user._id) ? 'var(--accent-dim)' : 'var(--bg-card)',
                    border: `1px solid ${users.includes(user._id) ? 'var(--accent)' : 'var(--border-default)'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    color: 'var(--text-primary)'
                  }}
                >
                  {emoji} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{users.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* HOVER ACTION BAR — only when not deleted */}
          {isHovering && !message.isDeleted && !isDeletedLocally && (
            <div style={{
              position: 'absolute', top: showHeader ? '-32px' : '-18px', right: '0',
              display: 'flex', alignItems: 'center', background: 'var(--bg-card)',
              border: '1px solid var(--border-default)', borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: '2px', zIndex: 20
            }}>

              {/* React — single Smile icon, picker is a portal */}
              <button
                ref={smileBtnRef}
                onClick={() => setShowReactionPicker(p => !p)}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showReactionPicker ? 'var(--accent)' : 'var(--text-muted)', borderRadius: '4px' }}
                className="hover:bg-hover hover:text-text-primary transition-colors"
                title="React"
              >
                <Smile size={16} />
              </button>

              {/* Reply */}
              <button
                onClick={handleReply}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderRadius: '4px' }}
                className="hover:bg-hover hover:text-text-primary transition-colors"
                title="Reply"
              >
                <Reply size={16} />
              </button>

              {isMine && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderRadius: '4px' }}
                    className="hover:bg-hover hover:text-accent transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderRadius: '4px' }}
                    className="hover:bg-hover hover:text-error transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Portal emoji picker — rendered at body, uses fixed position, no layout shift */}
          {showReactionPicker && (
            <FloatingEmojiPicker
              anchorRef={smileBtnRef}
              onEmojiClick={handleReact}
              onClose={() => setShowReactionPicker(false)}
              theme={theme}
            />
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION */}
      {showDeleteConfirm && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: '12px', padding: '24px', width: '380px', maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Delete Message</h3>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ color: 'var(--text-muted)', display: 'flex', padding: '4px' }} className="hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ height: '36px', padding: '0 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                className="hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ height: '36px', padding: '0 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'var(--error, #ef4444)', color: '#fff', border: 'none', opacity: isDeleting ? 0.7 : 1, cursor: isDeleting ? 'not-allowed' : 'pointer' }}
                className={!isDeleting ? 'hover:opacity-90 transition-opacity' : ''}
              >
                {isDeleting ? 'Deleting…' : 'Delete Message'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MessageBubble;
