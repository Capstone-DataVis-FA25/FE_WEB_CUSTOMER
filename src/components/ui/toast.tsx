import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { SlideInRight } from '@/theme/animation';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for animation to complete
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: Info,
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: Info,
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
        };
    }
  };

  const styles = getToastStyles();
  const IconComponent = styles.icon;

  if (!isVisible) return null;

  return (
    <SlideInRight>
      <div
        className={`
        relative w-96 max-w-sm p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${styles.bg}
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3 pr-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${styles.titleColor}`}>{title}</h4>
            {message && <p className={`mt-1 text-xs ${styles.messageColor}`}>{message}</p>}
          </div>
        </div>

        {/* Progress Bar (if duration is set) */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
            <div
              className={`h-full ${
                type === 'success'
                  ? 'bg-green-600'
                  : type === 'error'
                    ? 'bg-red-600'
                    : type === 'warning'
                      ? 'bg-yellow-600'
                      : 'bg-blue-600'
              } transition-all ease-linear`}
              style={{
                animation: `toast-progress ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </SlideInRight>
  );
};

export default Toast;
