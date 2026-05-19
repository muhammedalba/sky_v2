import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, AdminSendNotificationDto } from "../api";
import { useNotificationStore } from "@/store/notification-store";
import { useToast } from "@/shared/hooks/useToast";
import { AxiosError } from "axios";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  lists: () => [...NOTIFICATION_KEYS.all, "list"] as const,
  list: (filters: string) =>
    [...NOTIFICATION_KEYS.lists(), { filters }] as const,
};

/**
 * Custom React hook to retrieve a paginated list of notifications for the authenticated user.
 * Seeds the Zustand notification store on retrieval of the first page to sync unread counts.
 *
 * @param page - The page number to fetch (defaults to 1).
 * @param limit - The maximum number of notifications per page (defaults to 10).
 * @returns The query result object from TanStack Query containing the data, status, and loading state.
 */
export function useGetNotifications(page: number = 1, limit: number = 10) {
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );

  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(`page=${page}&limit=${limit}`),
    queryFn: async () => {
      const response = await notificationsApi.getAll({ page, limit });
      // Calculate unread count (this might be better returned from the backend directly in the future)
      // For now, we update the store with the fetched data
      const unreadCount = response.data.filter((n) => !n.isRead).length; // this is just for the current page though
      // To get accurate global unread count, backend should return it.
      // Assuming backend might add it later, we just seed the store with the first page
      if (page === 1) {
        setNotifications(response.data, unreadCount);
      }
      return response;
    },
    // Don't override real-time updates too aggressively
    staleTime: 60 * 1000,
  });
}

/**
 * Custom React hook to mutate and mark a specific notification as read.
 * Optimistically updates the Zustand notification store and invalidates relevant queries.
 *
 * @returns The mutation object from TanStack Query for marking notifications as read.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const markAsReadStore = useNotificationStore((state) => state.markAsRead);

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (_, id) => {
      // Update local store immediately
      markAsReadStore(id);
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to mark as read");
    },
  });
}

/**
 * Custom React hook to delete a specific notification for the current user.
 * Optimistically removes the notification from the Zustand store and invalidates lists.
 *
 * @returns The mutation object from TanStack Query for deleting notifications.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const removeNotificationStore = useNotificationStore(
    (state) => state.removeNotification,
  );

  return useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: (_, id) => {
      removeNotificationStore(id);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
      toast.success("Notification deleted");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete notification",
      );
    },
  });
}

/**
 * Custom React hook to retrieve a paginated list of all system notifications for administrators.
 * Requires administrator permissions.
 *
 * @param page - The page number to fetch (defaults to 1).
 * @param limit - The maximum number of notifications per page (defaults to 10).
 * @returns The query result object from TanStack Query containing all notifications.
 */
export function useGetAdminNotifications(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(`admin_page=${page}&limit=${limit}`),
    queryFn: async () => {
      const response = await notificationsApi.adminGetAll({ page, limit });
      return response;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Custom React hook for administrators to send a new notification (direct or broadcast).
 * Automatically invalidates active lists to reflect the newly sent notification.
 *
 * @returns The mutation object from TanStack Query for sending admin notifications.
 */
export function useAdminSendNotification() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: AdminSendNotificationDto) =>
      notificationsApi.adminSend(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Notification sent successfully");
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error?.response?.data?.message || "Failed to send notification",
      );
    },
  });
}

/**
 * Custom React hook for administrators to delete a notification globally across the entire system.
 *
 * @returns The mutation object from TanStack Query for administrative deletion.
 */
export function useAdminDeleteNotification() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: notificationsApi.adminDelete,
    onSuccess: (data) => {
      toast.success(data.message || "Notification deleted globally");
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete notification",
      );
    },
  });
}
