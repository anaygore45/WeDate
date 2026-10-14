import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { getSocket } from '../services/socket.js';
import { notificationApi } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [onlineStatusMap, setOnlineStatusMap] = useState({});

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && res.data) {
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (err) {
      // ignore in offline/initial
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handlePresence = ({ userId, status }) => {
      setOnlineStatusMap((prev) => ({
        ...prev,
        [userId]: status === 'online'
      }));
    };

    const handleChatNotification = (notif) => {
      setLatestNotification(notif);
      setUnreadNotifications((prev) => prev + 1);
    };

    socket.on('user_presence', handlePresence);
    socket.on('chat_notification', handleChatNotification);

    return () => {
      socket.off('user_presence', handlePresence);
      socket.off('chat_notification', handleChatNotification);
    };
  }, [user]);

  const triggerMatchCelebration = () => {
    // Elegant, restrained confetti burst in burgundy and rose gold
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#762D43', '#EBC9CE', '#FAF7F3', '#D4AF37']
      });
    } catch (e) {
      // fallback
    }
  };

  return (
    <SocketContext.Provider
      value={{
        unreadNotifications,
        setUnreadNotifications,
        refreshNotifications: fetchUnreadCount,
        latestNotification,
        onlineStatusMap,
        triggerMatchCelebration
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
