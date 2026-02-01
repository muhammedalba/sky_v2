import { apiClient } from './client';

const ENDPOINTS = {
  LOGIN: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_LOGIN || '/auth/login',
  REGISTER: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_REGISTER || '/auth/register',
  FORGOT_PASSWORD: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_FORGOT_PASSWORD || '/auth/forgot-password',
  VERIFY_CODE: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_VERIFY_CODE || '/auth/verify-Pass-Reset-Code',
  RESET_PASSWORD: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_RESET_PASSWORD || '/auth/reset-password',
  ME: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_ME || '/auth/me-profile',
  LOGOUT: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_LOGOUT || '/auth/logout',
  UPDATE_ME: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_UPDATE_ME || '/auth/updateMe',
  CHANGE_PASSWORD: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_CHANGE_PASSWORD || '/auth/changeMyPassword',
  GOOGLE: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_GOOGLE || '/auth/google',
  FACEBOOK: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_FACEBOOK || '/auth/facebook',
  REFRESH: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_REFRESH || '/auth/refresh-token',
};

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post(ENDPOINTS.LOGIN, credentials),
  refresh: (refreshToken: string) =>
    apiClient.get(ENDPOINTS.REFRESH, {
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
  updateMe: (data: FormData) =>
    apiClient.put(ENDPOINTS.UPDATE_ME, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (data: { password: string; confirmPassword: string }) =>
    apiClient.patch(ENDPOINTS.CHANGE_PASSWORD, data),
  getGoogleAuthUrl: () => `${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.GOOGLE}`,
  getFacebookAuthUrl: () => `${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.FACEBOOK}`,
};
