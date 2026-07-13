import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import MessageSearch from './MessageSearch';

const MessageArea = ({ channelId, channelName, project }) => {
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);

  const scrollContainerRef = useRef(null);

  useEffect(() => { 
    setMessages([]); 
    setReplyTo(null);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchIndex(0);
  }, [channelId]);

  // Compute search results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const results = messages
      .filter(m => m.content && m.content.toLowerCase().includes(lowerQuery))
      .map(m => m._id);
    
    setSearchResults(results);
    setSearchIndex(0);
  }, [searchQuery, messages]);

  const prevCountRef = useRef(0);
  useEffect(() => {
    const count = messages.length;
    // Only auto-scroll to bottom if we are not actively searching
    if (count > prevCountRef.current && scrollContainerRef.current && !isSearchOpen) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    prevCountRef.current = count;
  }, [messages, isSearchOpen]);

  const handleMessageSent = useCallback((newMsg) => {
    setMessages(prev => {
      if (prev.some(m => m._id === newMsg._id)) return prev;
      return [...prev, newMsg];
    });
    setReplyTo(null);
  }, []);

  const handleReply = useCallback((msg) => {
    setReplyTo({
      messageId: msg._id,
      content: msg.content,
      senderName: typeof msg.senderId === 'object' ? msg.senderId.name : 'Unknown'
    });
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-page)' }}>
      {/* CHANNEL HEADER or SEARCH */}
      {isSearchOpen ? (
        <MessageSearch 
          onClose={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resultCount={searchResults.length}
          currentMatchIndex={searchIndex}
          onNext={() => setSearchIndex(prev => Math.min(prev + 1, searchResults.length - 1))}
          onPrev={() => setSearchIndex(prev => Math.max(prev - 1, 0))}
        />
      ) : (
        <div style={{
          height: '56px', flexShrink: 0, padding: '0 20px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {channelName.startsWith('#') ? (
              <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>{channelName}</span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-card)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>
                  {channelName.charAt(0)}
                </div>
                <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>{channelName}</span>
              </div>
            )}
            
            <div style={{ width: '1px', height: '16px', background: 'var(--border-default)', margin: '0 12px' }} />
            
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {channelName.startsWith('#') ? `${project.members?.length || 0} members` : 'Online'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setIsSearchOpen(true)}
              style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', border: 'none', background: 'transparent' }} 
              className="hover:bg-hover hover:text-text-primary transition-colors"
            >
              <Search size={16} />
            </button>
            <button style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', border: 'none', background: 'transparent' }} className="hover:bg-hover hover:text-text-primary transition-colors">
              <Users size={16} />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        style={{ flex: 1, overflowY: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column' }}
        className="custom-scrollbar relative"
      >
        <MessageList 
          channelId={channelId} 
          messages={messages} 
          setMessages={setMessages} 
          onReply={handleReply} 
          highlightedMessageId={searchResults[searchIndex] || null}
        />
      </div>

      <div style={{ flexShrink: 0, padding: '0 20px' }}>
        <TypingIndicator channelId={channelId} />
      </div>

      <div style={{ flexShrink: 0, padding: '12px 20px 20px' }}>
        <MessageInput channelId={channelId} project={project} onMessageSent={handleMessageSent} replyTo={replyTo} clearReply={() => setReplyTo(null)} />
      </div>
    </div>
  );
};
export default MessageArea;
