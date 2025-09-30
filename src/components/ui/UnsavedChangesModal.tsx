import React from 'react';
import { useTranslation } from 'react-i18next';
import { Save, LogOut, Shield } from 'lucide-react';
import { Modal } from '@/components/ui/modal-confirm';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndLeave: () => Promise<void> | void;
  onLeaveAnyway: () => void;
  onStay: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
}

/**
 * Modal component for handling unsaved changes when users try to leave the page.
 * Provides three options: Save & Leave, Leave Anyway, or Stay
 */
export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onClose,
  onSaveAndLeave,
  onLeaveAnyway,
  onStay,
  loading = false,
  title,
  message,
}) => {
  const { t } = useTranslation();

  const defaultTitle = title || t('chart_unsaved_changes_title', 'Unsaved Changes');
  const defaultMessage =
    message ||
    t(
      'chart_unsaved_changes_message',
      'Your chart has unsaved changes. If you leave now, all changes will be lost.'
    );

  const handleSaveAndLeave = async () => {
    try {
      await onSaveAndLeave();
      onClose();
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Keep modal open if save fails
    }
  };

  const handleLeaveAnyway = () => {
    onLeaveAnyway();
    onClose();
  };

  const handleStay = () => {
    onStay();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlay={!loading}
      showCloseButton={!loading}
    >
      <div className="text-center">
        {/* Warning Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
          <span className="text-2xl" role="img" aria-label="warning">
            ⚠️
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{defaultTitle}</h3>

        {/* Message */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{defaultMessage}</p>

        {/* Actions */}
        <div className="flex flex-col space-y-3">
          {/* Save & Leave Button */}
          <button
            type="button"
            onClick={handleSaveAndLeave}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('common_saving', 'Saving...')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('chart_unsaved_save_and_leave', 'Save & Leave')}
              </>
            )}
          </button>

          {/* Leave Anyway Button */}
          <button
            type="button"
            onClick={handleLeaveAnyway}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('chart_unsaved_leave_anyway', 'Leave Anyway')}
          </button>

          {/* Stay Button */}
          <button
            type="button"
            onClick={handleStay}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Shield className="h-4 w-4" />
            {t('chart_unsaved_stay', 'Stay')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UnsavedChangesModal;
