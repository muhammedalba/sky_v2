import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types';

export interface CrudApi<T> {
  getAll: (params?: Record<string, unknown>) => Promise<ApiResponse<T[]>>;
  getOne: (id: string, params?: Record<string, unknown>) => Promise<ApiResponse<T>>;
  create: (data: FormData | Record<string, unknown>) => Promise<ApiResponse<T>>;
  update: (id: string, data: FormData | Record<string, unknown>) => Promise<ApiResponse<T>>;
  delete: (id: string) => Promise<ApiResponse<any>>;
  getStats?: () => Promise<ApiResponse<any>>;
}

export function createCrudApi<T>(baseEndpoint: string, hasStats = false): CrudApi<T> {
  const getHeaders = (data: any) => {
    const isFormData = data instanceof FormData || (data && typeof data === 'object' && 'append' in data);
    return isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
  };

  const api: CrudApi<T> = {
    getAll: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<T[]>>(baseEndpoint, { params }) as unknown as Promise<ApiResponse<T[]>>,

    getOne: (id: string, params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<T>>(`${baseEndpoint}/${id}`, { params }) as unknown as Promise<ApiResponse<T>>,

    create: (data: FormData | Record<string, unknown>) =>
      apiClient.post<ApiResponse<T>>(baseEndpoint, data, {
        headers: getHeaders(data),
      }) as unknown as Promise<ApiResponse<T>>,

    update: (id: string, data: FormData | Record<string, unknown>) =>
      apiClient.patch<ApiResponse<T>>(`${baseEndpoint}/${id}`, data, {
        headers: getHeaders(data),
      }) as unknown as Promise<ApiResponse<T>>,

    delete: (id: string) => apiClient.delete(`${baseEndpoint}/${id}`) as unknown as Promise<ApiResponse<any>>,
  };

  if (hasStats) {
    api.getStats = () => apiClient.get(`${baseEndpoint}/statistics`);
  }
  return api;
}
