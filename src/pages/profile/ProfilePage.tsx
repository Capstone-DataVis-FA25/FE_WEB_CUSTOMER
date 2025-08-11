import React, { useState } from 'react';
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
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from '@/components/language-switcher/LanguageSwitcher';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { useNavigation } from '@/hooks/useNavigation';
import { useToast } from '@/hooks/useToast';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  joinDate: string;
  verified: boolean;
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { goTo } = useNavigation();
  const { showToast } = useToast();

  // Mock user data - in real app, this would come from auth state or API
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    email: 'nguyenvana@example.com',
    avatar: '',
    joinDate: '2023-01-01',
    verified: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(userProfile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(userProfile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(userProfile);
  };

  const handleSave = () => {
    // In real app, this would call an API to update user profile
    setUserProfile(editForm);
    setIsEditing(false);
    showToast({
      title: t('profile_updateSuccess'),
      options: { type: 'success', message: t('profile_updateSuccessDesc') },
    });
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
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
      action: () => goTo('/profile/change-password'),
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
      action: () => goTo('/profile/notifications'),
    },
    {
      id: 'general-settings',
      title: t('profile_generalSettings'),
      description: t('profile_generalSettingsDesc'),
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      action: () => goTo('/profile/settings'),
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
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {t('profile_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Card - Main Content */}
          <div className="lg:col-span-8">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 border-4 border-white/30">
                      <AvatarImage src={userProfile.avatar} alt="Avatar" />
                      <AvatarFallback className="text-xl font-semibold bg-white/20 text-white">
                        {userProfile.firstName.charAt(0)}
                        {userProfile.lastName.charAt(0)}
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
                  {!isEditing ? (
                    <Button 
                      onClick={handleEdit} 
                      variant="outline" 
                      size="sm"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {t('profile_edit')}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSave} 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white border-0"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {t('profile_save')}
                      </Button>
                      <Button 
                        onClick={handleCancel} 
                        variant="outline" 
                        size="sm"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t('profile_cancel')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {/* User Info Display */}
                <div className="mb-8 flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-blue-500/20">
                      <AvatarImage src={userProfile.avatar} alt="Avatar" />
                      <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {userProfile.firstName.charAt(0)}
                        {userProfile.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {userProfile.firstName} {userProfile.lastName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">{userProfile.email}</p>
                    {userProfile.verified && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {t('profile_verified')}
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
                      <Input
                        value={editForm.firstName}
                        onChange={e => handleInputChange('firstName', e.target.value)}
                        placeholder={t('profile_enterFirstName')}
                        className="border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-lg"
                      />
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
                      <Input
                        value={editForm.lastName}
                        onChange={e => handleInputChange('lastName', e.target.value)}
                        placeholder={t('profile_enterLastName')}
                        className="border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-lg"
                      />
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

          {/* Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6">
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
                      {new Date(userProfile.joinDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {t('profile_status')}
                    </span>
                    <Badge 
                      variant={userProfile.verified ? 'default' : 'secondary'}
                      className={userProfile.verified ? 'bg-green-500 text-white' : ''}
                    >
                      {userProfile.verified ? t('profile_verified') : t('profile_notVerified')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    className={`p-4 rounded-xl border-2 ${item.bgColor} ${item.borderColor} hover:shadow-lg transition-all duration-300 group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
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
                            className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-700/50"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
