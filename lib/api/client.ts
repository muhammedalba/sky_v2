import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useToastStore } from '@/store/toast-store';
import { env } from '@/lib/env';

const API_BASE_URL = env.API_URL;
const REFRESH_ENDPOINT = env.ENDPOINTS.AUTH.REFRESH;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(apiClient(prom.config));
    }
  });
  failedQueue = [];
};


// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };
      
      const pathSegment = window.location.pathname.split('/')[1];
      const isLikelyLocale = pathSegment && pathSegment.length >= 2 && pathSegment.length <= 5;
      const pathLocale = isLikelyLocale ? pathSegment : null;
      
      const cookieLocale = getCookie('NEXT_LOCALE');
      const htmlLang = document.documentElement.lang;
      
      // Prioritize pathLocale > cookieLocale > htmlLang
      const locale = pathLocale || cookieLocale || htmlLang || env.DEFAULT_LOCALE;
      
      config.headers['x-lang'] = locale;
      config.headers['Accept-Language'] = locale;
    } else {
      config.headers['x-lang'] = env.DEFAULT_LOCALE;
      config.headers['Accept-Language'] = env.DEFAULT_LOCALE;
    }

    return config;
  },
  (error) => {
    // console.log('request error', error);
    return Promise.reject(error)}
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;

    // If the backend returns our standard ApiResponse structure
    if (
      resData &&
      typeof resData === 'object' &&
      'success' in resData &&
      'data' in resData
    ) {
      return resData;
    }
    return response;
  },
  async (error: AxiosError) => {

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // طلب التجديد - السيرفر سيعالج الكوكيز تلقائياً بسبب withCredentials
        const response = await axios.get(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
          withCredentials: true,
        });

        const resData = response.data;
        const newAccessToken = resData.access_token || resData.data?.access_token || resData.token || resData.accessToken;

        if (newAccessToken) {
          processQueue(null);
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token in response');
        }
      } catch (refreshError) {
        processQueue(refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle standardized error response from AllExceptionsFilter
    if (error.response?.data) {
      const data = error.response.data as Record<string, unknown>;
      
      // Prioritize the translated errors array from the backend
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        error.message = data.errors.map((m: string) => `• ${m}`).join('\n');
      } else if (typeof data.message === 'string') {
        error.message = data.message;
      } else {
        error.message = 'حدث خطأ يرجى المحاولة مرة أخرى.';
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const isProtectedRoute = path.includes('/dashboard') || path.includes('/account');

    if (isProtectedRoute) {
      useToastStore.getState().addToast({
        title: 'انتهت الجلسة',
        message: 'عذراً، يجب عليك تسجيل الدخول مرة أخرى.',
        type: 'error',
      });

      const defaultLocale = env.DEFAULT_LOCALE;
      window.location.href = `/${defaultLocale}/login`;
    }
  }
}
