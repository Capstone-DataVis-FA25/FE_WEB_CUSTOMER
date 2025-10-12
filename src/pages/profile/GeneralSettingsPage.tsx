import React, { useState } from 'react';
import { Monitor, Shield, Database, Download, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import LanguageSwitcher from '@/components/language-switcher/LanguageSwitcher';
import { useToast } from '@/hooks/useToast';
import { useModalConfirm } from '@/hooks/useModal';
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
  const { user, deleteUser, logout } = useAuth();
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
  // const [canDelete, setCanDelete] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState('');

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
        title: t('general_save_success'),
        options: { type: 'success', message: t('general_save_success_message') },
      });
    } catch (_error) {
      showToast({
        title: t('general_save_error'),
        options: { type: 'error', message: t('general_save_error_message') },
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
        title: t('general_export_success'),
        options: { type: 'success', message: t('general_export_success_message') },
      });
    } catch (_error) {
      showToast({
        title: t('general_export_error'),
        options: { type: 'error', message: t('general_export_error_message') },
      });
    }
  };

  const handleDeleteAccount = () => {
    modalConfirm.openConfirm(() => {});
    // Delay enabling delete for safety (not used currently)
    // setTimeout(() => setCanDelete(true), 10000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteEmail) {
      setDeleteError(t('general_delete_confirm_error'));
      return;
    }
    if (user?.id) {
      const result = await deleteUser(user.id, deleteEmail);
      console.log(['Delete result:', result]);
      if (result.type && result.type.endsWith('/fulfilled')) {
        showSuccess(t('general_delete_success'), t('general_delete_success_message'));
        modalConfirm.close();
        logout();
        goToHome();
      } else {
        setDeleteError(t('general_delete_error'));
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
            {t('general_settings_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{t('general_settings_description')}</p>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-blue-600" />
                {t('general_appearance_title')}
              </CardTitle>
              <CardDescription>{t('general_appearance_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('general_display_mode')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('general_display_mode_description')}
                  </p>
                </div>
                <ThemeSwitcher />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('general_language')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('general_language_description')}
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                {t('general_privacy_data_title')}
              </CardTitle>
              <CardDescription>{t('general_privacy_data_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('general_auto_save')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('general_auto_save_description')}
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.autoSave}
                  onChange={() => handleSettingChange('autoSave', !settings.autoSave)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('general_data_collection')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('general_data_collection_description')}
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.dataCollection}
                  onChange={() => handleSettingChange('dataCollection', !settings.dataCollection)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('general_crash_reports')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('general_crash_reports_description')}
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.crashReports}
                  onChange={() => handleSettingChange('crashReports', !settings.crashReports)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('general_analytics')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('general_analytics_description')}
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
                {t('general_data_management_title')}
              </CardTitle>
              <CardDescription>{t('general_data_management_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('general_export_data')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('general_export_data_description')}
                    </p>
                  </div>
                </div>
                <Button onClick={handleExportData} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('general_export_data')}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      {t('general_delete_account')}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-200">
                      {t('general_delete_account_description')}
                    </p>
                  </div>
                </div>
                <Button onClick={handleDeleteAccount} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('general_delete_account')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button onClick={handleSave} disabled={isLoading} size="lg" className="px-8">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('general_saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('general_save_settings')}
                </>
              )}
            </Button>
          </div>
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
        onInputChange={e => {
          setDeleteEmail(e.target.value);
          setDeleteError('');
        }}
        userEmail={user?.email}
      />
    </div>
  );
};

export default GeneralSettingsPage;
