import { apiClient } from './client';
import { env } from '../env';

const ENDPOINTS = env.ENDPOINTS.AUTH;

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post(ENDPOINTS.LOGIN, credentials),
  refresh: (refreshToken: string) =>
    apiClient.get(ENDPOINTS.REFRESH || '/auth/refresh-token', {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),
  register: (data: FormData) =>
    apiClient.post(ENDPOINTS.REGISTER, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  forgotPassword: (email: string) =>
    apiClient.post(ENDPOINTS.FORGOT_PASSWORD, { email }),
  verifyResetCode: (resetCode: string) =>
    apiClient.post(ENDPOINTS.VERIFY_CODE, { resetCode }),
  resetPassword: (data: { email: string; password: string }) =>
    apiClient.patch(ENDPOINTS.RESET_PASSWORD, data),
  me: () => apiClient.get(ENDPOINTS.ME),
  logout: () => apiClient.post(ENDPOINTS.LOGOUT),
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
