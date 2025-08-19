import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';
import useNavigation from '@/hooks/useNavigation';
import { FadeIn } from '@/theme/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MdEmail } from 'react-icons/md';

const ResendEmailPage: React.FC = () => {
  const { goToAuth, goToSendEmailVerify } = useNavigation();
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

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const hasHandledSuccess = useRef(false);
  const hasHandledError = useRef(false);

  // Handle resend success/error effects
  useEffect(() => {
    if (isResendEmailSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      showSuccess(t('resendEmail_success'));

      const timer = setTimeout(() => {
        clearResendEmailError();
        goToSendEmailVerify();
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (isResendEmailError && resendEmailError && !hasHandledError.current) {
      hasHandledError.current = true;
      showError(t('resendEmail_error'), resendEmailError);
    }
  }, [
    isResendEmailSuccess,
    isResendEmailError,
    resendEmailError,
    t,
    clearResendEmailError,
    goToSendEmailVerify,
  ]);

  // Reset handled flags when state changes
  useEffect(() => {
    if (!isResendEmailSuccess) {
      hasHandledSuccess.current = false;
    }
    if (!isResendEmailError) {
      hasHandledError.current = false;
    }
  }, [isResendEmailSuccess, isResendEmailError]);

  // Load email from localStorage if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      return t('auth_enterEmail');
    }
    if (!emailRegex.test(emailValue)) {
      return t('auth_invalidEmail', 'Email không hợp lệ');
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateEmail(email);
    if (validation) {
      setEmailError(validation);
      return;
    }

    setEmailError('');
    resendVerifyEmail(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear form validation error
    if (emailError) {
      setEmailError('');
    }
    // Clear API error khi user bắt đầu nhập lại
    if (isResendEmailError) {
      clearResendEmailError();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <FadeIn>
          <Card className="overflow-hidden bg-white shadow-2xl border-0">
            {/* Header */}
            <div className="bg-accent px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MdEmail className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {t('verifyEmailError_resendEmail', 'Gửi lại email xác thực')}
              </h1>
              <p className="text-blue-100 text-sm">
                {t('resendEmail_description', 'Nhập email của bạn để nhận lại email xác thực')}
              </p>
            </div>

            {/* Content */}
            <CardContent className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth_email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder={t('auth_enterEmail')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent ${
                      emailError || isResendEmailError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    disabled={isResendEmailLoading}
                  />
                  {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                  {isResendEmailError && resendEmailError && !emailError && (
                    <p className="mt-1 text-sm text-red-600">{resendEmailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isResendEmailLoading || !email}
                  className="w-full bg-accent text-white hover:bg-secondary py-3 text-base font-semibold transition-all duration-300"
                >
                  {isResendEmailLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('resendEmail_loading')}
                    </div>
                  ) : (
                    t('sendEmail_resend')
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <Button
                  onClick={() => goToAuth()}
                  variant="outline"
                  className="text-gray-600 hover:text-accent"
                >
                  {t('verifyEmailError_backToLogin')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default ResendEmailPage;
