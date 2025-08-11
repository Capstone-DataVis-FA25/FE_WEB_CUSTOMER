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
    goToAuth,

    // Profile routes
    goToProfile,
    goToChangePassword,
    goToNotificationSettings,
    goToGeneralSettings,

    // Error routes
    goToNotFound,
    goToForbidden,

    // Navigation controls
    goBack,
    goForward,
    goTo,
  };
};

export default useNavigation;
