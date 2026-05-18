import { useEffect, useRef } from "react";
import { useToast } from "@/shared/hooks/useToast";
import { env } from "@/lib/env";
import { authApi } from "@/features/auth/api";
import { queryClient } from "@/lib/api/query-client";

/**
 * Represents the structured payload received from the Server-Sent Events (SSE) stream.
 * Contains action metadata, user-facing messages, and optional contextual payloads.
 */
interface NotificationData {
  /** The specific system action identifier (e.g., 'FORCE_LOGOUT', 'REFRESH_PERMISSIONS', 'ORDER_DELIVERED'). */
  action: string;
  /** The localized notification message intended for display to the user. */
  message: string;
  /** Optional contextual payload associated with the action (e.g., updated permission lists). */
  payload?: unknown;
}

/**
 * Custom React hook for establishing and managing a real-time Server-Sent Events (SSE) connection
 * with the server notification stream.
 *
 * Handles automatic reconnection with exponential backoff, state synchronization across closures,
 * and automated system actions such as immediate session termination (`FORCE_LOGOUT`),
 * dynamic permission validation (`REFRESH_PERMISSIONS`), and order status updates.
 *
 * @returns An object containing a `close` method to manually terminate the active SSE connection.
 *
 * @example
 * ```tsx
 * const { close } = useServerNotifications();
 * // Connection is automatically managed on mount/unmount.
 * ```
 */
export const useServerNotifications = () => {
  const toast = useToast();
  const toastRef = useRef(toast);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep toastRef updated to prevent stale closures without re-triggering useEffect
  useEffect(() => {
    toastRef.current = toast;
  });

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 5;

    const connect = () => {
      if (!isMounted) return;

      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const url = `${env.API_URL}/notifications/stream`;
      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        retryCount = 0; // Reset retry count on successful connection
      };

      es.onmessage = (event: MessageEvent) => {
        if (!isMounted) return;
        try {
          const data: NotificationData = JSON.parse(event.data);

          if (data.message) {
            const currentToast = toastRef.current;
            if (data.action?.toUpperCase() === "FORCE_LOGOUT") {
              currentToast.error(data.message, "تنبيه النظام", 6000);
              // Call logout API and redirect to login page
              authApi.logout().finally(() => {
                const defaultLocale = env.DEFAULT_LOCALE;
                window.location.href = `/${defaultLocale}/login`;
              });
            } else if (data.action?.toUpperCase() === "REFRESH_PERMISSIONS") {
              const payload = data.payload as
                | { permissions?: string[] }
                | undefined;
              if (payload && Array.isArray(payload.permissions)) {
                const hasDashboardAccess = payload.permissions
                  .map((p) => p.toLowerCase())
                  .includes("access_dashboard");
                const isInDashboard =
                  window.location.pathname.includes("/dashboard");
                console.log(isInDashboard, hasDashboardAccess);
                if (isInDashboard && !hasDashboardAccess) {
                  currentToast.error(
                    "لقد تم سحب صلاحية دخول لوحة التحكم منك. سيتم تحويلك للصفحة الرئيسية.",
                    "تنبيه النظام",
                    6000,
                  );
                  setTimeout(() => {
                    const defaultLocale = env.DEFAULT_LOCALE;
                    window.location.href = `/${defaultLocale}`;
                  }, 2000);
                  return;
                }
              }

              currentToast.info(data.message, "تحديث الصلاحيات", 5000);
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              // Standard notifications
              if (
                data.action === "ORDER_COMPLETED" ||
                data.action === "ORDER_DELIVERED"
              ) {
                currentToast.success(data.message, "تحديث الطلب", 5000);
              } else if (
                data.action === "ORDER_CANCELLED" ||
                data.action === "ORDER_CANCELED"
              ) {
                currentToast.warning(data.message, "تحديث الطلب", 5000);
              } else {
                currentToast.info(data.message, "إشعار جديد", 5000);
              }

              // Play notification sound
              try {
                const beep = new Audio(
                  "data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YToAAACQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ",
                );
                beep.volume = 0.5;
                beep
                  .play()
                  .catch(() => console.warn("Sound play prevented by browser"));
              } catch {
                // Ignore audio play errors
              }

              // 1. Update Zustand store for instant bell popover update
              import("@/store/notification-store").then(
                ({ useNotificationStore }) => {
                  useNotificationStore.getState().addNotification({
                    _id: `temp-${Date.now()}`,
                    type:
                      data.action === "ADMIN_BROADCAST"
                        ? "BROADCAST"
                        : "DIRECT",
                    action: data.action || "INFO",
                    message: data.message,
                    payload: data.payload,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
                },
              );

              // 2. Invalidate TanStack Query cache so any open notification list page auto-refreshes
              queryClient.invalidateQueries({ queryKey: ["notifications"] });
            }
          }
        } catch {
          // Silent catch for JSON parse errors to prevent console spam
        }
      };

      es.onerror = () => {
        if (!isMounted) return;
        es.close();
        eventSourceRef.current = null;

        if (retryCount < maxRetries) {
          retryCount++;
          // Exponential backoff for reconnection
          const timeout = Math.min(1000 * Math.pow(2, retryCount), 30000);
          reconnectTimeoutRef.current = setTimeout(connect, timeout);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures EventSource connects exactly once on mount

  return {
    close: () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    },
  };
};
