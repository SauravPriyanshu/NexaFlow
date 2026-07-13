import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, Send, AtSign, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ channelId, project, onMessageSent, replyTo, clearReply }) => {
  const { socket } = useSocket();
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const emojiPickerRef = useRef(null);
  const mentionsRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (mentionsRef.current && !mentionsRef.current.contains(event.target)) {
        setShowMentions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + 'px';
    }
  }, [content]);

  // Auto-focus when a reply is initiated
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleTyping = () => {
    if (!socket || !channelId) return;

    if (!typingTimeoutRef.current) {
      socket.emit('chat:typing', { channelId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:stop_typing', { channelId });
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    const currentContent = content.trim();
    setContent(''); // Optimistically clear input
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      socket?.emit('chat:stop_typing', { channelId });
    }

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post('/chat', {
        channelId,
        content: currentContent,
        type: 'text',
        ...(replyTo ? { replyTo } : {})
      });
      // Immediately inject the returned message into the message list
      if (onMessageSent && res.data?.data) {
        onMessageSent(res.data.data);
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setContent(currentContent); // Restore on fail
    } finally {
      setIsSubmitting(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post(`/files/upload/${project._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const uploadedFile = res.data.data.file;
      
      const chatRes = await axiosInstance.post('/chat', {
        channelId,
        content: `Uploaded file: ${uploadedFile.name}`,
        type: 'file',
        fileUrl: uploadedFile.cloudinaryUrl,
        fileName: uploadedFile.name
      });

      if (onMessageSent && chatRes.data?.data) {
        onMessageSent(chatRes.data.data);
      }
      
    } catch (err) {
      console.error('File upload failed', err);
    } finally {
      setIsSubmitting(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex', flexDirection: 'column',
      padding: '8px 12px'
    }} className="focus-within:border-accent transition-colors">
      
      {/* Reply Banner */}
      {replyTo && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', marginBottom: '6px',
          background: 'var(--bg-input)', borderRadius: '6px',
          borderLeft: '3px solid var(--accent)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Replying to {replyTo.senderName}: </span>
            <span className="truncate">{replyTo.content}</span>
          </div>
          <button
            onClick={clearReply}
            style={{ marginLeft: '8px', color: 'var(--text-muted)', flexShrink: 0, display: 'flex' }}
            className="hover:text-text-primary"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        style={{
          width: '100%',
          maxHeight: '150px',
          minHeight: '44px',
          background: 'transparent',
          color: 'var(--text-primary)',
          fontSize: '15px',
          resize: 'none',
          outline: 'none',
          border: 'none',
          padding: '8px 0',
          lineHeight: 1.5
        }}
        className="custom-scrollbar"
        rows={1}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {project && (
            <div style={{ position: 'relative' }}>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={isSubmitting} style={{ width: '32px', height: '32px', borderRadius: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:bg-hover hover:text-text-primary transition-colors">
                <Paperclip size={18} />
              </button>
            </div>
          )}
          
          <div style={{ position: 'relative' }} ref={emojiPickerRef}>
            <button onClick={() => setShowEmojiPicker(p => !p)} style={{ width: '32px', height: '32px', borderRadius: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:bg-hover hover:text-text-primary transition-colors">
              <Smile size={18} />
            </button>
            {showEmojiPicker && (
              <div style={{ position: 'absolute', bottom: '100%', left: '0', marginBottom: '8px', zIndex: 50 }}>
                <EmojiPicker onEmojiClick={(emoji) => {
                  setContent(prev => prev + emoji.emoji);
                }} theme={theme === 'dark' ? 'dark' : 'light'} />
              </div>
            )}
          </div>

          {project && (
            <div style={{ position: 'relative' }} ref={mentionsRef}>
              <button onClick={() => setShowMentions(p => !p)} style={{ width: '32px', height: '32px', borderRadius: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:bg-hover hover:text-text-primary transition-colors">
                <AtSign size={18} />
              </button>
              {showMentions && (
                <div style={{ position: 'absolute', bottom: '100%', left: '0', marginBottom: '8px', zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '8px', minWidth: '150px', maxHeight: '200px', overflowY: 'auto' }}>
                  {project.members?.map(m => (
                    <div 
                      key={m.userId._id}
                      onClick={() => {
                        setContent(prev => prev + `@${m.userId.name} `);
                        setShowMentions(false);
                        textareaRef.current?.focus();
                      }}
                      style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px' }}
                      className="hover:bg-hover transition-colors"
                    >
                      {m.userId.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          style={{
            height: '32px',
            padding: '0 16px',
            borderRadius: '6px',
            background: content.trim() && !isSubmitting ? 'var(--accent)' : 'var(--bg-page)',
            color: content.trim() && !isSubmitting ? '#fff' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: content.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'background var(--transition-fast)'
          }}
          className={content.trim() && !isSubmitting ? 'hover:bg-accent-hover' : ''}
        >
          <Send size={14} /> Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
