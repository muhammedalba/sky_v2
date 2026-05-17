'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';
import { LoginResponseData } from '@/features/auth/types';
import { authApi } from '@/features/auth/api';
import { useToast } from '@/shared/hooks/useToast';


export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }): Promise<LoginResponseData> => {
      const response = await authApi.login(credentials);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useMe() {
  let isLoggedInCookie = false;
  if (typeof document !== 'undefined') {
    isLoggedInCookie = document.cookie.includes('is_logged_in=true');
  }

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const response = await authApi.me();
      return response.data;
    },
    enabled: isLoggedInCookie,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      return authApi.register(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
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
      queryClient.clear();
      const locale = getCurrentLocale();
      window.location.href = `/${locale}/login`;
      toast.success("تم تسجيل الخروج بنجاح");
    },
  });
}

export function useAuth() {
  const { data: user, isLoading } = useMe();
  const { mutate: logout } = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}


