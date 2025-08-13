import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FadeIn, SlideInRight, ScaleIn } from '../../theme/animation';
import { AnimatePresence } from 'framer-motion';
import useNavigation from '@/hooks/useNavigation';
import { useAuth } from '@/features/auth/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher';
import {
  PasswordStrengthChecker,
  usePasswordStrength,
} from '@/components/ui/password-strength-checker';

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const { signIn, signUp, signInWithGoogle, user, isAuthenticated, isLoading, successMessage } =
    useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const hasShownSuccessToast = useRef(false);
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

  // Persist form data để tránh mất khi component re-mount
  const getPersistedFormData = () => {
    try {
      return (
        (window as any).__authFormData__ || {
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          role: 'customer',
        }
      );
    } catch {
      return {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'customer',
      };
    }
  };

  const [formData, setFormData] = useState(getPersistedFormData());
  const { goToHome, goToSendEmailVerify, goToAuth } = useNavigation();
  const { showError, showSuccess } = useToastContext();
  const { t } = useTranslation();

  // Password strength validation
  const { isValid: isPasswordValid, isStrong: isPasswordStrong } = usePasswordStrength(
    formData.password
  );

  // Chỉ điều hướng khi thành công
  useEffect(() => {
    if (isAuthenticated && user && !hasShownSuccessToast.current) {
      if (user.isVerified) {
        goToHome();
      } else if (successMessage != null) {
        goToSendEmailVerify();
      } else {
        goToAuth();
      }
    }
  }, [isAuthenticated, user, goToHome]);

  // Reset success toast flag khi logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasShownSuccessToast.current = false;
    }
  }, [isAuthenticated]);

  // Validation form
  const validateForm = (): string | null => {
    if (!formData.email.trim()) {
      return 'Email không được để trống';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Email không hợp lệ';
    }

    if (!formData.password.trim()) {
      return 'Mật khẩu không được để trống';
    }

    // Kiểm tra độ mạnh mật khẩu khi đăng ký
    if (!isLogin) {
      if (!isPasswordValid) {
        return 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (!isPasswordStrong) {
        return 'Mật khẩu chưa đủ mạnh. Vui lòng đáp ứng tất cả các yêu cầu bên dưới';
      }
    } else {
      // Đăng nhập chỉ cần tối thiểu 6 ký tự
      if (formData.password.length < 6) {
        return 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }

    if (!isLogin) {
      if (!formData.firstName.trim()) {
        return 'Tên không được để trống';
      }

      if (!formData.lastName.trim()) {
        return 'Họ không được để trống';
      }

      if (formData.password !== formData.confirmPassword) {
        return 'Mật khẩu xác nhận không khớp';
      }
    }

    return null; // Không có lỗi
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form - CHỈ show toast nếu có lỗi
    const validationError = validateForm();
    if (validationError) {
      showError('Lỗi xác thực', validationError, 3000);
      return;
    }

    try {
      let result;

      // Dispatch action
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
        // Thành công - KHÔNG show toast ở đây, sẽ show ở HomePage
        hasShownSuccessToast.current = true;

        // Clear persisted form data khi thành công
        try {
          delete (window as any).__authFormData__;
        } catch (error) {
          console.warn('Could not clear persisted form data:', error);
        }

        // useEffect sẽ tự động navigate
      } else if (result.type.endsWith('/rejected')) {
        const errorMessage =
          (result as { payload?: { message?: string } })?.payload?.message ||
          (isLogin ? 'Email hoặc mật khẩu không đúng' : 'Đăng ký thất bại');

        showError(isLogin ? 'Đăng nhập thất bại' : 'Đăng ký thất bại', errorMessage, 5000);
      }
    } catch (error) {
      console.error('Submit error:', error);
      showError('Lỗi hệ thống', 'Vui lòng thử lại sau', 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };

    setFormData(newFormData);

    try {
      // Dùng để persist lưu dữ liệu tạm thời khi component bị re-mount
      (window as any).__authFormData__ = newFormData;
    } catch (error) {
      console.warn('Could not persist form data:', error);
    }
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
          backgroundImage: `url('https://res.cloudinary.com/dfvy81evi/image/upload/v1754731663/share_banner_y1xbpv.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 "></div>
        {/* Switcher buttons fixed top right */}
        <div className="absolute top-6 left-8 flex gap-4 z-50">
          <FadeIn delay={0.25}>
            <ThemeSwitcher />
          </FadeIn>
          <FadeIn delay={0.25}>
            <LanguageSwitcher />
          </FadeIn>
        </div>
      </div>

      {/* Form Side - Right */}
      <div className="w-full lg:w-1/2 lg:ml-auto relative z-10 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border transition-all duration-300 hover:shadow-3xl">
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4 transition-colors duration-300">
                  <User className="h-8 w-8 transition-transform duration-200" />
                </div>
              </ScaleIn>
              <h2 className="text-3xl font-bold text-foreground mb-2 transition-all duration-300">
                {isLogin ? t('auth_login') : t('auth_register')}
              </h2>
              <p className="text-muted-foreground transition-colors duration-300">
                {isLogin ? t('auth_welcomeback') : t('auth_createAccount')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <FadeIn>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('auth_firstName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-10 transition-all duration-200 hover:border-secondary/50 focus:border-secondary"
                        placeholder={t('auth_enterFirstName')}
                        required={!isLogin}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </FadeIn>
              )}

              {!isLogin && (
                <FadeIn>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('auth_lastName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        name="lastName" // ✅ ĐÚNG!
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="pl-10 transition-all duration-200 hover:border-secondary/50 focus:border-secondary"
                        placeholder={t('auth_enterLastName')}
                        required={!isLogin}
                        disabled={isLoading}
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
                    className="pl-10 transition-all duration-200 hover:border-secondary/50 focus:border-secondary"
                    placeholder={t('auth_enterEmail')}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth_password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-20" />

                  {/* Password Strength Tooltip - chỉ hiển thị khi đăng ký */}
                  <AnimatePresence>
                    {!isLogin && formData.password && (
                      <PasswordStrengthChecker
                        password={formData.password}
                        className="absolute left-10 top-1/2 transform -translate-y-1/2 z-30"
                      />
                    )}
                  </AnimatePresence>

                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${!isLogin && formData.password ? 'pl-16' : 'pl-10'} pr-12 transition-all duration-200 hover:border-secondary/50 focus:border-secondary`}
                    placeholder={t('auth_enterPassword')}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-colors duration-200 hover:text-secondary z-20"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 transition-transform duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 transition-transform duration-200" />
                    )}
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

              <Button
                type="submit"
                className="w-full transition-all duration-200"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                    <span>{isLogin ? t('auth_loggingIn') : t('auth_registering')}</span>
                  </div>
                ) : (
                  <span>{isLogin ? t('auth_loginButton') : t('auth_registerButton')}</span>
                )}
              </Button>

              {/* Error Message Display */}
              {/* {localError && (
                <FadeIn>
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm font-medium">{localError}</p>
                  </div>
                </FadeIn>
              )} */}
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
              <span className="text-muted-foreground transition-colors duration-300">
                {isLogin ? t('auth_noAccount') : t('auth_hasAccount')}
              </span>
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  // setLocalError(''); // Clear error khi chuyển mode
                }}
                className="p-0 ml-2 h-auto font-semibold transition-colors duration-200 text-accent hover:text-secondary"
                disabled={isLoading}
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
