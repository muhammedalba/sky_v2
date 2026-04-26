import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { User, ApiResponse } from '@/types';
import { LoginResponseData } from './types';
import { AxiosRequestConfig } from 'axios';

const ENDPOINTS = env.ENDPOINTS.AUTH;

/**
 * Helper to handle typed requests because the apiClient interceptor 
 * returns response.data directly instead of the AxiosResponse object.
 */
const request = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get(url, config) as unknown as Promise<ApiResponse<T>>,
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.post(url, data, config) as unknown as Promise<ApiResponse<T>>,
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.patch(url, data, config) as unknown as Promise<ApiResponse<T>>,
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.put(url, data, config) as unknown as Promise<ApiResponse<T>>,
};

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    request.post<LoginResponseData>(ENDPOINTS.LOGIN, credentials),
    
  refresh: (refreshToken: string) =>
    request.get<{ access_token: string }>(ENDPOINTS.REFRESH || '/auth/refresh-token', {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),

  register: (data: FormData) =>
    request.post<LoginResponseData>(ENDPOINTS.REGISTER, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  forgotPassword: (email: string) =>
    request.post<void>(ENDPOINTS.FORGOT_PASSWORD, { email }),

  verifyResetCode: (resetCode: string) =>
    request.post<void>(ENDPOINTS.VERIFY_CODE, { resetCode }),

  resetPassword: (data: { email: string; password: string }) =>
    request.patch<void>(ENDPOINTS.RESET_PASSWORD, data),

  me: () => request.get<User>(ENDPOINTS.ME),

  logout: () => request.post<void>(ENDPOINTS.LOGOUT),

  updateMe: (data: FormData) => {
    if (!ENDPOINTS.UPDATE_ME) throw new Error('Update me endpoint not configured');
    return request.put<User>(ENDPOINTS.UPDATE_ME, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: (data: { password: string; confirmPassword: string }) => {
    if (!ENDPOINTS.CHANGE_PASSWORD) throw new Error('Change password endpoint not configured');
    return request.patch<void>(ENDPOINTS.CHANGE_PASSWORD, data);
  },

  getGoogleAuthUrl: () => `${env.API_URL}${ENDPOINTS.GOOGLE}`,
  getFacebookAuthUrl: () => `${env.API_URL}${ENDPOINTS.FACEBOOK}`,
};

