import { apiClient } from "@/lib/api/client";
import { env } from "@/lib/env";



export type NotificationType = "DIRECT" | "BROADCAST" | "ROLE";

export interface NotificationRecipient {
  _id: string;
  name?: string;
  email?: string;
}

export interface NotificationRole {
  _id: string;
  name: string;
}

export interface Notification {
  _id: string;
  type: NotificationType;
  action: string;
  message: string;
  payload?: unknown;
  recipient?: string | NotificationRecipient | null;
  targetRole?: string | NotificationRole | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminSendNotificationDto {
  targetType: "direct" | "broadcast" | "role";
  userId?: string; 
  roleId?: string;
  action?: string;
  message: string;
  payload?: unknown;
}

const { BASE, ADMIN_SEND, ADMIN_DELETE } = env.ENDPOINTS.NOTIFICATIONS;

export const notificationsApi = {
  // User Actions
  getAll: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get<GetNotificationsResponse>(BASE, {
      params,
    });
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await apiClient.patch<{ message: string }>(
      `${BASE}/${id}/read`,
    );
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<{ message: string }>(
      `${BASE}/${id}`,
    );
    return data;
  },

  // Admin Actions
  adminGetAll: async (params?: { page?: number; limit?: number }) => {
    // We expect the backend to have an admin endpoint like /notifications/admin
    // Wait, ADMIN_DELETE is mapped to '/notifications/admin'. We can use that for GET as well.
    const { data } = await apiClient.get<GetNotificationsResponse>(ADMIN_DELETE, {
      params,
    });
    return data;
  },
  adminSend: async (payload: AdminSendNotificationDto) => {
    const { data } = await apiClient.post<{ message: string }>(
      ADMIN_SEND,
      payload,
    );
    return data;
  },

  adminDelete: async (id: string) => {
    const { data } = await apiClient.delete<{ message: string }>(
      `${ADMIN_DELETE}/${id}`,
    );
    return data;
  },
};
