import { FadeIn } from '@/theme/animation';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';
import Routers from '@/router/routers';
import useNavigation from '@/hooks/useNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/10 dark:bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Theme and Language Switchers */}
      <div className="absolute top-6 left-8 flex gap-4 z-50">
        <FadeIn delay={0.25}>
          <ThemeSwitcher />
        </FadeIn>
        <FadeIn delay={0.35}>
          <LanguageSwitcher />
        </FadeIn>
      </div>

      <div className="max-w-md w-full relative z-10">
        <FadeIn>
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('verifyEmailError_title')}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                {t('verifyEmailError_message')}
                <br />
                {t('verifyEmailError_suggestion')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300 text-center leading-relaxed">
                  {t('verifyEmailError_help')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => goToAuth()}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  {t('verifyEmailError_backToLogin')}
                </Button>
                <Button
                  onClick={handleResendEmail}
                  disabled={isResendEmailLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isResendEmailLoading ? t('resendEmail_loading') : t('sendEmail_resend')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default VerifyEmailErrorPage;
