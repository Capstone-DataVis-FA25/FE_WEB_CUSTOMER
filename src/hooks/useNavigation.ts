import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import Routers from '@/router/routers';

export interface NavigationOptions {
  replace?: boolean;
  state?: Record<string, unknown>;
}

export const useNavigation = () => {
  const navigate = useNavigate();

  // Navigation functions
  const goToHome = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.HOME, options);
    },
    [navigate]
  );

  const goToVerifyEmailError = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.VERIFY_EMAIL_ERROR, options);
    },
    [navigate]
  );

  const goToSendEmailVerify = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.SEND_EMAIL_SUCCESS, options);
    },
    [navigate]
  );

  const goToVerifyEmailSuccess = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.VERIFY_EMAIL_SUCCESS, options);
    },
    [navigate]
  );

  const goToResendEmail = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.RESEND_EMAIL, options);
    },
    [navigate]
  );

  const goToAuth = useCallback(
    (mode: 'login' | 'register' = 'login', options?: NavigationOptions) => {
      navigate(`${Routers.AUTH}?mode=${mode}`, options);
    },
    [navigate]
  );

  // Profile navigation
  const goToProfile = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.PROFILE, options);
    },
    [navigate]
  );

  const goToForgotPassword = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.FORGOT_PASSWORD, options);
    },
    [navigate]
  );

  const goToAboutUs = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.ABOUT_US, options);
    },
    [navigate]
  );

  const goToBarChart = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.BAR_CHART_DEMO, options);
    },
    [navigate]
  );

  const goToBarChartEditor = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.BAR_CHART_EDITOR_DEMO, options);
    },
    [navigate]
  );

  const goToChangePassword = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.PROFILE_CHANGE_PASSWORD, options);
    },
    [navigate]
  );

  const goToNotificationSettings = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.PROFILE_NOTIFICATIONS, options);
    },
    [navigate]
  );

  const goToGeneralSettings = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.PROFILE_SETTINGS, options);
    },
    [navigate]
  );

  // Error page navigation
  const goToNotFound = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.NOT_FOUND, options);
    },
    [navigate]
  );

  const goToForbidden = useCallback(
    (options?: NavigationOptions) => {
      navigate(Routers.FORBIDDEN, options);
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  // Generic navigation
  const goTo = useCallback(
    (path: string, options?: NavigationOptions) => {
      navigate(path, options);
    },
    [navigate]
  );

  return {
    // Public routes
    goToHome,
    goToAboutUs,
    goToAuth,
    goToForgotPassword,
    goToBarChart,
    goToBarChartEditor,

    // Profile routes
    goToProfile,
    goToChangePassword,
    goToNotificationSettings,
    goToGeneralSettings,

    // Error routes
    goToNotFound,
    goToForbidden,
    goToVerifyEmailError,

    // Navigation controls
    goBack,
    goForward,
    goTo,

    // Verify
    goToSendEmailVerify,
    goToVerifyEmailSuccess,
    goToResendEmail,
  };
};

export default useNavigation;
