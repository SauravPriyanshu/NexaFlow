import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const TypingIndicator = ({ channelId }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState(new Map());

  useEffect(() => {
    if (!socket || !channelId) return;

    const handleTyping = ({ userId, userName, channelId: evtChannelId }) => {
      if (evtChannelId !== channelId || userId === user._id) return;
      
      setTypingUsers(prev => {
        const next = new Map(prev);
        const timeoutId = setTimeout(() => {
          setTypingUsers(current => {
            const temp = new Map(current);
            temp.delete(userId);
            return temp;
          });
        }, 3000);
        
        if (next.has(userId)) clearTimeout(next.get(userId).timeoutId);
        
        next.set(userId, { userName, timeoutId });
        return next;
      });
    };

    const handleStopTyping = ({ userId, channelId: evtChannelId }) => {
      if (evtChannelId !== channelId) return;
      setTypingUsers(prev => {
        const next = new Map(prev);
        if (next.has(userId)) {
          clearTimeout(next.get(userId).timeoutId);
          next.delete(userId);
        }
        return next;
      });
    };

    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop_typing', handleStopTyping);

    return () => {
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop_typing', handleStopTyping);
      typingUsers.forEach(val => clearTimeout(val.timeoutId));
    };
  }, [socket, channelId, user._id]);

  if (typingUsers.size === 0) {
    return <div style={{ height: '24px' }} />;
  }

  const names = Array.from(typingUsers.values()).map(u => u.userName);
  let text = '';
  if (names.length === 1) text = `${names[0]} is typing`;
  else if (names.length === 2) text = `${names[0]} and ${names[1]} are typing`;
  else text = `Several people are typing`;

  return (
    <div style={{ height: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
      {text}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out both' }} />
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }} />
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }} />
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
