import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for animation to complete
  }, [id, onClose]);

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
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-200 dark:border-green-700/50',
          icon: CheckCircle,
          iconBg: 'bg-green-100 dark:bg-green-800/50',
          iconColor: 'text-green-600 dark:text-green-400',
          titleColor: 'text-green-900 dark:text-green-100',
          messageColor: 'text-green-700 dark:text-green-300',
          progressBg: 'bg-green-600 dark:bg-green-400',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
          border: 'border-red-200 dark:border-red-700/50',
          icon: AlertCircle,
          iconBg: 'bg-red-100 dark:bg-red-800/50',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-900 dark:text-red-100',
          messageColor: 'text-red-700 dark:text-red-300',
          progressBg: 'bg-red-600 dark:bg-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
          border: 'border-yellow-200 dark:border-yellow-700/50',
          icon: AlertTriangle,
          iconBg: 'bg-yellow-100 dark:bg-yellow-800/50',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          titleColor: 'text-yellow-900 dark:text-yellow-100',
          messageColor: 'text-yellow-700 dark:text-yellow-300',
          progressBg: 'bg-yellow-600 dark:bg-yellow-400',
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          border: 'border-blue-200 dark:border-blue-700/50',
          icon: Info,
          iconBg: 'bg-blue-100 dark:bg-blue-800/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-900 dark:text-blue-100',
          messageColor: 'text-blue-700 dark:text-blue-300',
          progressBg: 'bg-blue-600 dark:bg-blue-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50',
          border: 'border-gray-200 dark:border-gray-700/50',
          icon: Info,
          iconBg: 'bg-gray-100 dark:bg-gray-700/50',
          iconColor: 'text-gray-600 dark:text-gray-400',
          titleColor: 'text-gray-900 dark:text-gray-100',
          messageColor: 'text-gray-700 dark:text-gray-300',
          progressBg: 'bg-gray-600 dark:bg-gray-400',
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
        relative w-96 max-w-sm p-5 rounded-xl border-2 shadow-2xl backdrop-blur-md
        ${styles.bg} ${styles.border}
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        hover:shadow-3xl hover:scale-[1.02]
      `}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all hover:rotate-90 duration-200"
          aria-label={t('accessibility.closeNotification', 'Close notification')}
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-4 pr-8">
          {/* Icon with background */}
          <div className="flex-shrink-0">
            <div
              className={`p-2.5 rounded-xl ${styles.iconBg} shadow-sm ring-2 ring-white/50 dark:ring-black/20`}
            >
              <IconComponent className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pt-1">
            <h4 className={`text-base font-bold ${styles.titleColor} mb-1.5 leading-tight`}>
              {title}
            </h4>
            {message && (
              <p className={`text-sm ${styles.messageColor} leading-relaxed`}>{message}</p>
            )}
          </div>
        </div>

        {/* Progress Bar (if duration is set) */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/5 dark:bg-white/5 rounded-b-xl overflow-hidden">
            <div
              className={`h-full ${styles.progressBg} transition-all ease-linear shadow-sm`}
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
