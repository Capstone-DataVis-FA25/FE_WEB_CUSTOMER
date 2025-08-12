const Routers = {
  // Public routes
  HOME: '/',
  AUTH: '/auth',

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
} as const;

export default Routers;
