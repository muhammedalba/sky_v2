import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useToastStore } from "@/store/toast-store";
import { env } from "@/lib/env";

const API_BASE_URL = env.API_URL;
const REFRESH_ENDPOINT = env.ENDPOINTS.AUTH.REFRESH;
const LOCALE_COOKIE_RE = /(?:^|;\s*)NEXT_LOCALE=([^;]*)/;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _sentAt?: number;
};

let refreshPromise: Promise<void> | null = null;
let lastRefreshAt = 0;

// Single-flight: concurrent 401s share one refresh request
function refreshSession(): Promise<void> {
  refreshPromise ??= axios
    // طلب التجديد - السيرفر سيعالج الكوكيز تلقائياً بسبب withCredentials
    .get(`${API_BASE_URL}${REFRESH_ENDPOINT}`, { withCredentials: true })
    .then(({ data }) => {
      if (!(data.access_token || data.data?.access_token)) {
        throw new Error("No access token in response");
      }
      lastRefreshAt = Date.now();
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// Prioritize pathLocale > cookieLocale > htmlLang — cookie is read only if needed
function resolveClientLocale(): string {
  const pathSegment = window.location.pathname.split("/", 2)[1];
  if (pathSegment && pathSegment.length >= 2 && pathSegment.length <= 5) {
    return pathSegment;
  }
  const cookieLocale = LOCALE_COOKIE_RE.exec(document.cookie)?.[1];
  return cookieLocale || document.documentElement.lang || env.DEFAULT_LOCALE;
}

// Request interceptor
apiClient.interceptors.request.use(
  (config: RetriableConfig) => {
    const locale =
      typeof window !== "undefined" ? resolveClientLocale() : env.DEFAULT_LOCALE;
    config.headers["x-lang"] = locale;
    config.headers["Accept-Language"] = locale;
    config._sentAt = Date.now();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;

    // If the backend returns our standard ApiResponse structure
    if (
      resData &&
      typeof resData === "object" &&
      "success" in resData &&
      "data" in resData
    ) {
      return resData;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname.includes("/login")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Sent before the latest successful refresh — just retry with the new cookie
      if ((originalRequest._sentAt ?? 0) < lastRefreshAt) {
        return apiClient(originalRequest);
      }

      const isInitiator = !refreshPromise;
      try {
        await refreshSession();
      } catch (refreshError) {
        if (isInitiator) handleLogout();
        return Promise.reject(refreshError);
      }
      return apiClient(originalRequest);
    }

    // Handle standardized error response from AllExceptionsFilter
    if (error.response?.data) {
      const data = error.response.data as Record<string, unknown>;

      // Prioritize the translated errors array from the backend
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        error.message = data.errors.map((m: string) => `• ${m}`).join("\n");
      } else if (typeof data.message === "string") {
        error.message = data.message;
      } else {
        error.message = "حدث خطأ يرجى المحاولة مرة أخرى.";
      }
    }

    return Promise.reject(error);
  },
);

function handleLogout() {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    const isProtectedRoute =
      path.includes("/dashboard") || path.includes("/account");

    if (isProtectedRoute) {
      useToastStore.getState().addToast({
        title: "انتهت الجلسة",
        message: "عذراً، يجب عليك تسجيل الدخول مرة أخرى.",
        type: "error",
      });

      const defaultLocale = env.DEFAULT_LOCALE || "ar";
      // Outside React's tree (axios interceptor) — no router available, and a
      // full reload is wanted anyway to clear in-memory state on session expiry.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/${defaultLocale}/login`;
    }
  }
}
