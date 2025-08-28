const Routers = {
  // Public routes
  HOME: '/',
  AUTH: '/auth',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ABOUT_US: '/about-us',

  // Profile routes
  PROFILE: '/profile',
  PROFILE_CHANGE_PASSWORD: '/profile/change-password',
  PROFILE_NOTIFICATIONS: '/profile/notifications',
  PROFILE_SETTINGS: '/profile/settings',

  // Demo routes
  TOAST_DEMO: '/demo/toast',
  MODAL_DEMO: '/demo/modal',
  PAGINATION_DEMO: '/demo/pagination',

  // Error routes
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',

  // Verify routes
  VERIFY_EMAIL_SUCCESS: '/verify-email-success',
  SEND_EMAIL_SUCCESS: '/send-email-success',
  VERIFY_EMAIL_ERROR: '/verify-email-error',
  RESEND_EMAIL: '/auth/resend-email',

  // Chart routes
  LINE_CHART: '/chart/line-chart',
  STUDY_CHART: '/chart/study-chart',
} as const;

export default Routers;
