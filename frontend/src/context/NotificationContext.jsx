import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Play a subtle beep
  const playSubtleBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (err) {
      console.warn('Audio play failed', err);
    }
  };

  const fetchInitialData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [notifsRes, countRes] = await Promise.all([
        axiosInstance.get('/notifications?limit=20'),
        axiosInstance.get('/notifications/unread-count')
      ]);
      setNotifications(notifsRes.data.data.notifications || []);
      setUnreadCount(countRes.data.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      playSubtleBeep();
      toast.info(`${notif.title}: ${notif.message}`);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, toast]);

  const markRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllRead = async () => {
    try {
      await axiosInstance.patch('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const fetchMore = async (page) => {
    try {
      const res = await axiosInstance.get(`/notifications?page=${page}&limit=20`);
      if (res.data?.data?.notifications) {
        setNotifications(prev => [...prev, ...res.data.data.notifications]);
      }
    } catch (error) {
      console.error('Failed to fetch more notifs', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markRead,
      markAllRead,
      fetchMore
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
