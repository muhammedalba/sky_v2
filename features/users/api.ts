import { apiClient } from '@/lib/api';
import { env } from '@/lib/env';
import { ApiResponse, User } from '@/types';

const ENDPOINTS = env.ENDPOINTS.USERS;

export const usersApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<User[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get<ApiResponse<User>>(ENDPOINTS.BASE + '/' + id),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<User>>(ENDPOINTS.CREATE, data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<User>>(ENDPOINTS.BASE + '/' + id, data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
  updateRole: (id: string, role: string) =>
    apiClient.put<ApiResponse<User>>(ENDPOINTS.BASE + '/' + id, { role }),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
