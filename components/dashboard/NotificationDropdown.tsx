"use client";

import React, { useRef, useEffect } from 'react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import Link from 'next/link';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const NotificationItem = ({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: Notification,
  onMarkAsRead: (id: string) => void 
}) => {
  const getStatusColor = () => {
    switch (notification.status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      case 'pending':
      default:
        return 'text-yellow-400';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'deposit':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        );
      case 'withdraw':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  let href = notification.type === 'withdraw' 
    ? '/dashboard/withdraw' 
    : '/dashboard/deposit';

  return (
    <Link 
      href={href}
      className={`block px-4 py-3 ${notification.read ? 'bg-dark-200' : 'bg-dark-100'} ${!notification.read ? 'hover:bg-dark-100' : 'hover:bg-dark-200'} border-b border-dark-100 last:border-0 transition-colors duration-200`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="ml-3 w-full">
          <div className="flex justify-between">
            <p className={`text-sm font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
              {notification.message}
            </p>
            {!notification.read && (
              <span className="h-2 w-2 bg-primary-500 rounded-full ml-2 mt-1.5"></span>
            )}
          </div>
          {notification.amount && (
            <p className={`text-sm ${getStatusColor()}`}>
              {notification.amount} {notification.currency}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount,
    isOpen, 
    closeNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeNotifications();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeNotifications]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute z-50 right-0 top-full mt-1 w-80 bg-dark-200 rounded-lg shadow-lg border border-dark-100 max-h-96 overflow-y-auto"
    >
      <div className="p-3 border-b border-dark-100 flex justify-between items-center">
        <h3 className="text-sm font-medium">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="divide-y divide-dark-100">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onMarkAsRead={markAsRead}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-400 text-sm">
            No notifications at this time
          </div>
        )}
      </div>
    </div>
  );
}
