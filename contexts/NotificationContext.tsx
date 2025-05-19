// Notifications removed as per user request.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface Notification {
  id: string;
  message: string;
  type: 'deposit' | 'withdraw';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  read: boolean;
  amount?: string;
  currency?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isOpen: boolean;
  toggleNotifications: () => void;
  closeNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  
  const isAdmin = session?.user?.role === 'admin';

  const fetchNotifications = async () => {
    try {
      if (!session?.user) return;
      const res = await fetch('/api/user/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        // Convert string dates to Date objects
        const notifications = data.notifications.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        }));
        setNotifications(notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const closeNotifications = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
      
      // Set up polling for notifications every minute
      const intervalId = setInterval(fetchNotifications, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [session]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isOpen,
    toggleNotifications,
    closeNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
