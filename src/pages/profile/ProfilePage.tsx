import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Lock,
  Settings,
  Bell,
  Palette,
  Globe,
  Edit3,
  Save,
  X,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from '@/components/language-switcher/LanguageSwitcher';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { useNavigation } from '@/hooks/useNavigation';
import { updateProfileThunk, viewProfileThunk } from '@/features/auth/authThunk';
import { useAuth } from '@/features/auth/useAuth';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModal } from '@/hooks/useModal';
import { useAppDispatch } from '@/store/hooks';
import { useToastContext } from '@/components/providers/ToastProvider';
import { AvatarImage } from '@radix-ui/react-avatar';
import Routers from '@/router/routers';
import { FadeIn, SlideInRight } from '@/theme/animation';
import { NAME_REGEX } from '@/utils/validation';
import ResourceUsageCard from '@/components/subscription/ResourceUsageCard';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  isActive: boolean;
  email: string;
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { goTo } = useNavigation();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const modalConfirm = useModal();
  const { showSuccess, showError, showWarning } = useToastContext();
  const [focusFieldErrorFirstName, setFocusFieldErrorFirstName] = useState(false);
  const [focusFieldErrorLastName, setFocusFieldErrorLastName] = useState(false);
  const [errorMessageFirstName, setErrorMessageFirstName] = useState('');
  const [errorMessageLastName, setErrorMessageLastName] = useState('');

  // Modal state for different actions
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
  });

  // Load user profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        await dispatch(viewProfileThunk());
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    // Only call API if we have authentication token
    if (user?.id) {
      loadProfile();
    }
  }, [dispatch, user?.id]);

  // Mock user data - in real app, this would come from auth state or API
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    createdAt: user?.createdAt || new Date().toISOString(),
    isActive: user?.isActive || true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(userProfile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(userProfile);
    // Clear previous validation errors when entering edit mode
    setFocusFieldErrorFirstName(false);
    setFocusFieldErrorLastName(false);
    setErrorMessageFirstName('');
    setErrorMessageLastName('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(userProfile);
    // Clear validation errors when cancelling
    setFocusFieldErrorFirstName(false);
    setFocusFieldErrorLastName(false);
    setErrorMessageFirstName('');
    setErrorMessageLastName('');
  };

  const handleSave = async () => {
    try {
      // Call the thunk with dispatch
      const result = await dispatch(
        updateProfileThunk({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
        })
      );

      if (updateProfileThunk.fulfilled.match(result)) {
        setUserProfile(editForm);
        setIsEditing(false);
        showSuccess(t('profile_updateSuccess'), t('profile_updateSuccessDesc'));
      } else {
        showError(t('profile_updateError'), t('profile_updateErrorDesc'));
      }
    } catch {
      showError(t('profile_updateError'), t('profile_updateErrorDesc'));
    }
  };

  const validateField = (field: keyof UserProfile, value: string): boolean => {
    if (field === 'firstName') {
      if (value.trim() === '') {
        setFocusFieldErrorFirstName(true);
        setErrorMessageFirstName(t('profile_firstNameRequired', 'First name is required'));
        return false;
      }
      if (!NAME_REGEX.test(value)) {
        setFocusFieldErrorFirstName(true);
        setErrorMessageFirstName(
          t('profile_invalidFirstNameError', 'First name contains invalid characters')
        );
        return false;
      }
      setFocusFieldErrorFirstName(false);
      setErrorMessageFirstName('');
      return true;
    }

    if (field === 'lastName') {
      if (value.trim() === '') {
        setFocusFieldErrorLastName(true);
        setErrorMessageLastName(t('profile_lastNameRequired', 'Last name is required'));
        return false;
      }
      if (!NAME_REGEX.test(value)) {
        setFocusFieldErrorLastName(true);
        setErrorMessageLastName(
          t('profile_invalidLastNameError', 'Last name contains invalid characters')
        );
        return false;
      }
      setFocusFieldErrorLastName(false);
      setErrorMessageLastName('');
      return true;
    }

    return true;
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));

    // Validate immediately on change
    validateField(field, value);
  };

  // Validate form before showing modal
  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setFocusFieldErrorFirstName(false);
    setFocusFieldErrorLastName(false);
    setErrorMessageFirstName('');
    setErrorMessageLastName('');

    // Check if firstName is empty
    if (editForm.firstName.trim() === '') {
      setFocusFieldErrorFirstName(true);
      setErrorMessageFirstName(t('profile_firstNameRequired', 'First name is required'));
      isValid = false;
    }
    // Check if firstName has valid format
    else if (!NAME_REGEX.test(editForm.firstName)) {
      setFocusFieldErrorFirstName(true);
      setErrorMessageFirstName(
        t('profile_invalidFirstNameError', 'First name contains invalid characters')
      );
      isValid = false;
    }

    // Check if lastName is empty
    if (editForm.lastName.trim() === '') {
      setFocusFieldErrorLastName(true);
      setErrorMessageLastName(t('profile_lastNameRequired', 'Last name is required'));
      isValid = false;
    }
    // Check if lastName has valid format
    else if (!NAME_REGEX.test(editForm.lastName)) {
      setFocusFieldErrorLastName(true);
      setErrorMessageLastName(
        t('profile_invalidLastNameError', 'Last name contains invalid characters')
      );
      isValid = false;
    }

    return isValid;
  };

  // Check if there are any changes
  const hasChanges = (): boolean => {
    return (
      editForm.firstName !== userProfile.firstName || editForm.lastName !== userProfile.lastName
    );
  };

  // Returns true if there are validation errors currently shown
  const hasValidationErrors = (): boolean => {
    return Boolean(
      focusFieldErrorFirstName ||
      focusFieldErrorLastName ||
      errorMessageFirstName ||
      errorMessageLastName
    );
  };

  // Modal action handlers
  const handleSaveWithConfirm = () => {
    // First validate the form
    if (!validateForm()) {
      // Validation failed, errors are already shown
      return;
    }

    // Check if there are actual changes
    if (!hasChanges()) {
      showWarning(t('profile_noChangesError', 'No changes to save'));
      return;
    }

    // Show confirmation modal only if validation passes
    setModalConfig({
      title: t('profile_confirmSave'),
      message: t('profile_confirmSaveMessage'),
      confirmText: t('common_save'),
      cancelText: t('common_cancel'),
      onConfirm: handleSave,
    });
    modalConfirm.open();
  };

  const handleCancelWithConfirm = () => {
    setModalConfig({
      title: t('profile_confirmCancel'),
      message: t('profile_confirmCancelMessage'),
      confirmText: t('common_confirm'),
      cancelText: t('common_cancel'),
      onConfirm: handleCancel,
    });
    modalConfirm.open();
  };

  const navigationItems = [
    {
      id: 'change-password',
      title: t('profile_changePassword'),
      description: t('profile_changePasswordDesc'),
      icon: Lock,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      action: () => goTo(Routers.PROFILE_CHANGE_PASSWORD),
    },
    {
      id: 'theme-settings',
      title: t('profile_themeSettings'),
      description: t('profile_themeSettingsDesc'),
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      component: <ThemeSwitcher />,
    },
    {
      id: 'language-settings',
      title: t('profile_languageSettings'),
      description: t('profile_languageSettingsDesc'),
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      component: <LanguageSwitcher />,
    },
    {
      id: 'notification-settings',
      title: t('profile_notificationSettings'),
      description: t('profile_notificationSettingsDesc'),
      icon: Bell,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      action: () => goTo(Routers.PROFILE_NOTIFICATIONS),
    },
    {
      id: 'general-settings',
      title: t('profile_generalSettings'),
      description: t('profile_generalSettingsDesc'),
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      action: () => goTo(Routers.PROFILE_SETTINGS),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('profile_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">{t('profile_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <FadeIn className="lg:col-span-8">
            {/* Profile Card - Main Content */}
            <div>
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 items-center w-full">
                      <Avatar className="w-16 h-16 ring-4 ring-blue-500/20">
                        <AvatarImage src={user?.avatar} alt={user?.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold ">
                          {user?.firstName?.charAt(0)}
                          {user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl text-white mb-1">
                          {t('profile_personalInfo')}
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                          {t('profile_personalInfoDesc')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      {!isEditing ? (
                        <Button
                          onClick={handleEdit}
                          variant="outline"
                          size="sm"
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          {t('profile_edit')}
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleSaveWithConfirm}
                            size="sm"
                            disabled={!hasChanges() || hasValidationErrors()}
                            className="bg-green-500 hover:bg-green-600 text-white border-0 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {t('profile_save')}
                          </Button>
                          <Button
                            onClick={handleCancelWithConfirm}
                            variant="outline"
                            size="sm"
                            className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {t('profile_cancel')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  {/* User Info Display */}
                  <div className="mb-8 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-blue-500/20">
                        <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-500">
                          {userProfile.firstName.charAt(0)}
                          {userProfile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {userProfile.firstName} {userProfile.lastName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{userProfile.email}</p>
                      {userProfile.isActive && (
                        <Badge
                          variant={userProfile.isActive ? 'default' : 'secondary'}
                          className={userProfile.isActive ? 'bg-green-500 text-white' : ''}
                        >
                          {userProfile.isActive ? t('profile_active') : t('profile_inactive')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Personal Information Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        {t('profile_firstName')}
                      </label>
                      {isEditing ? (
                        <div>
                          <Input
                            value={editForm.firstName}
                            onChange={e => handleInputChange('firstName', e.target.value)}
                            placeholder={t('profile_enterFirstName')}
                            className={`border-2 dark:border-gray-700 focus:border-blue-500 rounded-lg ${
                              focusFieldErrorFirstName
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-200'
                            }`}
                          />
                          {focusFieldErrorFirstName && errorMessageFirstName && (
                            <p className="text-red-500 text-xs mt-1">{errorMessageFirstName}</p>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {userProfile.firstName}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        {t('profile_lastName')}
                      </label>
                      {isEditing ? (
                        <div>
                          <Input
                            value={editForm.lastName}
                            onChange={e => handleInputChange('lastName', e.target.value)}
                            placeholder={t('profile_enterLastName')}
                            className={`border-2 dark:border-gray-700 focus:border-blue-500 rounded-lg ${
                              focusFieldErrorLastName
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-200'
                            }`}
                          />
                          {focusFieldErrorLastName && errorMessageLastName && (
                            <p className="text-red-500 text-xs mt-1">{errorMessageLastName}</p>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {userProfile.lastName}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-500" />
                        {t('profile_email')}
                      </label>
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          {userProfile.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {t('profile_emailUneditable')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>

          {/* Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <SlideInRight>
              {/* Account Stats */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    {t('profile_accountStats')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {t('profile_joinDate')}
                      </span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {new Date(userProfile.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {t('profile_status')}
                      </span>
                      <Badge
                        variant={userProfile.isActive ? 'default' : 'secondary'}
                        className={userProfile.isActive ? 'bg-green-500 text-white' : ''}
                      >
                        {userProfile.isActive ? t('profile_active') : t('profile_inactive')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideInRight>

            <SlideInRight delay={0.1}>
              {/* Resource Usage Card */}
              <ResourceUsageCard className="shadow-lg border-0" />
            </SlideInRight>

            <SlideInRight delay={0.2}>
              {/* Quick Settings */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-500" />
                    {t('profile_quickSettings')}
                  </CardTitle>
                  <CardDescription>{t('profile_quickSettingsDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {navigationItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border-2 ${item.bgColor} ${item.borderColor} hover:shadow-lg transition-all duration-300 group ${item.id === 'change-password' && user?.isSocialAccount ? 'opacity-25' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div className="me-1 Platform">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-100">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div>
                          {item.component ? (
                            item.component
                          ) : (
                            <Button
                              onClick={item.action}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:cursor-pointer disabled:cursor-not-allowed"
                              disabled={user?.isSocialAccount}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </SlideInRight>
          </div>
        </div>
      </div>

      <ModalConfirm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={() => {
          modalConfig.onConfirm();
          modalConfirm.close();
        }}
        type="warning"
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />
    </div>
  );
};

export default ProfilePage;
