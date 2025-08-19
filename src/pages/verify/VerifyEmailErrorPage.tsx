import { FadeIn } from '@/theme/animation';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';
import Routers from '@/router/routers';
import useNavigation from '@/hooks/useNavigation';

const VerifyEmailErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const { goToAuth } = useNavigation();
  const { t } = useTranslation();
  const {
    resendVerifyEmail,
    isResendEmailLoading,
    isResendEmailSuccess,
    isResendEmailError,
    resendEmailError,
    clearResendEmailError,
  } = useAuth();
  const { showError, showSuccess } = useToastContext();
  const hasHandledSuccess = useRef(false);
  const hasHandledError = useRef(false);

  useEffect(() => {
    if (isResendEmailSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      showSuccess(t('resendEmail_success'));
      clearResendEmailError();
      // Navigate to email sent page
      navigate('/auth/email-sent');
    }

    if (isResendEmailError && resendEmailError && !hasHandledError.current) {
      hasHandledError.current = true;
      showError('Lỗi', resendEmailError);
    }
  }, [
    isResendEmailSuccess,
    isResendEmailError,
    resendEmailError,
    t,
    clearResendEmailError,
    navigate,
  ]);

  // Reset handled flags
  useEffect(() => {
    if (!isResendEmailSuccess) {
      hasHandledSuccess.current = false;
    }
    if (!isResendEmailError) {
      hasHandledError.current = false;
    }
  }, [isResendEmailSuccess, isResendEmailError]);

  const handleResendEmail = () => {
    // Check if we have email in localStorage or URL params
    const savedEmail =
      localStorage.getItem('userEmail') || new URLSearchParams(window.location.search).get('email');

    if (savedEmail) {
      resendVerifyEmail(savedEmail);
    } else {
      // If no email available, navigate to resend form
      navigate(Routers.RESEND_EMAIL);
    }
  };

  return (
    <FadeIn>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center ">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            {t('verifyEmailError_title')}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {t('verifyEmailError_message')}
            <br />
            {t('verifyEmailError_suggestion')}
          </p>
          <button
            className="bg-primary text-primary-foreground px-4 mr-2 py-2 rounded hover:bg-secondary mb-2"
            onClick={() => goToAuth()}
          >
            {t('verifyEmailError_backToLogin')}
          </button>
          <button
            className="bg-gray-200 text-primary px-4 py-2 rounded hover:bg-muted-foreground"
            onClick={handleResendEmail}
            disabled={isResendEmailLoading}
          >
            {isResendEmailLoading ? t('resendEmail_loading') : t('sendEmail_resend')}
          </button>
        </div>
      </div>
    </FadeIn>
  );
};

export default VerifyEmailErrorPage;
