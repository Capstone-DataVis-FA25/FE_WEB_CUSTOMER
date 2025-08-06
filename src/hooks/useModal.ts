import { useState } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

interface UseModalConfirmReturn extends UseModalReturn {
  openConfirm: (onConfirm: () => void | Promise<void>) => void;
  confirm: () => void;
  isLoading: boolean;
}

export const useModalConfirm = (initialState: boolean = false): UseModalConfirmReturn => {
  const modal = useModal(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void | Promise<void>) | null>(
    null
  );

  const openConfirm = (onConfirm: () => void | Promise<void>) => {
    setOnConfirmCallback(() => onConfirm);
    modal.open();
  };

  const confirm = async () => {
    if (onConfirmCallback) {
      try {
        setIsLoading(true);
        await onConfirmCallback();
        modal.close();
        setOnConfirmCallback(null);
      } catch (error) {
        console.error('Confirm action failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const close = () => {
    if (!isLoading) {
      modal.close();
      setOnConfirmCallback(null);
    }
  };

  return {
    ...modal,
    close,
    openConfirm,
    confirm,
    isLoading,
  };
};
