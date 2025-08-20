import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { forgotPasswordThunk } from '@/features/auth/authThunk';
import { validateEmail } from '@/utils/validation';
import { useAuth } from '@/features/auth/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { FadeIn } from '@/theme/animation';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { showSuccess, showError } = useToastContext();
  const { isLoading } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      showError(t('validation_required'));
      return;
    }

    if (!validateEmail(email)) {
      showError(t('validation_email'));
      return;
    }

    try {
      await dispatch(forgotPasswordThunk({ email })).unwrap();
      setIsSuccess(true);
      showSuccess(t('forgot_password_success'));
    } catch (error: unknown) {
      showError(t('error_occurred'));
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <FadeIn>
            <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Mail className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('email_sent')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('forgot_password_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-300 text-center leading-relaxed">
                    {t('forgot_password_check_email')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    asChild 
                    variant="outline" 
                    className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <Link to="/auth/signin">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('forgot_password_back_to_login')}
                    </Link>
                  </Button>
                  <Button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {t('forgot_password_resend_email')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
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

      <div className="max-w-md w-full space-y-8 relative z-10">
        <FadeIn>
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('forgot_password_title')}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                {t('forgot_password_subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                    {t('common_email')}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('common_email_placeholder')}
                    disabled={isLoading}
                    required
                    className="h-12 text-base border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 transition-all duration-200"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !email} 
                  className="w-full h-12 text-base text-white font-semibold bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('submiting')}
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      {t('reset_help')}
                    </>
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/auth?mode=login"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('forgot_password_back_to_login')}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
