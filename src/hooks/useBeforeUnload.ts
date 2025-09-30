import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface UseBeforeUnloadOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  onBeforeUnload?: () => void;
}

/**
 * Hook that warns users before leaving the page when there are unsaved changes.
 * This helps prevent accidental loss of work when editing forms or charts.
 */
export const useBeforeUnload = ({
  hasUnsavedChanges,
  message,
  onBeforeUnload,
}: UseBeforeUnloadOptions) => {
  const { t } = useTranslation();
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  // Keep ref updated
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show warning if there are unsaved changes
      if (!hasUnsavedChangesRef.current) return;

      // Call optional callback
      if (onBeforeUnload) {
        onBeforeUnload();
      }

      // Modern browsers ignore custom message, but we still need to set it
      const warningMessage =
        message ||
        t(
          'chart_unsaved_changes_warning',
          'You have unsaved changes. Are you sure you want to leave?'
        );

      // For modern browsers
      event.preventDefault();
      event.returnValue = warningMessage;

      // For older browsers
      return warningMessage;
    };

    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message, onBeforeUnload, t]);

  return {
    hasUnsavedChanges,
  };
};

export default useBeforeUnload;
