import Routers from '@/router/routers';

// ================================
// ROLES & PERMISSIONS DEFINITION
// ================================

export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  GUEST: 'GUEST', // Thêm guest role
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  // Public permissions
  VIEW_PUBLIC: 'view_public',

  // Customer permissions
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile',
  DEMO_TEST: 'demo_test',

  // Admin permissions
  ADMIN_ACCESS: 'admin_access',
  MANAGE_USERS: 'manage_users',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

// Role permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [Permission.VIEW_PUBLIC],
  [UserRole.CUSTOMER]: [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
    Permission.DEMO_TEST,
  ],
  [UserRole.ADMIN]: [Permission.VIEW_PUBLIC, Permission.ADMIN_ACCESS, Permission.MANAGE_USERS],
};

// ================================
// ROUTE INTERFACE
// ================================

export interface RouteConfig {
  path: string;
  name: string;
  component: string;
  layout: 'CUSTOMER' | 'ADMIN' | 'AUTH' | 'NONE';
  isProtected?: boolean;
  roles?: UserRole[];
  permissions?: Permission[];
  redirectTo?: string;
  meta?: {
    title?: string;
    description?: string;
    hideFromNav?: boolean;
  };
  children?: RouteConfig[];
}

// ================================
// ROUTE DEFINITIONS
// ================================

// Public routes (không cần đăng nhập)
export const publicRoutes: RouteConfig[] = [
  {
    path: Routers.HOME,
    name: 'home',
    component: 'HomePage',
    layout: 'CUSTOMER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Trang chủ',
      description: 'Trang chủ website',
    },
  },
];

// Auth routes
export const authRoutes: RouteConfig[] = [
  {
    path: Routers.AUTH,
    name: 'auth',
    component: 'AuthPage',
    layout: 'AUTH',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Đăng nhập / Đăng ký',
      description: 'Đăng nhập hoặc tạo tài khoản mới',
      hideFromNav: true,
    },
  },
];

export const sendEmailVerifySuccess: RouteConfig[] = [
  {
    path: Routers.SEND_EMAIL_SUCCESS,
    name: 'sendverify',
    component: 'SendEmailSuccessPage',
    layout: 'NONE',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: '',
      description: '',
      hideFromNav: true,
    },
  },
];

export const verifyEmailSuccess: RouteConfig[] = [
  {
    path: Routers.VERIFY_EMAIL_SUCCESS,
    name: 'verify',
    component: 'VerifyEmailSuccessPage',
    layout: 'NONE',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: '',
      description: '',
      hideFromNav: true,
    },
  },
];

// Protected routes (cần đăng nhập)
export const protectedRoutes: RouteConfig[] = [
  {
    path: Routers.TOAST_DEMO,
    name: 'toast-demo',
    component: 'ToastDemoPage',
    layout: 'CUSTOMER',
    isProtected: true,
    roles: [UserRole.CUSTOMER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Demo Toast',
      description: 'Demo trang Toast',
      hideFromNav: true,
    },
  },
  {
    path: Routers.MODAL_DEMO,
    name: 'modal-demo',
    component: 'ModalConfirmDemoPage',
    layout: 'CUSTOMER',
    isProtected: true,
    roles: [UserRole.CUSTOMER],
    permissions: [Permission.DEMO_TEST],
    meta: {
      title: 'Demo Modal',
      description: 'Demo Modal Confirm',
    },
  },
  {
    path: Routers.PAGINATION_DEMO,
    name: 'pagination-demo',
    component: 'PaginationDemoPage',
    layout: 'CUSTOMER',
    isProtected: true,
    roles: [UserRole.CUSTOMER],
    permissions: [Permission.DEMO_TEST],
    meta: {
      title: 'Demo Pagination',
      description: 'Demo Pagination Component',
    },
  },
];

// Error routes
export const errorRoutes: RouteConfig[] = [
  {
    path: Routers.NOT_FOUND,
    name: 'not-found',
    component: 'NotFoundPage',
    layout: 'NONE',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Không tìm thấy trang',
      hideFromNav: true,
    },
  },
  {
    path: Routers.FORBIDDEN,
    name: 'forbidden',
    component: 'ForbiddenPage',
    layout: 'NONE',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Không có quyền truy cập',
      hideFromNav: true,
    },
  },
];

// ================================
// COMBINED ROUTES
// ================================

export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...authRoutes,
  ...protectedRoutes,
  ...errorRoutes,
  ...verifyEmailSuccess,
  ...sendEmailVerifySuccess,
];

// ================================
// UTILITY FUNCTIONS
// ================================

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return allRoutes.find(route => route.path === path);
};

export const getRoutesByRole = (role: UserRole): RouteConfig[] => {
  return allRoutes.filter(route => !route.roles || route.roles.includes(role));
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

export const hasRouteAccess = (userRole: UserRole, route: RouteConfig): boolean => {
  // Kiểm tra role trước
  if (route.roles && !route.roles.includes(userRole)) {
    return false;
  }

  // Kiểm tra permission
  if (route.permissions) {
    return route.permissions.some(permission => hasPermission(userRole, permission));
  }

  // Nếu không có permission, chỉ kiểm tra role
  return !route.roles || route.roles.includes(userRole);
};

export const getNavigationItems = (userRole: UserRole): RouteConfig[] => {
  return allRoutes.filter(route => !route.meta?.hideFromNav && hasRouteAccess(userRole, route));
};

export default allRoutes;
