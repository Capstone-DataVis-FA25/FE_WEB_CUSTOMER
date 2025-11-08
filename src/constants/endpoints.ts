export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP: '/auth/sign-up',
    SIGN_OUT: '/auth/sign-out',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_EMAIL: '/auth/resend-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
    DELETE_USER: '/users',
  },
  USERS: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    DELETE_ACCOUNT: (id: string) => `/users/${id}`,
  },
  DATASETS: {
    GET_ALL: '/datasets',
    GET_BY_ID: (id: string) => `/datasets/${id}`,
    CREATE: '/datasets',
    UPDATE: (id: string) => `/datasets/${id}`,
    DELETE: (id: string) => `/datasets/${id}`,
  },
  CHARTS: {
    GET_ALL: '/charts',
    GET_BY_ID: (id: string) => `/charts/${id}`,
    CREATE: '/charts',
    UPDATE: (id: string) => `/charts/${id}`,
    DELETE: (id: string) => `/charts/${id}`,
  },
  PAYMENTS: {
    CHECKOUT: '/payments/checkout',
    GET_BY_ID: (id: string) => `/payments/${id}`,
    WEBHOOK: '/payments/webhook',
  },
} as const;
