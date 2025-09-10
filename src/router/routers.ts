const Routers = {
  // Public routes
  HOME: '/new-home',
  NEW_HOME: '/',
  AUTH: '/auth',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ABOUT_US: '/about-us',

  // Profile routes
  PROFILE: '/profile',
  PROFILE_CHANGE_PASSWORD: '/profile/change-password',
  PROFILE_NOTIFICATIONS: '/profile/notifications',
  PROFILE_SETTINGS: '/profile/settings',

  // Dataset routes
  DATASETS: '/datasets',
  DATASET_DETAIL: '/datasets/:id',
  CREATE_DATASET: '/datasets/create',
  EDIT_DATASET: '/datasets/:id/edit',

  // Error routes
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',

  // Verify routes
  VERIFY_EMAIL_SUCCESS: '/verify-email-success',
  SEND_EMAIL_SUCCESS: '/send-email-success',
  VERIFY_EMAIL_ERROR: '/verify-email-error',
  RESEND_EMAIL: '/auth/resend-email',

  // Chart routes
  LINE_CHART_DEMO: '/chart/line-chart',
  BAR_CHART_DEMO: '/chart/bar-chart',
  LINE_CHART_EDITOR_DEMO: '/demo/line-chart-editor',
  BAR_CHART_EDITOR_DEMO: '/demo/bar-chart-editor',
  AREA_CHART_DEMO: '/chart/area-chart',
  AREA_CHART_EDITOR_DEMO: '/demo/area-chart-editor',

  //Workspace routes
  WORKSPACE: '/workspace',
  CHART_CREATOR: '/chart-creator',
} as const;

export default Routers;
