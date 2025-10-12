import { MdEmail, MdCheckCircle } from 'react-icons/md';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { SlideInDown, FadeIn } from '@/theme/animation';
import { useTranslation } from 'react-i18next';
import { FaSignInAlt } from 'react-icons/fa';
import { logout } from '@/features/auth/authSlice';
import useNavigation from '@/hooks/useNavigation';
import { useAuth } from '@/features/auth/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useEffect, useRef } from 'react';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher';

const EmailConfirmation = () => {
  const { t } = useTranslation();
  const { goToAuth } = useNavigation();
  const {
    user,
    resendVerifyEmail,
    isResendEmailLoading,
    isResendEmailSuccess,
    isResendEmailError,
    resendEmailError,
    clearResendEmailError,
  } = useAuth();
  const { showError, showSuccess } = useToastContext();

  // Refs to prevent duplicate toasts
  const hasHandledSuccess = useRef(false);
  const hasHandledError = useRef(false);

  // Handle resend success/error effects
  useEffect(() => {
    if (isResendEmailSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      showSuccess(t('resendEmail_success'));
      clearResendEmailError();
    }

    if (isResendEmailError && resendEmailError && !hasHandledError.current) {
      hasHandledError.current = true;
      // Hiển thị lỗi từ backend, không dùng translation key cố định
      showError('Lỗi', resendEmailError);
    }
  }, [isResendEmailSuccess, isResendEmailError, resendEmailError, t, clearResendEmailError]);

  // Reset handled flags
  useEffect(() => {
    if (!isResendEmailSuccess) {
      hasHandledSuccess.current = false;
    }
    if (!isResendEmailError) {
      hasHandledError.current = false;
    }
  }, [isResendEmailSuccess, isResendEmailError]);

  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  const handleResendEmail = () => {
    if (user?.email) {
      resendVerifyEmail(user.email);
    } else {
      // Hiển thị lỗi cụ thể thay vì dùng translation key
      showError('Lỗi', 'Email không tồn tại');
    }
  };

  const handleContinueLogin = () => {
    logout();
    goToAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
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
        {/* Main Card */}
        <SlideInDown>
          <Card className="overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            {/* Header with gradient */}
            <div className="bg-blue-600 dark:bg-blue-700 px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white dark:bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <img
                  src="https://res.cloudinary.com/dfvy81evi/image/upload/v1754886570/circle_logo_uresgo.png"
                  className="p-2"
                  alt="Logo"
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{t('sendEmail_title')}</h1>
              <p className="text-blue-100 dark:text-blue-200 text-sm">{t('sendEmail_subtitle')}</p>
            </div>

            {/* Content */}
            <CardContent className="px-8 py-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <MdCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-green-600 dark:text-green-400 font-semibold">{t('sendEmail_sent')}</span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">{t('sendEmail_check')}</p>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                  <p className="text-orange-800 dark:text-orange-300 text-sm font-medium flex items-center justify-center gap-2">
                    <span>💡</span>
                    {t('sendEmail_tip')}
                  </p>
                </div>
              </div>

              {/* Gmail Button */}
              <Button
                onClick={handleOpenGmail}
                variant="default"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-4 text-base font-semibold transition-all duration-300 transform hover:shadow-lg group mb-4"
              >
                <MdEmail className="w-5 h-5 mr-3" />
                {t('sendEmail_openGmail')}
              </Button>

              <Button
                onClick={handleContinueLogin}
                variant="default"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-4 text-base font-semibold transition-all duration-300 transform hover:shadow-lg group mb-4"
              >
                <FaSignInAlt className="w-5 h-5 mr-3" />
                {t('verifyEmail_continueLogin')}
              </Button>

              {/* Additional Info */}
              <div className="mt-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{t('sendEmail_notReceived')}</p>
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    disabled={isResendEmailLoading}
                    className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                  >
                    {isResendEmailLoading ? t('resendEmail_loading') : t('sendEmail_resend')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideInDown>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 dark:text-gray-500 text-xs">{t('sendEmail_footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
