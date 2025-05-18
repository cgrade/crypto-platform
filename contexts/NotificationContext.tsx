"use client";

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
      // In a real implementation, this would be an API call
      // For now, we'll simulate different notifications for admin vs regular users
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const currentTime = new Date();
      
      if (isAdmin) {
        // Admin sees new transaction submissions
        setNotifications([
          {
            id: '1',
            message: 'New withdrawal request submitted',
            type: 'withdraw',
            status: 'pending',
            createdAt: new Date(currentTime.getTime() - 15 * 60000), // 15 minutes ago
            read: false,
            amount: '0.025',
            currency: 'BTC'
          },
          {
            id: '2',
            message: 'New deposit initiated',
            type: 'deposit',
            status: 'pending',
            createdAt: new Date(currentTime.getTime() - 45 * 60000), // 45 minutes ago
            read: false,
            amount: '0.15',
            currency: 'BTC'
          },
          {
            id: '3',
            message: 'New withdrawal request submitted',
            type: 'withdraw',
            status: 'pending',
            createdAt: new Date(currentTime.getTime() - 120 * 60000), // 2 hours ago
            read: true,
            amount: '0.075',
            currency: 'BTC'
          }
        ]);
      } else {
        // Regular users see status updates for their transactions
        setNotifications([
          {
            id: '1',
            message: 'Your withdrawal request was approved',
            type: 'withdraw',
            status: 'approved',
            createdAt: new Date(currentTime.getTime() - 30 * 60000), // 30 minutes ago
            read: false,
            amount: '0.015',
            currency: 'BTC'
          },
          {
            id: '2',
            message: 'Your deposit was confirmed',
            type: 'deposit',
            status: 'approved',
            createdAt: new Date(currentTime.getTime() - 2 * 3600000), // 2 hours ago
            read: false,
            amount: '0.05',
            currency: 'BTC'
          },
          {
            id: '3',
            message: 'Your withdrawal request was rejected',
            type: 'withdraw',
            status: 'rejected',
            createdAt: new Date(currentTime.getTime() - 5 * 3600000), // 5 hours ago
            read: true,
            amount: '0.035',
            currency: 'BTC'
          }
        ]);
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
