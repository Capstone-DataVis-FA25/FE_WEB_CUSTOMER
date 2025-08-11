import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FadeIn, SlideInRight, ScaleIn } from '../../theme/animation';
import useNavigation from '@/hooks/useNavigation';
import { useAuth } from '@/features/auth/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const { signIn, signUp, signInWithGoogle, user, isAuthenticated, isLoading, error, clearError } =
    useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const hasShownSuccessToast = useRef(false);
  const hasShownErrorToast = useRef(false);
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
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'customer', // Default role
  });
  // const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { goToHome } = useNavigation();
  const { showSuccess, showError } = useToastContext();
  const { t } = useTranslation();

  // Chỉ điều hướng khi thành công, không show toast ở đây
  useEffect(() => {
    if (isAuthenticated && user) {
      goToHome();
    }
  }, [isAuthenticated, user, goToHome]);

  // Không show toast ở đây nữa, chỉ log error
  useEffect(() => {
    if (error) {
      console.error('Authentication thất bại:', error);
    }
  }, [error]);

  // Reset toast flags khi chuyển đổi mode
  useEffect(() => {
    hasShownErrorToast.current = false;
  }, [isLogin]);

  // Reset success toast flag khi logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasShownSuccessToast.current = false;
    }
  }, [isAuthenticated]);

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
      if (!formData.firstName) {
        errors.push(t('validation_required'));
      }
      if (!formData.lastName) {
        errors.push(t('validation_required'));
      }

      if (formData.password !== formData.confirmPassword) {
        errors.push(t('validation_passwordMatch'));
      }
    }

    // setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors and reset toast flags
    clearError();
    hasShownErrorToast.current = false;
    hasShownSuccessToast.current = false;

    // Validate form
    if (!validateForm()) {
      return;
    }

    let result;
    // Dispatch appropriate action
    if (isLogin) {
      result = await signIn({
        email: formData.email,
        password: formData.password,
      });
    } else {
      result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
    }

    // Kiểm tra kết quả
    if (result.type.endsWith('/fulfilled')) {
      // Thành công
      const user = (
        result.payload as { user?: { firstName?: string; lastName?: string; email?: string } }
      )?.user;

      showSuccess(
        isLogin ? 'Đăng nhập thành công' : 'Đăng ký thành công',
        `Chào mừng ${user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}!`,
        3000
      );
    } else if (result.type.endsWith('/rejected')) {
      // Thất bại
      const errorMessage =
        (result as { payload?: { message?: string } })?.payload?.message || 'Authentication failed';
      showError(isLogin ? 'Đăng nhập thất bại' : 'Đăng ký thất bại', errorMessage, 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Google Login handlers
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        showError(t('auth_googleLoginFailed'));
        return;
      }

      const result = await signInWithGoogle({
        idToken: credentialResponse.credential,
      });

      if (result.meta.requestStatus === 'fulfilled') {
        showSuccess(t('auth_googleLoginSuccess'));
      } else {
        showError(t('auth_googleLoginFailed'));
      }
    } catch (error) {
      console.error('Google login error:', error);
      showError(t('auth_googleLoginFailed'));
    }
  };

  const handleGoogleError = () => {
    showError(t('auth_googleLoginFailed'));
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
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder={t('auth_enterFullName')}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </FadeIn>
              )}
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
                        value={formData.lastName}
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

              <div className="mt-6 me-20 ml-20 grid grid-cols-1 gap-3">
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    i18nIsDynamicList
                  />
                </div>
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
