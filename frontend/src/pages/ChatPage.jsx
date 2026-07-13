import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChannelList from '../components/chat/ChannelList';
import MessageArea from '../components/chat/MessageArea';
import { useSocket } from '../context/SocketContext';
import { useProject } from '../context/ProjectContext';
import { useAI } from '../context/AIContext';
import projectService from '../services/projectService';
import ErrorBoundary from '../components/shared/ErrorBoundary'; // Will create ErrorBoundary if needed or just use simple one
import { usePageTitle } from '../hooks/usePageTitle';

const ChatPageContent = () => {
  const { projectId } = useParams();
  const { socket } = useSocket();
  const { selectProject } = useProject();
  const { openAI, dispatchContextualSuggestion } = useAI();
  
  const [project, setProject] = useState(null);
  const [activeChannel, setActiveChannel] = useState(`project:${projectId}`);
  usePageTitle(project ? `Chat - ${project.name}` : 'Chat');
  const [channelName, setChannelName] = useState('# general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      try {
        const res = await projectService.getProjectById(projectId);
        setProject(res.data);
        selectProject(res.data);
      } catch (err) {
        console.error('Failed to load project for chat', err);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) loadProject();
  }, [projectId, selectProject]);

  useEffect(() => {
    setActiveChannel(`project:${projectId}`);
    setChannelName('# general');
  }, [projectId]);

  useEffect(() => {
    if (socket && activeChannel) {
      socket.emit('join:channel', activeChannel);
    }
  }, [socket, activeChannel]);

  useEffect(() => {
    dispatchContextualSuggestion({
      text: `Want to summarize the latest messages in ${channelName}?`,
      buttonText: 'Summarize Chat',
      action: () => {
        openAI('summarize');
      }
    });
    return () => dispatchContextualSuggestion(null);
  }, [channelName, dispatchContextualSuggestion, openAI]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: 'calc(100vh - var(--topbar-height))', background: 'var(--bg-page)' }}>
        <div style={{ width: '240px', borderRight: '1px solid var(--border-default)', padding: '16px' }} className="animate-pulse">
           <div style={{ height: '20px', background: 'var(--bg-card)', borderRadius: '4px', marginBottom: '24px' }} />
           <div style={{ height: '32px', background: 'var(--bg-card)', borderRadius: '6px', marginBottom: '8px' }} />
           <div style={{ height: '32px', background: 'var(--bg-card)', borderRadius: '6px', marginBottom: '8px' }} />
        </div>
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-pulse">
           <div style={{ height: '40px', background: 'var(--bg-card)', borderRadius: '8px', maxWidth: '400px' }} />
           <div style={{ height: '60px', background: 'var(--bg-card)', borderRadius: '8px', maxWidth: '300px', alignSelf: 'flex-end' }} />
           <div style={{ height: '40px', background: 'var(--bg-card)', borderRadius: '8px', maxWidth: '350px' }} />
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - var(--topbar-height))',
      overflow: 'hidden',
      background: 'var(--bg-page)'
    }}>
      <ChannelList 
        project={project} 
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        setChannelName={setChannelName}
      />
      <MessageArea 
        channelId={activeChannel}
        channelName={channelName}
        project={project}
      />
    </div>
  );
};

export default function ChatPage() {
  return (
    <ChatPageContent />
  );
}
