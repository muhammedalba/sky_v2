import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth';
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

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.config.headers.Authorization = `Bearer ${token}`;
      prom.resolve(apiClient(prom.config));
    }
  });
  failedQueue = [];
};


// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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

      // الحصول على التوكن من Cookies أو LocalStorage
      const currentToken = getRefreshToken() || getAuthToken();

      if (!currentToken) {
        isRefreshing = false;
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // طلب التجديد - السيرفر سيعالج الكوكيز تلقائياً بسبب withCredentials
        const response = await axios.get(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${currentToken}`, // احتياطاً إذا كان السيرفر يطلبه في الهيدر أيضاً
          },
        });

        // الهيكل المتوقع بناءً على رسائلك: { status, message, access_token }
        const resData = response.data;
        const newAccessToken = resData.access_token || resData.data?.access_token || resData.token || resData.accessToken;

        // تحديث التوكنات (سيتم تحديث الكوكيز تلقائياً من المتصفح، ونحن نحدث الذاكرة المحلية)
        if (newAccessToken) {
          setTokens(newAccessToken, currentToken);

          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token in response');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle standardized error response from AllExceptionsFilter
    if (error.response?.data) {
      const data = error.response.data as any;
      
      // Prioritize the translated errors array from the backend
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        error.message = data.errors.map((m: string) => `• ${m}`).join('\n');
      } else if (data.message) {
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
    clearTokens();

    useToastStore.getState().addToast({
      title: 'انتهت الجلسة',
      message: 'عذراً، يجب عليك تسجيل الدخول مرة أخرى.',
      type: 'error',
    });

    const defaultLocale = env.DEFAULT_LOCALE;
    if (!window.location.pathname.includes('/login')) {
      window.location.href = `/${defaultLocale}/login`;
    }
  }
}
