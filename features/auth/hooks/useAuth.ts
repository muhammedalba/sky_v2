'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';
import { setUser, removeAuthToken, setTokens, getRefreshToken } from '@/lib/auth';
import { User, ApiResponse, ApiError } from '@/types';
import { LoginResponseData } from '@/features/auth/types';
import { authApi } from '@/features/auth/api';
import { useToast } from '@/shared/hooks/useToast';

/**
 * Processes a successful auth response (login or register).
 * Extracts and stores the access token and user data.
 */
function handleAuthSuccess(response: ApiResponse<LoginResponseData>, queryClient: ReturnType<typeof useQueryClient>) {


  const accessToken = response.data?.access_token;
  if (accessToken) {
    setTokens(accessToken, getRefreshToken() || '');
  }

  const userData = response.data;
  if (userData) {
    const { access_token: _, ...user } = userData;
    setUser(user as User);
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return authApi.login(credentials);
    },
    onSuccess: (response: ApiResponse<LoginResponseData>) => {
      handleAuthSuccess(response, queryClient);
      toast.success(response?.message || "تم تسجيل الدخول بنجاح");
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "حدث خطأ");

    }
  });
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const response = (await authApi.me()) as unknown as ApiResponse<User>;
      return response.data;
    },
    retry: false,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      return authApi.register(data);
    },
    onSuccess: (response: ApiResponse<LoginResponseData>) => {
      handleAuthSuccess(response, queryClient);
      toast.success(response?.message || "تم تسجيل الدخول بنجاح");
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "حدث خطأ");

    }
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await authApi.forgotPassword(email);
      return response.data;
    },
    
  });
}

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: async (resetCode: string) => {
      const response = await authApi.verifyResetCode(resetCode);
      return response.data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await authApi.resetPassword(data);
      return response.data;
    },
  });
}

/**
 * Detects the current locale from the URL path.
 * Falls back to 'en' if detection fails.
 */
function getCurrentLocale(): string {
  if (typeof window === 'undefined') return 'en';
  const pathSegment = window.location.pathname.split('/')[1];
  const isValidLocale = pathSegment && ['en', 'ar'].includes(pathSegment);
  return isValidLocale ? pathSegment : 'en';
}

export function useLogout() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSettled: () => {
      removeAuthToken();
      queryClient.clear();
      const locale = getCurrentLocale();
      window.location.href = `/${locale}/login`;
      toast.success("تم تسجيل الخروج بنجاح");
    },
  });
}

