'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);
    
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 300); // Allow for exit animation
    }, duration);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, id, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/30 text-green-500 border-green-500';
      case 'error':
        return 'bg-red-900/30 text-red-500 border-red-500';
      case 'warning':
        return 'bg-yellow-900/30 text-yellow-500 border-yellow-500';
      default:
        return 'bg-blue-900/30 text-blue-500 border-blue-500';
    }
  };
  
  return (
    <div 
      className={`${getColors()} border-l-4 px-4 py-3 shadow-lg rounded-r-lg flex items-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="ml-3 mr-6 flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button 
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div 
        className="absolute bottom-0 left-0 h-1 bg-current opacity-30" 
        style={{ width: `${progress}%`, transition: 'width 100ms linear' }} 
      />
    </div>
  );
};

// Toast Container component
export interface ToastItem extends Omit<ToastProps, 'onClose'> {}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    // Create toast container element
    const element = document.createElement('div');
    element.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md';
    document.body.appendChild(element);
    setPortalElement(element);
    
    // Create global toast method
    window.toast = {
      show: (message: string, type: ToastType = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type, duration }]);
        return id;
      },
      success: (message: string, duration = 5000) => {
        return window.toast.show(message, 'success', duration);
      },
      error: (message: string, duration = 5000) => {
        return window.toast.show(message, 'error', duration);
      },
      warning: (message: string, duration = 5000) => {
        return window.toast.show(message, 'warning', duration);
      },
      info: (message: string, duration = 5000) => {
        return window.toast.show(message, 'info', duration);
      },
      dismiss: (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      },
      dismissAll: () => {
        setToasts([]);
      }
    };
    
    return () => {
      document.body.removeChild(element);
      // @ts-ignore
      delete window.toast;
    };
  }, []);
  
  const handleClose = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  if (!portalElement) return null;
  
  return createPortal(
    <>
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          id={toast.id} 
          type={toast.type} 
          message={toast.message} 
          duration={toast.duration} 
          onClose={handleClose} 
        />
      ))}
    </>,
    portalElement
  );
};

// Add toast to the window object
declare global {
  interface Window {
    toast: {
      show: (message: string, type?: ToastType, duration?: number) => string;
      success: (message: string, duration?: number) => string;
      error: (message: string, duration?: number) => string;
      warning: (message: string, duration?: number) => string;
      info: (message: string, duration?: number) => string;
      dismiss: (id: string) => void;
      dismissAll: () => void;
    };
  }
}
