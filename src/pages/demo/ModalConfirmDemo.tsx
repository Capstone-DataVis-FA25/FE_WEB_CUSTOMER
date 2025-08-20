import React from 'react';
import { Button } from '@/components/ui/button';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useModalConfirm } from '@/hooks/useModal';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModalConfirmDemoPage: React.FC = () => {
  const { showSuccess, showInfo } = useToastContext();
  const modalConfirm = useModalConfirm();
  const { t } = useTranslation();

  const handleDeleteAccount = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    showSuccess(t('home_actions_accountDeleted'));
  };

  const handleResetData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    showInfo(t('home_actions_dataReset'));
  };

  const handleSaveChanges = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    showSuccess(t('home_actions_changesSaved'));
  };

  const handleQuickAction = async () => {
    // Simulate quick action
    await new Promise(resolve => setTimeout(resolve, 500));
    showInfo(t('toast_quick_action'));
  };

  const handleSlowAction = async () => {
    // Simulate slow action
    await new Promise(resolve => setTimeout(resolve, 3000));
    showSuccess(t('toast_slow_action'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('go_back')}</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto' }}>
            🎯 {t('home_modalDemo_title')}
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter' }}>
            {t('demo_description_modal')}
          </p>
        </div>

        {/* Basic Modal Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            {t('demo_basic_modal_types')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Danger Modal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-red-600">
                ⚠️ {t('home_modalDemo_danger_title')}
              </h3>
              <p className="text-gray-600 text-sm">{t('home_modalDemo_danger_description')}</p>
              <Button
                onClick={() => modalConfirm.openConfirm(handleDeleteAccount)}
                variant="destructive"
                className="w-full"
              >
                {t('home_modalDemo_danger_action')}
              </Button>
            </div>

            {/* Warning Modal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-yellow-600">
                ⚠️ {t('home_modalDemo_warning_title')}
              </h3>
              <p className="text-gray-600 text-sm">{t('home_modalDemo_warning_description')}</p>
              <Button
                onClick={() => modalConfirm.openConfirm(handleResetData)}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                {t('home_modalDemo_warning_action')}
              </Button>
            </div>

            {/* Info Modal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-blue-600">
                ℹ️ {t('home_modalDemo_info_title')}
              </h3>
              <p className="text-gray-600 text-sm">{t('home_modalDemo_info_description')}</p>
              <Button
                onClick={() =>
                  modalConfirm.openConfirm(() => {
                    showInfo(t('home_modalDemo_info_result'));
                  })
                }
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {t('home_modalDemo_info_action')}
              </Button>
            </div>

            {/* Success Modal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-600">
                ✅ {t('home_modalDemo_success_title')}
              </h3>
              <p className="text-gray-600 text-sm">{t('home_modalDemo_success_description')}</p>
              <Button
                onClick={() => modalConfirm.openConfirm(handleSaveChanges)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {t('home_modalDemo_success_action')}
              </Button>
            </div>
          </div>
        </div>

        {/* Different Loading Times */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            {t('demo_modal_loading_times')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-600">{t('demo_fast_action')}</h3>
              <p className="text-gray-600 text-sm">{t('demo_fast_action_description')}</p>
              <Button
                onClick={() => modalConfirm.openConfirm(handleQuickAction)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {t('demo_execute_fast')}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-blue-600">{t('demo_medium_action')}</h3>
              <p className="text-gray-600 text-sm">{t('demo_medium_action_description')}</p>
              <Button
                onClick={() => modalConfirm.openConfirm(handleResetData)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {t('demo_execute_medium')}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-purple-600">{t('demo_slow_action')}</h3>
              <p className="text-gray-600 text-sm">{t('demo_slow_action_description')}</p>
              <Button
                onClick={() => modalConfirm.openConfirm(handleSlowAction)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {t('demo_execute_slow')}
              </Button>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            {t('demo_usage_modal')}
          </h2>

          <div className="bg-gray-50 rounded-lg p-4">
            <pre
              className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto"
              style={{ fontFamily: 'monospace' }}
            ></pre>
          </div>
        </div>

        {/* Modal Confirm Component */}
        <ModalConfirm
          isOpen={modalConfirm.isOpen}
          onClose={modalConfirm.close}
          onConfirm={modalConfirm.confirm}
          loading={modalConfirm.isLoading}
          type="danger"
          title={t('modal_confirm_title')}
          message={t('modal_confirm_message')}
        />
      </div>
    </div>
  );
};

export default ModalConfirmDemoPage;
