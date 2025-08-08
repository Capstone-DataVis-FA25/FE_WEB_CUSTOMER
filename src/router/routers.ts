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
} as const;

export default Routers;
