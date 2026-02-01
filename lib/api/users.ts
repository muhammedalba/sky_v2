import { apiClient } from './client';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_USERS || '/users',
  CREATE: process.env.NEXT_PUBLIC_ENDPOINT_USERS_CREATE || '/users/create-user',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_USERS_STATS || '/users/statistics',
};

export const usersApi = {
  getAll: (params?: any) => apiClient.get(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: any) =>
    apiClient.post(ENDPOINTS.CREATE, data),
  update: (id: string, data: any) =>
    apiClient.put(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
  updateRole: (id: string, role: string) =>
    apiClient.put(`${ENDPOINTS.BASE}/${id}`, { role }),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
