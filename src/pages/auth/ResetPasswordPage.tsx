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

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError('Token reset password không hợp lệ hoặc đã hết hạn');
    }
  }, [token]);

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
      showError('Token reset password không hợp lệ');
      return false;
    }

    if (formData.password.length < 8) {
      showError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Mật khẩu xác nhận không khớp');
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
      showSuccess('Mật khẩu đã được reset thành công');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        goTo('/auth');
      }, 2000);
    } catch (error: unknown) {
      showError(`Có lỗi xảy ra. Token có thể đã hết hạn.${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Token error screen
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Token không hợp lệ</CardTitle>
              <CardDescription>{tokenError}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/auth/forgot-password">Yêu cầu reset lại</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/auth/signin">Đăng nhập</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Reset mật khẩu thành công</CardTitle>
              <CardDescription>Mật khẩu của bạn đã được cập nhật thành công</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Bạn sẽ được chuyển hướng đến trang đăng nhập trong 3 giây...
              </p>
              <Button asChild className="w-full">
                <Link to="/auth/signin">Đăng nhập ngay</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Tạo mật khẩu mới</CardTitle>
            <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.password ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPasswords.password ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Độ mạnh mật khẩu:
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength.color === 'red'
                            ? 'text-red-600'
                            : passwordStrength.color === 'yellow'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }`}
                      >
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="flex items-center mt-1">
                    {formData.password === formData.confirmPassword ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Mật khẩu khớp</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Mật khẩu không khớp</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Cập nhật mật khẩu
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/auth/signin"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
