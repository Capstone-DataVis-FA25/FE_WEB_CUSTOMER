import Routers from '@/router/routers';

// ================================
// ROLES & PERMISSIONS DEFINITION
// ================================

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  GUEST: 'GUEST', // Thêm guest role
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  // Public permissions
  VIEW_PUBLIC: 'view_public',
  FORGOT_PASSWORD: 'forgot_password',

  // USER permissions
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile',
  CHANGE_PASSWORD: 'change_password',
  DEMO_TEST: 'demo_test',

  // Admin permissions
  ADMIN_ACCESS: 'admin_access',
  MANAGE_USERS: 'manage_users',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

// Role permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [Permission.VIEW_PUBLIC, Permission.FORGOT_PASSWORD],
  [UserRole.USER]: [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
    Permission.DEMO_TEST,
    Permission.CHANGE_PASSWORD,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
    Permission.DEMO_TEST,
    Permission.ADMIN_ACCESS,
    Permission.MANAGE_USERS,
  ],
};

// ================================
// ROUTE INTERFACE
// ================================

export interface RouteConfig {
  path: string;
  name: string;
  component: string;
  layout: 'USER' | 'ADMIN' | 'AUTH' | 'NONE';
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
    path: Routers.LINE_CHART,
    name: 'line-chart',
    component: 'LineChartPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Biểu đồ dân số',
      description: 'Biểu đồ dân số qua các năm',
    },
  },
  {
    path: Routers.STUDY_CHART,
    name: 'study-chart',
    component: 'StudyChartPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Biểu đồ nghiên cứu',
      description: 'Biểu đồ nghiên cứu qua các năm',
    },
  },
  {
    path: Routers.HOME,
    name: 'home',
    component: 'HomePage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Trang chủ',
      description: 'Trang chủ website',
    },
  },
  {
    path: Routers.ABOUT_US,
    name: 'about-us',
    component: 'AboutPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Về chúng tôi',
      description: 'Về chúng tôi website',
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
  {
    path: Routers.FORGOT_PASSWORD,
    name: 'forgot-password',
    component: 'ForgotPasswordPage',
    layout: 'AUTH',
    isProtected: false,
    permissions: [Permission.FORGOT_PASSWORD],
    meta: {
      title: 'Quên mật khẩu',
      description: 'Yêu cầu reset mật khẩu',
      hideFromNav: true,
    },
  },
  {
    path: Routers.RESET_PASSWORD,
    name: 'reset-password',
    component: 'ResetPasswordPage',
    layout: 'AUTH',
    isProtected: false,
    permissions: [Permission.FORGOT_PASSWORD],
    meta: {
      title: 'Reset mật khẩu',
      description: 'Tạo mật khẩu mới',
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
  // Profile routes
  {
    path: Routers.PROFILE,
    name: 'profile',
    component: 'ProfilePage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Thông tin cá nhân',
      description: 'Quản lý thông tin cá nhân',
    },
  },
  {
    path: Routers.PROFILE_CHANGE_PASSWORD,
    name: 'change-password',
    component: 'ChangePasswordPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.CHANGE_PASSWORD],
    meta: {
      title: 'Đổi mật khẩu',
      description: 'Thay đổi mật khẩu tài khoản',
      hideFromNav: true,
    },
  },
  {
    path: Routers.PROFILE_NOTIFICATIONS,
    name: 'notification-settings',
    component: 'NotificationSettingsPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.EDIT_PROFILE],
    meta: {
      title: 'Cài đặt thông báo',
      description: 'Quản lý cài đặt thông báo',
      hideFromNav: true,
    },
  },
  {
    path: Routers.PROFILE_SETTINGS,
    name: 'general-settings',
    component: 'GeneralSettingsPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.EDIT_PROFILE],
    meta: {
      title: 'Cài đặt chung',
      description: 'Cài đặt chung của ứng dụng',
      hideFromNav: true,
    },
  },
  // Demo routes
  {
    path: Routers.TOAST_DEMO,
    name: 'toast-demo',
    component: 'ToastDemoPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
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
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
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
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
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

export const verifyEmailError: RouteConfig[] = [
  {
    path: Routers.VERIFY_EMAIL_ERROR,
    name: 'verify-email-error',
    component: 'VerifyEmailErrorPage',
    layout: 'NONE',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Lỗi xác thực email',
      description: 'Token xác thực không hợp lệ hoặc đã hết hạn',
      hideFromNav: true,
    },
  },
];

export const resendEmailRoute: RouteConfig[] = [
  {
    path: Routers.RESEND_EMAIL,
    name: 'resend-email',
    component: 'ResendEmailPage',
    layout: 'NONE',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Gửi lại email xác thực',
      description: 'Gửi lại email xác thực tài khoản',
      hideFromNav: true,
    },
  },
];

export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...authRoutes,
  ...protectedRoutes,
  ...errorRoutes,
  ...verifyEmailSuccess,
  ...sendEmailVerifySuccess,
  ...verifyEmailError,
  ...resendEmailRoute,
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
