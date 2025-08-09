import { useAuth } from '@/features/auth/useAuth';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useEffect, useRef } from 'react';

function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showSuccess } = useToastContext();
  const hasShownWelcomeToast = useRef(false);

  // Show welcome toast khi vừa login thành công
  useEffect(() => {
    if (user && !hasShownWelcomeToast.current) {
      const userName = user.firstName || user.email || 'người dùng';
      showSuccess('Đăng nhập thành công', `Chào mừng ${userName} đến với hệ thống!`, 4000);
      hasShownWelcomeToast.current = true;
    }
  }, [user, showSuccess]);

  // Reset welcome toast flag khi logout
  useEffect(() => {
    if (!user) {
      hasShownWelcomeToast.current = false;
    }
  }, [user]);

  console.log('user', user);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto' }}>
            🏠 {t('home_title')}
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter' }}>
            {t('home_subtitle')}
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🐛 Debug Container Demo</h2>
          <div className="space-y-3 text-gray-600">
            <p>Xin chào! Debug container đã được thêm vào ứng dụng.</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="font-semibold text-blue-800">Cách sử dụng Debug Container:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700">
                <li>
                  Tìm container debug ở góc <strong>bottom-right</strong> màn hình
                </li>
                <li>Click vào nó để mở rộng và xem thông tin debug</li>
                <li>
                  Sử dụng phím tắt{' '}
                  <kbd className="bg-gray-200 px-2 py-1 rounded">Ctrl/Cmd + Shift + D</kbd> để
                  bật/tắt
                </li>
                <li>Có 4 tab: Current Route, Available Routes, User Info, và System Info</li>
              </ul>
            </div>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <p className="font-semibold text-green-800">Thông tin hiển thị:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-green-700">
                <li>
                  <strong>Current Tab:</strong> Route hiện tại, layout, permissions, roles
                </li>
                <li>
                  <strong>Routes Tab:</strong> Danh sách tất cả routes có thể truy cập theo role
                </li>
                <li>
                  <strong>User Tab:</strong> Thông tin user hiện tại và trạng thái authentication
                </li>
                <li>
                  <strong>System Tab:</strong> Environment, URL, user agent và thông tin hệ thống
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
