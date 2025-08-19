import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Shield, CheckCircle, X, Loader2, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/hooks/useNavigation';
import { useToast } from '@/hooks/useToast';
import { changePasswordThunk } from '@/features/auth/authThunk';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { useTranslation } from 'react-i18next';
import Routers from '@/router/routers';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const { goTo } = useNavigation();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Password strength validation
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

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      showToast({
        title: 'Lỗi',
        options: { type: 'error', message: t('change_password_current_required') },
      });
      return false;
    }

    if (formData.newPassword.length < 8) {
      showToast({
        title: 'Lỗi',
        options: { type: 'error', message: t('change_password_new_required') },
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast({
        title: 'Lỗi',
        options: { type: 'error', message: t('change_password_confirm_mismatch') },
      });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      showToast({
        title: 'Lỗi',
        options: { type: 'error', message: t('change_password_current_mismatch') },
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Gọi API thực để đổi mật khẩu
      await dispatch(
        changePasswordThunk({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        })
      ).unwrap();

      showToast({
        title: 'Thành công',
        options: { type: 'success', message: t('change_password_success') },
      });

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Navigate back to profile after successful change
      setTimeout(() => {
        goTo('/profile');
      }, 1500);
    } catch (error: unknown) {
      showToast({
        title: 'Lỗi',
        options: {
          type: 'error',
          message:
            (error as { message?: string })?.message ||
            t('change_password_current_mismatch'),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const securityTips = [
    t('change_password_security_tip_length'),
    t('change_password_security_tip_lowercase'),
    t('change_password_security_tip_uppercase'),
    t('change_password_security_tip_number'),
    t('change_password_security_tip_special'),
    t('change_password_security_tip_personal'),
    t('change_password_security_tip_reuse'),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('change_password_title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('change_password_description')}
          </p>
        </div>

        <div className="grid grid-cols-1">
          {/* Change Password Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  {t('change_password_title')}
                </CardTitle>
                <CardDescription>
                  {t('change_password_input')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('change_password_current')}
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={e => handleInputChange('currentPassword', e.target.value)}
                        placeholder={t('change_password_current_placeholder')}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('change_password_new')}
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={e => handleInputChange('newPassword', e.target.value)}
                        placeholder={t('change_password_new_placeholder')}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {t('change_password_strength')}
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
                      {t('change_password_confirm')}
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={e => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        {formData.newPassword === formData.confirmPassword ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-xs">{t('change_password_confirm_match')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <X className="w-4 h-4 mr-1" />
                            <span className="text-xs">{t('change_password_confirm_mismatch')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('reset_password_updating')}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          {t('reset_password_update')}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => goTo(Routers.PROFILE)}
                      disabled={isLoading}
                    >
                      {t('common_cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          {/* Security Tips Sidebar */}
          <div className="space-y-6 mt-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="w-5 h-5 mr-2" />
                  {t('profile_security')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
