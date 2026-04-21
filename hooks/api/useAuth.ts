'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import { setUser, removeAuthToken, setTokens, getRefreshToken } from '@/lib/auth';
import { User, ApiResponse } from '@/types';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.auth.login(credentials);
      console.log('login response', response);
      return response;
    },
    onSuccess: (response: ApiResponse<User>) => {
      const accessToken = response.access_token;
      if (accessToken) {
        setTokens(accessToken, getRefreshToken() || '');
      } 
      
      const userData = response.data;
      if (userData && 'role' in userData) {
        setUser(userData as User);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const response = (await api.auth.me()) as unknown as ApiResponse<User>;
      return response.data;
    },
    retry: false,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.auth.register(data);
      return response;
    },
    onSuccess: (response: ApiResponse<User>) => {
      const accessToken = response.access_token;
      
      if (accessToken) {
        setTokens(accessToken, getRefreshToken() || '');
      }

      const userData = response.data;
      if (userData && 'role' in userData) {
        setUser(userData as User);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.auth.forgotPassword(email);
      return response.data;
    },
  });
}

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: async (resetCode: string) => {
      const response = await api.auth.verifyResetCode(resetCode);
      return response.data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.auth.resetPassword(data);
      return response.data;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.auth.logout();
    },
    onSettled: () => {
      removeAuthToken();
      queryClient.clear();
      window.location.href = '/en/login';
    },
  });
}
