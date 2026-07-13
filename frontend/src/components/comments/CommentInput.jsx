import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';

const CommentInput = ({ onSubmit, placeholder = "Write a comment...", onCancel, autoFocus = false, initialValue = '' }) => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(autoFocus || !!initialValue);
  
  // Mentions state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerFilter, setPickerFilter] = useState('');
  const [pickerPosition, setPickerPosition] = useState(0);
  
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [content]);

  const members = currentProject?.members || [];
  const filteredMembers = members.filter(m => 
    m.userId.name.toLowerCase().includes(pickerFilter.toLowerCase())
  ).slice(0, 5);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const lastWordRegex = /@(\w*)$/;
    const match = textBeforeCursor.match(lastWordRegex);

    if (match) {
      setPickerFilter(match[1]);
      setShowPicker(true);
      setPickerPosition(cursor > 20 ? 80 : 40); 
    } else {
      setShowPicker(false);
    }
  };

  const handleSelectMention = (member) => {
    const cursor = textareaRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, cursor);
    const textAfterCursor = content.slice(cursor);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const newText = textBeforeCursor.slice(0, lastAtPos) + `@${member.userId.name} ` + textAfterCursor;
      setContent(newText);
    }
    
    setShowPicker(false);
    textareaRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (showPicker) {
        setShowPicker(false);
        e.preventDefault();
      } else if (onCancel) {
        onCancel();
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      if (!initialValue) setContent('');
      if (!initialValue) setIsFocused(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0
      }}>
        {user?.avatar ? (
          <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          user?.name?.charAt(0).toUpperCase()
        )}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px',
          padding: '8px', transition: 'all var(--transition-fast)'
        }} className="focus-within:border-accent focus-within:shadow-md">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            style={{
              width: '100%', background: 'transparent', color: 'var(--text-main)', fontSize: '14px',
              border: 'none', resize: 'none', outline: 'none', minHeight: '24px', lineHeight: 1.5
            }}
            className="custom-scrollbar"
            rows={1}
          />
        </div>
        
        {/* ACTIONS ROW (revealed on focus) */}
        {(isFocused || content.trim()) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <button 
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              style={{
                padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                background: content.trim() && !isSubmitting ? 'var(--accent)' : 'var(--bg-card)',
                color: content.trim() && !isSubmitting ? '#fff' : 'var(--text-muted)',
                cursor: content.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)'
              }}
              className={content.trim() && !isSubmitting ? 'hover:bg-accent-hover' : ''}
            >
              {isSubmitting ? 'Posting...' : initialValue ? 'Save' : 'Comment'}
            </button>
            <button 
              onClick={() => {
                if (onCancel) onCancel();
                if (!initialValue) setIsFocused(false);
                if (!initialValue) setContent('');
              }}
              style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}
              className="hover:text-text-main transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Mention Picker */}
        {showPicker && filteredMembers.length > 0 && (
          <div 
            ref={pickerRef}
            style={{
              position: 'absolute', top: '100%', left: `${pickerPosition}px`, marginTop: '4px', zIndex: 10,
              width: '200px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)', padding: '4px'
            }}
          >
            {filteredMembers.map(m => (
              <button
                key={m.userId._id}
                onClick={() => handleSelectMention(m)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
                  borderRadius: '4px', cursor: 'pointer', textAlign: 'left'
                }}
                className="hover:bg-hover transition-colors"
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {m.userId.avatar ? <img src={m.userId.avatar} style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : m.userId.name.charAt(0)}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }} className="truncate">{m.userId.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentInput;
