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
      <div className="bg-transparent">
        {/* Warning Icon with gradient background */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 mb-6 ring-4 ring-yellow-500/20">
          <span className="text-4xl" role="img" aria-label="warning">
            ⚠️
          </span>
        </div>

        {/* Title with gradient text */}
        <h3 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
          {defaultTitle}
        </h3>

        {/* Message */}
        <p className="text-center text-sm text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          {defaultMessage}
        </p>

        {/* Actions with modern styling */}
        <div className="flex flex-col space-y-3">
          {/* Save & Leave Button - Green gradient */}
          <button
            type="button"
            onClick={handleSaveAndLeave}
            disabled={loading}
            className="group relative w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl dark:shadow-green-900/20 dark:hover:shadow-green-900/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800"
          >
            <div className="absolute inset-0 bg-white/20 dark:bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white relative z-10"
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
                <span className="relative z-10">{t('common_saving', 'Saving...')}</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 relative z-10" />
                <span className="relative z-10">
                  {t('chart_unsaved_save_and_leave', 'Save & Leave')}
                </span>
              </>
            )}
          </button>

          {/* Leave Anyway Button - Red gradient */}
          <button
            type="button"
            onClick={handleLeaveAnyway}
            disabled={loading}
            className="group relative w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl dark:shadow-red-900/20 dark:hover:shadow-red-900/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 dark:from-red-600 dark:to-pink-700 dark:hover:from-red-700 dark:hover:to-pink-800"
          >
            <div className="absolute inset-0 bg-white/20 dark:bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            <LogOut className="h-5 w-5 relative z-10" />
            <span className="relative z-10">{t('chart_unsaved_leave_anyway', 'Leave Anyway')}</span>
          </button>

          {/* Stay Button - Outline with gradient hover */}
          <button
            type="button"
            onClick={handleStay}
            disabled={loading}
            className="group relative w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold shadow-sm transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Shield className="h-5 w-5 relative z-10" />
            <span className="relative z-10">{t('chart_unsaved_stay', 'Stay')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UnsavedChangesModal;
