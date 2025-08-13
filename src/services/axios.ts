import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios';
import getApiBackendUrl from '@/utils/apiConfig'; // <-- Thêm dòng này

// Lấy baseURL từ apiConfig
const API_BASE_URL = getApiBackendUrl();

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
    'Content-Type': 'application/json', // Dữ liệu gửi đi dạng JSON
  },
});

axiosPrivate.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('token');
    console.log('accessToken', accessToken);
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Debug request data
    if (config.url?.includes('/batch')) {
      console.log('Axios interceptor - Request config:', {
        url: config.url,
        method: config.method,
        data: config.data,
        dataType: typeof config.data,
        dataStringified: JSON.stringify(config.data),
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosPrivate.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login page -> Login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

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
