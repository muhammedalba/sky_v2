import { apiClient } from './client';
import { ApiResponse, User } from '@/types';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_USERS || '/users',
  CREATE: process.env.NEXT_PUBLIC_ENDPOINT_USERS_CREATE || '/users/create-user',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_USERS_STATS || '/users/statistics',
};

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
