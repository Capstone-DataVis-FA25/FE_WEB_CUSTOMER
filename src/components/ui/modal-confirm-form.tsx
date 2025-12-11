import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModalConfirmFormProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  type?: 'danger' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  inputValue: string;
  inputType?: string;
  inputPlaceholder?: string;
  inputError?: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const typeStyles = {
  danger: {
    icon: '⚠️',
    confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: '⚠️',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  info: {
    icon: 'ℹ️',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  success: {
    icon: '✅',
    confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
};

export const ModalConfirmForm: React.FC<ModalConfirmFormProps & { userEmail?: string }> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  type = 'info',
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  inputValue,
  inputType = 'text',
  inputPlaceholder = '',
  inputError,
  onInputChange,
  userEmail,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  const currentStyle = typeStyles[type];
  console.log('userEmail from props:', userEmail);
  console.log('inputValue:', inputValue);
  const isEmailMatch = userEmail
    ? inputValue.trim() !== '' && inputValue.trim().toLowerCase() === userEmail.trim().toLowerCase()
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={() => !loading && onClose()} />
      <div
        className={`
          relative bg-white rounded-lg shadow-xl w-full max-w-md
          animate-in fade-in-0 zoom-in-95 duration-200
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {title && (
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
              {t(title)}
            </h3>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('common_cancel')}
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${currentStyle.iconBg} mb-4`}>
            <span className="text-2xl" role="img" aria-label={type}>
              {currentStyle.icon}
            </span>
          </div>
          {title && <h3 className="text-lg font-medium text-gray-900 mb-2">{t(title)}</h3>}
          <p className="text-sm text-gray-500 mb-4">{t(message)}</p>
          <input
            type={inputType}
            value={inputValue}
            onChange={onInputChange}
            placeholder={t(inputPlaceholder)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
          />
          {inputError && <p className="text-red-600 mb-2">{t(inputError)}</p>}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t(cancelText)}
            </button>
            <button
              type="button"
              onClick={() => !loading && onConfirm()}
              disabled={loading || !isEmailMatch}
              className={`
                w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${currentStyle.confirmButton}
              `}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  {t('loading')}
                </>
              ) : (
                t(confirmText)
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
