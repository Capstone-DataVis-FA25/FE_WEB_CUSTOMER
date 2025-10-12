import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { PageTransition, LoadingSpinner } from '../../theme/animation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/useAuth';

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isFullScreen = location.pathname.includes('/chart-editor');

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleRegister = () => {
    navigate('/auth');
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center space-y-4">
          <LoadingSpinner size={48} className="border-primary/30 border-t-primary" />
          <p className="text-gray-600 font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col min-w-0 bg-gray-50">
      {/* Header */}
      <Header
        isAuthenticated={isAuthenticated}
        user={user || undefined}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        notificationCount={0}
      />

      {/* Main Content */}
      <main className="flex-1">
        <PageTransition>
          {/* Use Outlet for React Router or children prop */}
          {children ? children : <Outlet />}
        </PageTransition>
      </main>

      {/* Footer */}
      {!isFullScreen && <Footer />}
    </div>
  );
};

export default CustomerLayout;
