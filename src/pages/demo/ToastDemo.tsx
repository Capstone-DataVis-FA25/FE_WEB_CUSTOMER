import React from 'react';
import { Button } from '@/components/ui/button';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ToastDemoPage: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToastContext();
  const { t } = useTranslation();

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
            🍞 {t('home_toastDemo_title')}
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter' }}>
            Demo các loại toast notification với nhiều tùy chọn khác nhau
          </p>
        </div>

        {/* Basic Toast Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            🎯 Basic Toast Demo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button
              onClick={() => showSuccess(t('toast_success_title'), t('toast_success_description'))}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              ✅ {t('home_toastDemo_success')}
            </Button>

            <Button
              onClick={() => showError(t('toast_error_title'), t('toast_error_description'), 1000)}
              variant="destructive"
            >
              ❌ {t('home_toastDemo_error')}
            </Button>

            <Button
              onClick={() => showWarning(t('toast_warning_title'), t('toast_warning_description'))}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              ⚠️ {t('home_toastDemo_warning')}
            </Button>

            <Button
              onClick={() => showInfo(t('toast_info_title'), t('toast_info_description'))}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              ℹ️ {t('home_toastDemo_info')}
            </Button>
          </div>
        </div>

        {/* Toast with different durations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            ⏱️ Toast với thời gian khác nhau
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button
              onClick={() => showSuccess('Toast nhanh', 'Sẽ tự động đóng sau 1 giây', 1000)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              🏃 Toast 1s
            </Button>

            <Button
              onClick={() => showInfo('Toast trung bình', 'Sẽ tự động đóng sau 3 giây', 3000)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              🚶 Toast 3s
            </Button>

            <Button
              onClick={() => showWarning('Toast chậm', 'Sẽ tự động đóng sau 5 giây', 5000)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              🐌 Toast 5s
            </Button>
          </div>
        </div>

        {/* Multiple Toasts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            📚 Multiple Toasts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button
              onClick={() => {
                showSuccess('Toast 1', 'Đây là toast đầu tiên');
                setTimeout(() => showInfo('Toast 2', 'Đây là toast thứ hai'), 500);
                setTimeout(() => showWarning('Toast 3', 'Đây là toast thứ ba'), 1000);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              🎭 Hiện nhiều toast
            </Button>

            <Button
              onClick={() => {
                for (let i = 1; i <= 5; i++) {
                  setTimeout(() => {
                    showInfo(`Toast ${i}`, `Đây là toast số ${i}`);
                  }, i * 300);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              🎪 Toast liên tiếp
            </Button>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            💻 Cách sử dụng Toast
          </h2>

          <div className="bg-gray-50 rounded-lg p-4">
            <pre
              className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto"
              style={{ fontFamily: 'monospace' }}
            ></pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastDemoPage;
