const Routers = {
  // Public routes
  HOME: '/',
  AUTH: '/auth',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ABOUT_US: '/about-us',

  // Resources routes
  FREQUENT_QUESTIONS: '/resources/frequent-questions',

  // Profile routes
  PROFILE: '/profile',
  PROFILE_CHANGE_PASSWORD: '/profile/change-password',
  PROFILE_NOTIFICATIONS: '/profile/notifications',
  PROFILE_SETTINGS: '/profile/settings',

  // Chart Gallery
  CHART_GALLERY: '/chart-gallery',

  // For state-based navigation, use location.state.datasetId (recommended)
  DATASET_DETAIL: '/datasets/detail', // state-based route, do not use slug param
  CREATE_DATASET: '/datasets/create',
  CREATE_DATASET_UPLOAD: '/datasets/create/upload',
  CREATE_DATASET_TEXT: '/datasets/create/text',
  CREATE_DATASET_SAMPLE: '/datasets/create/sample',
  CREATE_DATASET_VIEW: '/datasets/create/view',

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
  PIE_CHART_DEMO: '/chart/pie-chart',
  PIE_CHART_EDITOR_DEMO: '/demo/pie-chart-editor',

  //Workspace routes
  WORKSPACE: '/workspace',
  WORKSPACE_DATASETS: '/workspace/datasets',
  WORKSPACE_CHARTS: '/workspace/charts',
  CHART_CREATOR: '/chart-creator',
  CHART_EDITOR: '/chart-editor',

  // Privacy and Terms
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
} as const;

export default Routers;
