import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Save, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

interface NotificationSettings {
  email: {
    news: boolean;
    updates: boolean;
    marketing: boolean;
    security: boolean;
  };
  push: {
    orders: boolean;
    promotions: boolean;
    reminders: boolean;
    messages: boolean;
  };
  sms: {
    orders: boolean;
    security: boolean;
    marketing: boolean;
  };
  sound: {
    enabled: boolean;
    volume: number;
  };
}

const NotificationSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      news: true,
      updates: true,
      marketing: false,
      security: true,
    },
    push: {
      orders: true,
      promotions: false,
      reminders: true,
      messages: true,
    },
    sms: {
      orders: true,
      security: true,
      marketing: false,
    },
    sound: {
      enabled: true,
      volume: 70,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (category: keyof NotificationSettings, setting: string, value?: number) => {
    setSettings(prev => {
      if (category === 'sound' && typeof value === 'number') {
        return {
          ...prev,
          [category]: { ...prev[category], [setting]: value },
        };
      }
      
      const currentValue = (prev[category] as Record<string, boolean>)[setting];
      return {
        ...prev,
        [category]: { ...prev[category], [setting]: !currentValue },
      };
    });
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      showToast({
        title: t('notification_save_success'),
        options: { type: 'success', message: t('notification_save_success_message') },
      });
    } catch (_error) {
      showToast({
        title: t('notification_save_error'),
        options: { type: 'error', message: t('notification_save_error_message') },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean }> = ({
    checked,
    onChange,
    disabled = false,
  }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const notificationCategories = [
    {
      id: 'email',
      title: t('notification_email_title'),
      description: t('notification_email_description'),
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      settings: [
        { key: 'news', label: t('notification_news'), description: t('notification_news_description') },
        { key: 'updates', label: t('notification_product_updates'), description: t('notification_product_updates_description') },
        { key: 'marketing', label: t('notification_marketing_email'), description: t('notification_marketing_email_description') },
        { key: 'security', label: t('notification_security'), description: t('notification_security_description') },
      ],
    },
    {
      id: 'push',
      title: t('notification_push_title'),
      description: t('notification_push_description'),
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      settings: [
        { key: 'orders', label: t('notification_orders'), description: t('notification_orders_description') },
        { key: 'promotions', label: t('notification_promotions'), description: t('notification_promotions_description') },
        { key: 'reminders', label: t('notification_reminders'), description: t('notification_reminders_description') },
        { key: 'messages', label: t('notification_messages'), description: t('notification_messages_description') },
      ],
    },
    {
      id: 'sms',
      title: t('notification_sms_title'),
      description: t('notification_sms_description'),
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      settings: [
        { key: 'orders', label: t('notification_orders_sms'), description: t('notification_orders_sms_description') },
        { key: 'security', label: t('notification_security_sms'), description: t('notification_security_sms_description') },
        { key: 'marketing', label: t('notification_marketing_sms'), description: t('notification_marketing_sms_description') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('notification_settings_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('notification_settings_subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Sound Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-orange-600" />
                {t('notification_sound_title')}
              </CardTitle>
              <CardDescription>
                {t('notification_sound_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {settings.sound.enabled ? (
                    <Volume2 className="w-5 h-5 text-orange-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('notification_sound_enable')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('notification_sound_enable_description')}
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.sound.enabled}
                  onChange={() => handleToggle('sound', 'enabled')}
                />
              </div>

              {settings.sound.enabled && (
                <div className="pl-8 space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('notification_volume')}: {settings.sound.volume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sound.volume}
                    onChange={(e) => handleToggle('sound', 'volume', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Categories */}
          {notificationCategories.map((category) => (
            <Card key={category.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className={`p-2 rounded-lg ${category.bgColor} dark:bg-gray-700 mr-3`}>
                    <category.icon className={`w-5 h-5 ${category.color} dark:text-gray-300`} />
                  </div>
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {setting.description}
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={Boolean((settings[category.id as keyof NotificationSettings] as Record<string, boolean>)[setting.key])}
                      onChange={() => handleToggle(category.id as keyof NotificationSettings, setting.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="lg"
              className="px-8"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('notification_saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('notification_save_settings')}
                </>
              )}
            </Button>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    {t('notification_privacy_title')}
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('notification_privacy_message')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
