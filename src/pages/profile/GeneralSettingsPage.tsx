import React, { useState } from 'react';
import { 
  Monitor, 
  Clock, 
  Shield, 
  Database,
  Download,
  Trash2,
  Save,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher/LanguageSwitcher';
import { useToast } from '@/hooks/useToast';
import { useModalConfirm } from '@/hooks/useModal';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useAuth } from '@/features/auth/useAuth';
import useNavigation from '@/hooks/useNavigation';
import { ModalConfirmForm } from '@/components/ui/modal-confirm-form';
import { useTranslation } from 'react-i18next';

interface GeneralSettings {
  timezone: string;
  dateFormat: string;
  autoSave: boolean;
  dataCollection: boolean;
  crashReports: boolean;
  analytics: boolean;
}

const GeneralSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const modalConfirm = useModalConfirm();
  const { showSuccess } = useToastContext();
  const { user, deleteUser, deleteUserStatus, deleteUserError, logout } = useAuth();
  const { goToHome } = useNavigation();
  const { t } = useTranslation();

  const [settings, setSettings] = useState<GeneralSettings>({
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    autoSave: true,
    dataCollection: false,
    crashReports: true,
    analytics: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const timezones = [
    { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (UTC+7)' },
    { value: 'Asia/Tokyo', label: 'Nhật Bản (UTC+9)' },
    { value: 'Asia/Seoul', label: 'Hàn Quốc (UTC+9)' },
    { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
    { value: 'Europe/London', label: 'London (UTC+0)' },
    { value: 'America/New_York', label: 'New York (UTC-5)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' },
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: '2024-12-31' },
    { value: 'DD-MM-YYYY', label: '31-12-2024' },
  ];

  const handleSettingChange = (key: keyof GeneralSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      showToast({
        title: 'Thành công',
        options: { type: 'success', message: 'Cài đặt đã được lưu thành công' },
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

  const handleExportData = async () => {
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a dummy file for download simulation
      const data = {
        profile: 'User profile data...',
        settings: settings,
        exportDate: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        title: 'Xuất dữ liệu thành công',
        options: { type: 'success', message: 'Dữ liệu đã được tải xuống' },
      });
    } catch (_error) {
      showToast({
        title: 'Lỗi',
        options: { type: 'error', message: 'Không thể xuất dữ liệu' },
      });
    }
  };

  const handleDeleteAccount = () => {
    modalConfirm.openConfirm(() => {});
    setTimeout(() => setCanDelete(true), 10000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteEmail) {
      setDeleteError('Vui lòng nhập email để xác nhận xóa tài khoản');
      return;
    }
    if (user?.id) {
      const result = await deleteUser(user.id, deleteEmail);
      console.log(['Delete result:', result]);
      if (result.type && result.type.endsWith('/fulfilled')) {
        showSuccess('Tài khoản đã được xóa', 'Tài khoản và dữ liệu của bạn đã bị xóa vĩnh viễn');
        modalConfirm.close();
        logout();
        goToHome();
      } else {
        setDeleteError('Email không đúng hoặc không thể xóa tài khoản');
      }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cài đặt chung
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tùy chỉnh giao diện và các tùy chọn cài đặt ứng dụng
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-blue-600" />
                Giao diện
              </CardTitle>
              <CardDescription>
                Tùy chỉnh giao diện và ngôn ngữ hiển thị
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Chế độ hiển thị</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Chọn chế độ sáng hoặc tối
                  </p>
                </div>
                <ThemeSwitcher />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Ngôn ngữ</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Thay đổi ngôn ngữ hiển thị
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

          {/* Time and Format Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Thời gian và định dạng
              </CardTitle>
              <CardDescription>
                Cài đặt múi giờ và định dạng hiển thị
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Múi giờ
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Định dạng ngày
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dateFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                Quyền riêng tư và dữ liệu
              </CardTitle>
              <CardDescription>
                Quản lý cài đặt quyền riêng tư và thu thập dữ liệu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Tự động lưu</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tự động lưu các thay đổi
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.autoSave}
                  onChange={() => handleSettingChange('autoSave', !settings.autoSave)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Thu thập dữ liệu</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Cho phép thu thập dữ liệu để cải thiện dịch vụ
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.dataCollection}
                  onChange={() => handleSettingChange('dataCollection', !settings.dataCollection)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Báo cáo lỗi</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Gửi báo cáo lỗi tự động để khắc phục sự cố
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.crashReports}
                  onChange={() => handleSettingChange('crashReports', !settings.crashReports)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Phân tích sử dụng</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Chia sẻ dữ liệu phân tích ẩn danh
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.analytics}
                  onChange={() => handleSettingChange('analytics', !settings.analytics)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-orange-600" />
                Quản lý dữ liệu
              </CardTitle>
              <CardDescription>
                Xuất hoặc xóa dữ liệu cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Xuất dữ liệu
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Tải xuống bản sao dữ liệu cá nhân
                    </p>
                  </div>
                </div>
                <Button onClick={handleExportData} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất dữ liệu
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      Xóa tài khoản
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-200">
                      Xóa vĩnh viễn tài khoản và tất cả dữ liệu
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleDeleteAccount} 
                  variant="destructive" 
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tài khoản
                </Button>
              </div>
            </CardContent>
          </Card>

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

          {/* Info Cards */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Về quyền riêng tư
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Tất cả dữ liệu được mã hóa và bảo mật. Bạn có toàn quyền kiểm soát 
                    thông tin cá nhân và có thể thay đổi cài đặt quyền riêng tư bất kỳ lúc nào.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Lưu ý quan trọng
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Việc xóa tài khoản sẽ không thể hoàn tác. Hãy chắc chắn rằng bạn đã 
                    sao lưu tất cả dữ liệu quan trọng trước khi thực hiện.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal xác nhận xóa tài khoản */}
      <ModalConfirmForm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={handleConfirmDelete}
        loading={modalConfirm.isLoading}
        type="danger"
        title={t('delete_account_title')}
        message={t('delete_account_message')}
        confirmText={t('common_confirm')}
        cancelText={t('common_cancel')}
        inputValue={deleteEmail}
        inputType="email"
        inputPlaceholder={t('common_email_placeholder')}
        inputError={deleteError}
        onInputChange={e => { setDeleteEmail(e.target.value); setDeleteError(''); }}
        userEmail={user?.email}
      />
    </div>
  );
};

export default GeneralSettingsPage;
