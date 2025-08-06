import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FadeIn, SlideInRight, ScaleIn } from '../../theme/animation';
import useNavigation from '@/hooks/useNavigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError, loginStart, registerStart, selectAuth } from '@/store/slices/authSlice';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const { error, isAuthenticated, user, isLoading } = useAppSelector(selectAuth);
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();

  // Lấy mode từ query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.search]);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'cus1@gm.com',
    password: '12345678',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'customer', // Default role
  });
  // const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { goToHome } = useNavigation();
  const { showSuccess, showError } = useToastContext();
  const { t } = useTranslation();

  // Xử lý khi authentication thành công
  useEffect(() => {
    if (isAuthenticated && user) {
      showSuccess(t('auth_logoutSuccess'), t('home_welcome', { email: user.name }), 3000);
      goToHome();
    }
  }, [isAuthenticated, user, goToHome, showSuccess, t]);

  // Xử lý khi có lỗi
  useEffect(() => {
    if (error) {
      console.error('Authentication thất bại:', error);
      showError(isLogin ? t('auth_loginTitle') : t('auth_registerTitle'), error, 5000);
    }
  }, [error, isLogin, showError, t]);

  // Validation form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.email) {
      errors.push(t('validation_required'));
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push(t('validation_email'));
    }

    if (!formData.password) {
      errors.push(t('validation_required'));
    } else if (formData.password.length < 6) {
      errors.push(t('validation_password'));
    }

    if (!isLogin) {
      if (!formData.fullName) {
        errors.push(t('validation_required'));
      }

      if (!formData.phone) {
        errors.push(t('validation_required'));
      } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
        errors.push('Số điện thoại không hợp lệ');
      }

      if (formData.password !== formData.confirmPassword) {
        errors.push(t('validation_passwordMatch'));
      }
    }

    // setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    dispatch(clearError());
    // setValidationErrors([]);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Dispatch appropriate action
    if (isLogin) {
      dispatch(
        loginStart({
          email: formData.email,
          password: formData.password,
        })
      );
    } else {
      dispatch(
        registerStart({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen relative flex">
      {/* Full Screen Background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url('https://i.pinimg.com/736x/31/36/fd/3136fd3c34828acb55ecd7a2aa76dacb.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/60 to-accent/40"></div>
      </div>

      {/* Welcome Text - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-8">
        <FadeIn className="text-center text-white">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            {t('auth_welcomeTitle')}
            <span className="block text-accent">Vegetable Shop</span>
          </h1>
          <p className="text-xl text-white/90 max-w-md">{t('auth_welcomeSubtitle')}</p>
        </FadeIn>
      </div>

      {/* Form Side - Right */}
      <div className="w-full lg:w-1/2 lg:ml-auto relative z-10 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border">
          <SlideInRight>
            {/* Back Button */}
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="mb-8 p-0 h-auto text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('auth_backButton')}
              </Button>
            )}

            {/* Form Header */}
            <div className="text-center mb-8">
              <ScaleIn>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                  <User className="h-8 w-8" />
                </div>
              </ScaleIn>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {isLogin ? t('auth_loginTitle') : t('auth_registerTitle')}
              </h2>
              <p className="text-muted-foreground">
                {isLogin ? t('auth_welcomeBack') : t('auth_createAccount')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <FadeIn>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('auth_fullName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder={t('auth_enterFullName')}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </FadeIn>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth_email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder={t('auth_enterEmail')}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <FadeIn>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('auth_phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder={t('auth_enterPhone')}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </FadeIn>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth_password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-12"
                    placeholder={t('auth_enterPassword')}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <FadeIn>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth_confirmPasswordLabel')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder={t('auth_enterConfirmPassword')}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </FadeIn>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      {t('auth_rememberLogin')}
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-primary hover:text-primary/80"
                  >
                    {t('auth_forgotPasswordLink')}
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                    {isLogin ? t('auth_loggingIn') : t('auth_registering')}
                  </div>
                ) : isLogin ? (
                  t('auth_loginButton')
                ) : (
                  t('auth_registerButton')
                )}
              </Button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">{t('auth_or')}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t('auth_google')}
                </Button>
                <Button variant="outline" className="w-full">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  {t('auth_facebook')}
                </Button>
              </div>
            </div>

            {/* Switch Mode */}
            <div className="mt-8 text-center">
              <span className="text-muted-foreground">
                {isLogin ? t('auth_noAccount') : t('auth_hasAccount')}
              </span>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="p-0 ml-2 h-auto font-semibold"
              >
                {isLogin ? t('auth_registerNow') : t('auth_loginNow')}
              </Button>
            </div>
          </SlideInRight>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
