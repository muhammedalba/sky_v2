import { apiClient } from './client';
import { env } from '../env';
import { User, ApiResponse } from '@/types';

const ENDPOINTS = env.ENDPOINTS.AUTH;

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<ApiResponse<User>>(ENDPOINTS.LOGIN, credentials) as unknown as Promise<ApiResponse<User>>,
  refresh: (refreshToken: string) =>
    apiClient.get<ApiResponse<{ access_token: string }>>(ENDPOINTS.REFRESH || '/auth/refresh-token', {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }) as unknown as Promise<ApiResponse<{ access_token: string }>>,
  register: (data: FormData) =>
    apiClient.post<ApiResponse<User>>(ENDPOINTS.REGISTER, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as unknown as Promise<ApiResponse<User>>,
  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<void>>(ENDPOINTS.FORGOT_PASSWORD, { email }) as unknown as Promise<ApiResponse<void>>,
  verifyResetCode: (resetCode: string) =>
    apiClient.post<ApiResponse<void>>(ENDPOINTS.VERIFY_CODE, { resetCode }) as unknown as Promise<ApiResponse<void>>,
  resetPassword: (data: { email: string; password: string }) =>
    apiClient.patch<ApiResponse<void>>(ENDPOINTS.RESET_PASSWORD, data) as unknown as Promise<ApiResponse<void>>,
  me: () => apiClient.get<ApiResponse<User>>(ENDPOINTS.ME) as unknown as Promise<ApiResponse<User>>,
  logout: () => apiClient.post<ApiResponse<void>>(ENDPOINTS.LOGOUT) as unknown as Promise<ApiResponse<void>>,
  updateMe: (data: FormData) => {
    if (!ENDPOINTS.UPDATE_ME) throw new Error('Update me endpoint not configured');
    return apiClient.put(ENDPOINTS.UPDATE_ME, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (data: { password: string; confirmPassword: string }) => {
    if (!ENDPOINTS.CHANGE_PASSWORD) throw new Error('Change password endpoint not configured');
    return apiClient.patch(ENDPOINTS.CHANGE_PASSWORD, data);
  },
  getGoogleAuthUrl: () => `${env.API_URL}${ENDPOINTS.GOOGLE}`,
  getFacebookAuthUrl: () => `${env.API_URL}${ENDPOINTS.FACEBOOK}`,
};
