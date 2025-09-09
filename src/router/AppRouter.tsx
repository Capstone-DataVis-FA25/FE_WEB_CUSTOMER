import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { allRoutes, type RouteConfig } from '@/config/routes';
import CustomerLayout from '../components/layout/CustomerLayout';
import { FadeIn } from '../theme/animation';
import { ErrorBoundaryClass } from '@/components/error/ErrorBoundary';
import { useAuth } from '@/features/auth/useAuth';
import DebugContainer from '@/components/debug/DebugContainer';
import { useTranslation } from 'react-i18next';
// ================================
// LAZY LOAD COMPONENTS
// ================================

const componentMap = {
  HomePage: lazy(() => import('../pages/home/HomePage')),
  NewHomePage: lazy(() => import('../pages/home/NewHomePage')),
  AuthPage: lazy(() => import('../pages/auth/AuthPage')),
  ForgotPasswordPage: lazy(() => import('../pages/auth/ForgotPasswordPage')),
  ResetPasswordPage: lazy(() => import('../pages/auth/ResetPasswordPage')),
  NotFoundPage: lazy(() => import('../pages/not-found/NotFoundPage')),
  ForbiddenPage: lazy(() => import('../pages/forbidden/ForbiddenPage')),
  VerifyEmailSuccessPage: lazy(() => import('../pages/verify/VerifyEmailSuccessPage')),
  SendEmailSuccessPage: lazy(() => import('../pages/verify/SendEmailSuccessPage')),
  ProfilePage: lazy(() => import('../pages/profile/ProfilePage')),
  ChangePasswordPage: lazy(() => import('../pages/profile/ChangePasswordPage')),
  NotificationSettingsPage: lazy(() => import('../pages/profile/NotificationSettingsPage')),
  GeneralSettingsPage: lazy(() => import('../pages/profile/GeneralSettingsPage')),
  AboutPage: lazy(() => import('../pages/about-us/AboutUsPage')),
  VerifyEmailErrorPage: lazy(() => import('../pages/verify/VerifyEmailErrorPage')),
  ResendEmailPage: lazy(() => import('../pages/verify/ResendEmailPage')),
  LineChartPage: lazy(() => import('../components/charts/page.example/LineChartPage')),
  BarChartPage: lazy(() => import('../components/charts/page.example/BarChartPage')),
  AreaChartPage: lazy(() => import('../components/charts/page.example/AreaChartPage')),
  LineChartEditorDemo: lazy(() => import('../components/charts/page.example/LineChartEditorDemo')),
  BarChartEditorDemo: lazy(() => import('../components/charts/page.example/BarChartEditorDemo')),
  AreaChartEditorDemo: lazy(() => import('../components/charts/page.example/AreaChartEditorDemo')),
  CreateDatasetPage: lazy(() => import('../pages/dataset/CreateDatasetPage')),
  DatasetListPage: lazy(() => import('../pages/dataset/DatasetListPage')),
  DatasetDetailPage: lazy(() => import('../pages/dataset/DatasetDetailPage')),
  EditDatasetPage: lazy(() => import('../pages/dataset/EditDatasetPage')),
};

// ================================
// COMPONENTS
// ================================

const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
        <span className="text-foreground text-lg font-medium">{t('loading')}</span>
      </div>
    </div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  route: RouteConfig;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, route }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Kiểm tra nếu route được bảo vệ nhưng user chưa đăng nhập
  if (route.isProtected && !isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: route.path }} />;
  }

  // Kiểm tra quyền truy cập dựa trên role
  if (user && route.roles) {
    const userRole = user.role || 'GUEST';
    if (!route.roles.includes(userRole as 'ADMIN' | 'USER' | 'GUEST')) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};

// Layout wrapper component
const LayoutWrapper: React.FC<{
  route: RouteConfig;
  children: React.ReactNode;
}> = ({ route, children }) => {
  switch (route.layout) {
    case 'USER':
      return (
        <CustomerLayout>
          <FadeIn>{children}</FadeIn>
        </CustomerLayout>
      );
    case 'AUTH':
    case 'NONE':
    default:
      return <FadeIn>{children}</FadeIn>;
  }
};

// Route renderer component
const RouteRenderer: React.FC<{ route: RouteConfig }> = ({ route }) => {
  const Component = componentMap[route.component as keyof typeof componentMap];

  if (!Component) {
    console.error(`Component ${route.component} not found in componentMap`);
    return <Navigate to="/404" replace />;
  }

  return (
    <ProtectedRoute route={route}>
      <LayoutWrapper route={route}>
        <Suspense fallback={<LoadingSpinner />}>
          <Component />
        </Suspense>
      </LayoutWrapper>
    </ProtectedRoute>
  );
};

// ================================
// MAIN ROUTER
// ================================

const AppRouter: React.FC = () => {
  return (
    <ErrorBoundaryClass>
      <BrowserRouter>
        <Routes>
          {/* Render all routes dynamically */}
          {allRoutes.map(route => (
            <Route key={route.name} path={route.path} element={<RouteRenderer route={route} />} />
          ))}

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <DebugContainer />
      </BrowserRouter>
    </ErrorBoundaryClass>
  );
};

export default AppRouter;
