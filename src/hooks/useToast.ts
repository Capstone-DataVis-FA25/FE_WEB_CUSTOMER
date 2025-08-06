import { useState, useCallback } from 'react';
import { type ToastType, type ToastProps } from '@/components/ui/toast';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  message?: string;
}

interface ShowToastParams {
  title: string;
  options?: ToastOptions;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, options = {} }: ShowToastParams) => {
      const { type = 'info', duration = 5000, message } = options;

      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newToast: ToastProps = {
        id,
        type,
        title,
        message,
        duration,
        onClose: removeToast,
      };

      setToasts(prev => [...prev, newToast]);
    },
    [removeToast]
  );

  // Convenience methods
  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({
        title,
        options: { type: 'success', message, duration },
      });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({
        title,
        options: { type: 'error', message, duration },
      });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({
        title,
        options: { type: 'warning', message, duration },
      });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({
        title,
        options: { type: 'info', message, duration },
      });
    },
    [showToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  };
};

export default useToast;
