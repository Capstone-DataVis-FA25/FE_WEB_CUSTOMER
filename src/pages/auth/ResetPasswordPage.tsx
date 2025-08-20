import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { resetPasswordThunk } from '@/features/auth/authThunk';
import { useNavigation } from '@/hooks/useNavigation';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { FadeIn } from '@/theme/animation';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher';

interface PasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const { showSuccess, showError } = useToastContext();
  const dispatch = useDispatch<AppDispatch>();
  const { goTo } = useNavigation();
  const { t } = useTranslation();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError(t('reset_password_invalid_token'));
    }
  }, [token, t]);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    if (score < 2) return { level: 'weak', color: 'red', text: 'Yếu' };
    if (score < 4) return { level: 'medium', color: 'yellow', text: 'Trung bình' };
    return { level: 'strong', color: 'green', text: 'Mạnh' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!token) {
      showError(t('reset_password_invalid_token'));
      return false;
    }

    if (formData.password.length < 8) {
      showError(t('reset_password_min_length'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showError(t('reset_password_confirm_mismatch'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await dispatch(
        resetPasswordThunk({
          password: formData.password,
          token: token!,
        })
      ).unwrap();

      setIsSuccess(true);
      showSuccess(t('reset_password_success'));

      // Redirect to login after 3 seconds
      setTimeout(() => {
        goTo('/auth');
      }, 2000);
    } catch (_error: unknown) {
      showError(`${t('error_occurred')} ${t('reset_password_invalid_token')}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Token error screen
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <FadeIn>
            <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('reset_password_invalid_token')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                  {tokenError}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-300 text-center leading-relaxed">
                    {t('reset_password_token_expired')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    asChild 
                    variant="outline" 
                    className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <Link to="/auth/forgot-password">{t('forgot_password_resend_email')}</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Link to="/auth/signin">{t('forgot_password_back_to_login')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    );
  }

  // Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <FadeIn>
            <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('reset_password_success')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('reset_password_success_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-300 text-center leading-relaxed">
                    {t('reset_password_redirect_message')}
                  </p>
                </div>
                <Button 
                  asChild 
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link to="/auth/signin">{t('auth_loginNow')}</Link>
                </Button>
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
                <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('reset_password_title')}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                {t('reset_password_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                    {t('reset_password_new_password')}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.password ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      placeholder={t('reset_password_new_password')}
                      className="h-12 text-base pr-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 transition-all duration-200"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showPasswords.password ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t('reset_password_strength')}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.color === 'red'
                              ? 'text-red-600 dark:text-red-400'
                              : passwordStrength.color === 'yellow'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.color === 'red'
                              ? 'bg-red-500 w-1/3'
                              : passwordStrength.color === 'yellow'
                                ? 'bg-yellow-500 w-2/3'
                                : 'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                    {t('reset_password_confirm')}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => handleInputChange('confirmPassword', e.target.value)}
                      placeholder={t('reset_password_confirm')}
                      className="h-12 text-base pr-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 transition-all duration-200"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="flex items-center mt-2">
                      {formData.password === formData.confirmPassword ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-xs">{t('reset_password_confirm_match')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-xs">{t('reset_password_confirm_mismatch')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword} 
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('reset_password_updating')}
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      {t('reset_password_update')}
                    </>
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/auth"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                  >
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

export default ResetPasswordPage;
