import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_NOTIFICATIONS } from '../data/mockNotifications';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(() =>
    getStorageItem('sv_notifications', INITIAL_NOTIFICATIONS)
  );

  useEffect(() => {
    setStorageItem('sv_notifications', notifications);
  }, [notifications]);

  // Fetch real notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      if (data?.notifications?.length > 0) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('API notifications fetch failed, using local storage cache:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
    } catch (e) {
      // ignore
    }
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (e) {
      // ignore
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
    } catch (e) {
      // ignore
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
    } catch (e) {
      // ignore
    }
    setNotifications([]);
  };

  const addNotification = ({ title, message, type = 'activity', documentId = null, actionUrl = '/documents' }) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      read: false,
      isRead: false,
      timestamp: new Date().toISOString(),
      documentId,
      actionUrl
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
