import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types';

export interface CrudApi<T> {
  getAll: (params?: Record<string, unknown>) => Promise<any>;
  getOne: (id: string, params?: Record<string, unknown>) => Promise<any>;
  create: (data: FormData | Record<string, unknown>) => Promise<any>;
  update: (id: string, data: FormData | Record<string, unknown>) => Promise<any>;
  delete: (id: string) => Promise<any>;
  getStats?: () => Promise<any>;
}

export function createCrudApi<T>(baseEndpoint: string, hasStats = false): CrudApi<T> {
  const getHeaders = (data: any) => {
    return data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
  };

  const api: CrudApi<T> = {
    getAll: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<T[]>>(baseEndpoint, { params }),
    
    getOne: (id: string, params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<T>>(`${baseEndpoint}/${id}`, { params }),
    
    create: (data: FormData | Record<string, unknown>) =>
      apiClient.post<ApiResponse<T>>(baseEndpoint, data, {
        headers: getHeaders(data),
      }),
    
    update: (id: string, data: FormData | Record<string, unknown>) =>
      apiClient.patch<ApiResponse<T>>(`${baseEndpoint}/${id}`, data, {
        headers: getHeaders(data),
      }),
    
    delete: (id: string) => apiClient.delete(`${baseEndpoint}/${id}`),
  };

  if (hasStats) {
    api.getStats = () => apiClient.get(`${baseEndpoint}/statistics`);
  }
  return api;
}
