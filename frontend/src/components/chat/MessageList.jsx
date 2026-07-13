import React, { useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';

const MessageList = ({ channelId, messages, setMessages, onReply, highlightedMessageId }) => {
  const { socket } = useSocket();
  const [loading, setLoading] = React.useState(true);

  // Fetch messages when channel changes
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/chat/${channelId}?limit=30`);
        setMessages(res.data.data.messages || []);
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      setMessages([]);
      fetchMessages();
    }
  }, [channelId]);

  // Socket listeners for real-time updates from OTHER users
  useEffect(() => {
    if (!socket || !channelId) return;

    // Re-join channel room every time socket or channelId changes
    socket.emit('join:channel', channelId);

    const handleNewMessage = (msg) => {
      if (msg.channelId !== channelId) return;
      setMessages(prev => {
        // Deduplicate — sender already added their own message via onMessageSent
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleMessageEdited = (editedMsg) => {
      if (editedMsg.channelId !== channelId) return;
      setMessages(prev => prev.map(m => m._id === editedMsg._id ? editedMsg : m));
    };

    const handleMessageDeleted = ({ messageId, isDeleted, deletedByRole, deletedByName, content }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId
          ? { ...m, isDeleted: true, deletedByRole, deletedByName, content }
          : m
      ));
    };

    const handleReactionUpdated = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId ? { ...m, reactions } : m
      ));
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:message_edited', handleMessageEdited);
    socket.on('chat:message_deleted', handleMessageDeleted);
    socket.on('chat:reaction_updated', handleReactionUpdated);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:message_edited', handleMessageEdited);
      socket.off('chat:message_deleted', handleMessageDeleted);
      socket.off('chat:reaction_updated', handleReactionUpdated);
    };
  }, [socket, channelId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '20px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ display: 'flex', gap: '12px' }} className="animate-pulse">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-card)' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ height: '14px', width: '100px', background: 'var(--bg-card)', borderRadius: '4px' }} />
              <div style={{ height: '14px', width: i%2===0 ? '200px' : '300px', background: 'var(--bg-card)', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No messages yet. Start the conversation!</div>
        </div>
      </div>
    );
  }

  // Generate date separators
  const renderMessages = () => {
    const elements = [];
    let lastDate = null;

    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.createdAt);
      const dateStr = msgDate.toLocaleDateString();
      
      if (dateStr !== lastDate) {
        elements.push(
          <div key={`date-${dateStr}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {dateStr}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
          </div>
        );
        lastDate = dateStr;
      }

      const prevMsg = messages[idx - 1];
      const showHeader = !prevMsg || 
                         prevMsg.senderId?._id !== msg.senderId?._id ||
                         new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60 * 1000;

      elements.push(
        <MessageBubble 
          key={msg._id} 
          message={msg} 
          showHeader={showHeader}
          onReply={onReply}
          isHighlighted={highlightedMessageId === msg._id}
        />
      );
    });

    return elements;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '12px' }}>
      {renderMessages()}
    </div>
  );
};

export default MessageList;
