import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Save, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

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
        title: 'Thành công',
        options: { type: 'success', message: 'Cài đặt thông báo đã được lưu' },
      });
    } catch (_error) {
      showToast({
        title: 'Lỗi',
        options: { type: 'error', message: 'Có lỗi xảy ra khi lưu cài đặt' },
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
      title: 'Thông báo Email',
      description: 'Nhận thông báo qua email',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      settings: [
        { key: 'news', label: 'Tin tức và cập nhật', description: 'Nhận tin tức mới nhất' },
        { key: 'updates', label: 'Cập nhật sản phẩm', description: 'Thông báo về tính năng mới' },
        { key: 'marketing', label: 'Email quảng cáo', description: 'Nhận ưu đãi và khuyến mãi' },
        { key: 'security', label: 'Bảo mật', description: 'Thông báo đăng nhập và bảo mật' },
      ],
    },
    {
      id: 'push',
      title: 'Thông báo đẩy',
      description: 'Nhận thông báo trên thiết bị',
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      settings: [
        { key: 'orders', label: 'Đơn hàng', description: 'Cập nhật trạng thái đơn hàng' },
        { key: 'promotions', label: 'Khuyến mãi', description: 'Thông báo ưu đãi đặc biệt' },
        { key: 'reminders', label: 'Nhắc nhở', description: 'Nhắc nhở về các hoạt động' },
        { key: 'messages', label: 'Tin nhắn', description: 'Tin nhắn từ hỗ trợ khách hàng' },
      ],
    },
    {
      id: 'sms',
      title: 'Thông báo SMS',
      description: 'Nhận tin nhắn SMS',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      settings: [
        { key: 'orders', label: 'Đơn hàng', description: 'SMS xác nhận đơn hàng' },
        { key: 'security', label: 'Bảo mật', description: 'Mã OTP và xác thực' },
        { key: 'marketing', label: 'Quảng cáo', description: 'SMS khuyến mãi' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cài đặt thông báo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Quản lý cách bạn nhận thông báo từ ứng dụng
          </p>
        </div>

        <div className="space-y-6">
          {/* Sound Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-orange-600" />
                Cài đặt âm thanh
              </CardTitle>
              <CardDescription>
                Điều chỉnh âm thanh thông báo
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
                      Âm thanh thông báo
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Phát âm thanh khi có thông báo mới
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
                    Âm lượng: {settings.sound.volume}%
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
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu cài đặt
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
                    Lưu ý về quyền riêng tư
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Bạn có thể thay đổi cài đặt 
                    thông báo bất kỳ lúc nào. Thông tin liên hệ của bạn sẽ không được chia sẻ với 
                    bên thứ ba mà không có sự đồng ý của bạn.
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
