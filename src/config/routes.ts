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
    Permission.CHANGE_PASSWORD,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_PUBLIC,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
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
    path: Routers.LINE_CHART_DEMO,
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
    path: Routers.BAR_CHART_DEMO,
    name: 'bar-chart',
    component: 'BarChartPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Biểu đồ cột',
      description: 'Biểu đồ cột doanh số theo tháng',
    },
  },
  {
    path: Routers.AREA_CHART_DEMO,
    name: 'area-chart',
    component: 'AreaChartPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Biểu đồ vùng',
      description: 'Biểu đồ vùng doanh số theo tháng',
    },
  },
  {
    path: Routers.LINE_CHART_EDITOR_DEMO,
    name: 'line-chart-editor-demo',
    component: 'LineChartEditorDemo',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'LineChart Editor Demo',
      description: 'Interactive demonstration of the LineChart editor component',
    },
  },
  {
    path: Routers.BAR_CHART_EDITOR_DEMO,
    name: 'bar-chart-editor-demo',
    component: 'BarChartEditorDemo',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'BarChart Editor Demo',
      description: 'Interactive demonstration of the BarChart editor component',
    },
  },
  {
    path: Routers.AREA_CHART_EDITOR_DEMO,
    name: 'area-chart-editor-demo',
    component: 'AreaChartEditorDemo',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'AreaChart Editor Demo',
      description: 'Interactive demonstration of the AreaChart editor component',
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

  //terms of service and privacy policy

  {
    path: Routers.TERMS_OF_SERVICE,
    name: 'terms-of-service',
    component: 'TermsOfServicePage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Terms of Service',
      description: 'Terms of Service',
    },
  },
  {
    path: Routers.PRIVACY_POLICY,
    name: 'privacy-policy',
    component: 'PrivacyPolicyPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Privacy Policy',
      description: 'Privacy Policy',
    },
  },
  {
    path: Routers.CHART_GALLERY,
    name: 'chartgallery',
    component: 'ChartGalleryPickerPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Dashboard',
      description: 'Dashboard',
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
  {
    path: Routers.FREQUENT_QUESTIONS,
    name: 'frequent-questions',
    component: 'FrequentQuestionPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Câu hỏi thường gặp',
      description: 'Tìm câu trả lời cho những câu hỏi phổ biến nhất về dịch vụ của chúng tôi',
    },
  },
  {
    path: Routers.CHART_EDITOR,
    name: 'chart-editor',
    component: 'ChartEditorPage',
    layout: 'USER',
    isProtected: false,
    permissions: [Permission.VIEW_PUBLIC],
    meta: {
      title: 'Chart Editor',
      description: 'Interactive chart editor with customizable settings and data management',
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
  // Dataset routes
  {
    path: Routers.CREATE_DATASET,
    name: 'create-dataset',
    component: 'CreateDatasetPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Create Dataset',
      description: 'Upload and create a new dataset from Excel or CSV files',
    },
  },
  {
    path: Routers.CREATE_DATASET_UPLOAD,
    name: 'create-dataset-upload',
    component: 'CreateDatasetPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Create Dataset - Upload File',
      description: 'Upload and create a new dataset from Excel or CSV files',
      hideFromNav: true,
    },
  },
  {
    path: Routers.CREATE_DATASET_TEXT,
    name: 'create-dataset-text',
    component: 'CreateDatasetPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Create Dataset - Paste Text',
      description: 'Create a new dataset by pasting text data',
      hideFromNav: true,
    },
  },
  {
    path: Routers.CREATE_DATASET_SAMPLE,
    name: 'create-dataset-sample',
    component: 'CreateDatasetPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Create Dataset - Sample Data',
      description: 'Create a new dataset using sample data',
      hideFromNav: true,
    },
  },
  {
    path: Routers.CREATE_DATASET_VIEW,
    name: 'create-dataset-view',
    component: 'CreateDatasetPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Create Dataset - Preview',
      description: 'Preview and configure dataset before creation',
      hideFromNav: true,
    },
  },
  // Chart routes
  {
    path: Routers.CHART_GALLERY,
    name: 'chart-gallery',
    component: 'ChartGalleryPickerPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Chart Gallery',
      description: 'Browse chart templates and create new charts',
    },
  },
  {
    path: Routers.DATASET_DETAIL,
    name: 'dataset-detail',
    component: 'DatasetDetailPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Dataset Details',
      description: 'View dataset details and data',
    },
  },
  // Workspace routes
  {
    path: Routers.WORKSPACE,
    name: 'workspace',
    component: 'WorkspacePage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Workspace',
      description: 'Manage your datasets and charts',
    },
  },
  {
    path: Routers.WORKSPACE_DATASETS,
    name: 'workspace-datasets',
    component: 'WorkspacePage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Workspace - Datasets',
      description: 'Manage your datasets',
    },
  },
  {
    path: Routers.WORKSPACE_CHARTS,
    name: 'workspace-charts',
    component: 'WorkspacePage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Workspace - Charts',
      description: 'Manage your charts',
    },
  },
  {
    path: Routers.CHART_CREATOR,
    name: 'chart-creator',
    component: 'ChartCreatorPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Chart Creator',
      description: 'Create new charts from your datasets',
    },
  },
  // Chart Editor routes with ID parameter
  {
    path: Routers.LINE_CHART_EDITOR_DEMO,
    name: 'line-chart-editor',
    component: 'LineChartEditorPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Line Chart Editor',
      description: 'Edit line charts with advanced customization options',
    },
  },
  {
    path: Routers.BAR_CHART_EDITOR_DEMO,
    name: 'bar-chart-editor',
    component: 'BarChartEditorPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Bar Chart Editor',
      description: 'Edit bar charts with advanced customization options',
    },
  },
  {
    path: Routers.AREA_CHART_EDITOR_DEMO,
    name: 'area-chart-editor',
    component: 'AreaChartEditorPage',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Area Chart Editor',
      description: 'Edit area charts with advanced customization options',
    },
  },
  {
    path: Routers.PIE_CHART_EDITOR_DEMO,
    name: 'pie-chart-editor',
    component: 'PieChartEditorDemo',
    layout: 'USER',
    isProtected: true,
    roles: [UserRole.USER],
    permissions: [Permission.VIEW_PROFILE],
    meta: {
      title: 'Pie Chart Editor',
      description: 'Edit pie charts with advanced customization options',
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
