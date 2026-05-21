import { useEffect, useRef, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/shared/hooks/useToast";
import { env } from "@/lib/env";
import { authApi } from "@/features/auth/api";
import { queryClient } from "@/lib/api/query-client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { Permissions } from "@/features/roles/types";
import { useNotificationStore } from "@/store/notification-store";

/**
 * Represents the structured payload received from the Server-Sent Events (SSE) stream.
 */
interface NotificationData {
  /** The specific system action identifier (e.g., 'FORCE_LOGOUT', 'ORDER_DELIVERED'). */
  action: string;
  /** The localized notification message intended for display to the user. */
  message: string;
  /** Optional contextual payload associated with the action (e.g., updated permission lists). */
  payload?: unknown;
}

/** Defines the available visual variants for notification toasts. */
type ToastType = "success" | "error" | "info" | "warning";

/**
 * Configuration mapping for standard user-facing notification actions.
 * Centralizes the UI styling (toast type) and localization keys for different event types.
 * To introduce a new notification type, append its action code here.
 */
const ACTION_CONFIGS: Record<string, { type: ToastType; titleKey: string }> = {
  ORDER_COMPLETED: { type: "success", titleKey: "orderUpdate" },
  ORDER_DELIVERED: { type: "success", titleKey: "orderUpdate" },
  ORDER_CANCELLED: { type: "warning", titleKey: "orderUpdate" },
  ORDER_CANCELED: { type: "warning", titleKey: "orderUpdate" },
};

/**
 * Context provided to system-level action handlers containing the event payload and utility functions.
 */
export interface SystemActionContext {
  data: NotificationData;
  toast: ReturnType<typeof useToast>;
  t: (key: string) => string;
}

/**
 * Registry for Critical System Actions that execute side-effects (e.g., redirects, session termination).
 * These handlers intercept specific actions and bypass standard notification rendering.
 */
const SYSTEM_ACTION_HANDLERS: Record<
  string,
  (ctx: SystemActionContext) => void
> = {
  FORCE_LOGOUT: ({ data, toast, t }) => {
    toast.error(data.message, t("systemAlert"), 6000);
    authApi.logout().finally(() => {
      const defaultLocale = env.DEFAULT_LOCALE;
      window.location.href = `/${defaultLocale}/login`;
    });
  },
  REFRESH_PERMISSIONS: ({ data, toast, t }) => {
    const payload = data.payload as { permissions?: string[] } | undefined;
    if (payload && Array.isArray(payload.permissions)) {
      const hasDashboardAccess = payload.permissions
        .map((p) => p.toLowerCase())
        .includes(Permissions.ACCESS_DASHBOARD);
      const isInDashboard = window.location.pathname.includes("/dashboard");

      if (isInDashboard && !hasDashboardAccess) {
        toast.error(t("dashboardRevoked"), t("systemAlert"), 6000);
        setTimeout(() => {
          const defaultLocale = env.DEFAULT_LOCALE;
          window.location.href = `/${defaultLocale}`;
        }, 2000);
        return;
      }
    }

    toast.info(data.message, t("permissionsUpdate"), 5000);
    setTimeout(() => window.location.reload(), 1500);
  },
};

/** Singleton instance of the AudioContext to prevent exceeding browser limits and memory leaks. */
let sharedAudioContext: AudioContext | null = null;

/**
 * Synthesizes and plays a premium, two-tone chime sound for real-time notification alerts.
 * Utilizes the Web Audio API to generate the sound dynamically, eliminating the need for external assets.
 * Safely handles browser auto-play policies and concurrency limits via a shared AudioContext.
 */
const playNotificationSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContextClass();
    }

    if (sharedAudioContext.state === "suspended") {
      sharedAudioContext.resume();
    }

    const ctx = sharedAudioContext;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.07, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    // تحسين 2: تنظيف الـ Audio Nodes فوراً بعد انتهاء الصوت لتحرير الذاكرة
    osc1.onended = () => {
      osc1.disconnect();
      gain1.disconnect();
    };
    osc2.onended = () => {
      osc2.disconnect();
      gain2.disconnect();
    };

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.6);
    osc2.stop(now + 0.4);
  } catch (error) {
    console.warn(
      "Notification sound playback prevented or unsupported:",
      error,
    );
  }
};

/**
 * Custom React hook for establishing and managing a real-time Server-Sent Events (SSE) connection.
 *
 * Capabilities:
 * - Automatic reconnection with exponential backoff.
 * - Dynamic execution of system actions (e.g., `FORCE_LOGOUT`).
 * - Real-time synchronization of the global Zustand notification store.
 * - Intelligent request debouncing for cache invalidation to optimize network performance.
 *
 * @returns An object containing a `close` method to manually terminate the active SSE connection.
 */
export const useServerNotifications = () => {
  const locale = useLocale();
  const t = useTranslations("notifications.alerts");
  const toast = useToast();

  const tRef = useRef(t);
  const toastRef = useRef(toast);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /** Debounce timer reference to prevent React Query invalidation spam. */
  const invalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: user } = useMe();
  const isAuthenticated = !!user;

  // Optimization 1: Keep refs updated cleanly without re-triggering the main effect.
  useEffect(() => {
    toastRef.current = toast;
    tRef.current = t;
  }, [toast, t]);

  // Optimization 2: Memoize the connection teardown logic to ensure stable references for consumers.
  const closeConnection = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (invalidateTimeoutRef.current)
      clearTimeout(invalidateTimeoutRef.current);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 5;

    const connect = () => {
      if (!isMounted) return;

      // Ensure any stale connections are cleanly terminated before establishing a new one.
      closeConnection();

      const url = `${env.API_URL}${env.ENDPOINTS.NOTIFICATIONS.STREAM}?lang=${locale}`;
      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        retryCount = 0; // Reset backoff counter on successful connection
      };

      es.onmessage = (event: MessageEvent) => {
        if (!isMounted) return;
        try {
          const data: NotificationData = JSON.parse(event.data);
          if (!data.message) return;

          const currentToast = toastRef.current;
          const currentT = tRef.current;
          const action = data.action?.toUpperCase() || "INFO";

          // --- 1. Handle Critical System Actions ---
          const systemHandler = SYSTEM_ACTION_HANDLERS[action];
          if (systemHandler) {
            systemHandler({ data, toast: currentToast, t: currentT });
            return; // Terminate execution to prevent standard toast rendering.
          }

          // --- 2. Handle Standard Notifications via Config Map ---
          const config = ACTION_CONFIGS[action] || {
            type: "info",
            titleKey: "newNotification",
          };
          currentToast[config.type](
            data.message,
            currentT(config.titleKey),
            5000,
          );

          playNotificationSound();

          const uniqueId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          // Sync with global store for instant UI updates (e.g., bell icon badge).
          useNotificationStore.getState().addNotification({
            _id: uniqueId,
            type:
              action === "ADMIN_BROADCAST"
                ? "BROADCAST"
                : action === "ADMIN_ROLE_ALERT"
                  ? "ROLE"
                  : "DIRECT",
            action: action,
            message: data.message,
            payload: data.payload,
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          // Optimization 3: Debounce TanStack Query cache invalidation.
          // Prevents network flooding when the SSE stream dispatches a rapid burst of messages.
          if (invalidateTimeoutRef.current) {
            clearTimeout(invalidateTimeoutRef.current);
          }
          invalidateTimeoutRef.current = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }, 300);
        } catch {
          // Fail silently for unparseable payloads to prevent console pollution.
        }
      };

      es.onerror = () => {
        if (!isMounted) return;
        es.close();
        eventSourceRef.current = null;

        if (retryCount < maxRetries) {
          retryCount++;
          const timeout = Math.min(1000 * Math.pow(2, retryCount), 30000);
          reconnectTimeoutRef.current = setTimeout(connect, timeout);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      closeConnection();
    };
  }, [isAuthenticated, locale, closeConnection]);

  return { close: closeConnection };
};
