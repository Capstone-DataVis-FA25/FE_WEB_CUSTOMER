import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios';

// Get base URL dựa theo environment
const getBaseURL = (): string => {
  const environment = import.meta.env.VITE_APP_ENVIRONMENT || 'development';

  if (environment === 'production') {
    return (
      import.meta.env.VITE_APP_BACKEND_CUSTOMER_URL_PRODUCTION || 'https://api.production.com/'
    );
  }

  return import.meta.env.VITE_APP_BACKEND_CUSTOMER_URL_DEVELOPMENT || 'http://localhost:5000/';
};

const API_BASE_URL = getBaseURL();

// Tạo axios instance public (không cần authentication)
export const axiosPublic: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tạo axios instance private (cần authentication)
export const axiosPrivate: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setTokens: (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// Request interceptor cho axiosPrivate - tự động thêm token
axiosPrivate.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor cho axiosPrivate - xử lý token hết hạn
axiosPrivate.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          // Gọi API refresh token
          const response = await axiosPublic.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          tokenStorage.setTokens(accessToken, newRefreshToken);

          // Retry request với token mới
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return axiosPrivate(originalRequest);
        } catch (refreshError) {
          // Refresh token cũng hết hạn, logout user
          tokenStorage.clearTokens();
          window.location.href = '/auth';
          return Promise.reject(refreshError);
        }
      } else {
        // Không có refresh token, redirect đến login
        tokenStorage.clearTokens();
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

// Request interceptor cho axiosPublic - log requests
axiosPublic.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig) => {
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor cho cả hai - log responses và xử lý lỗi chung
[axiosPublic, axiosPrivate].forEach(instance => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError) => {
      console.log(
        `❌ [API Error] ${error.response?.status} ${error.config?.url}`,
        error.response?.data
      );

      // Xử lý lỗi chung
      if (error.response?.status === 500) {
        // Có thể show toast notification
        console.error('Server error occurred');
      }

      return Promise.reject(error);
    }
  );
});

export default {
  axiosPublic,
  axiosPrivate,
  tokenStorage,
};
