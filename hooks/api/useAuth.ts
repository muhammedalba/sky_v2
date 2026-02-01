'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { setAuthToken, setUser, removeAuthToken, setTokens } from '@/lib/auth';
import { User } from '@/types';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.auth.login(credentials);
      return response.data;
    },
    onSuccess: (data: { 
      access_token?: string; 
      token?: string; 
      accessToken?: string; 
      refresh_token?: string; 
      refreshToken?: string; 
      data?: { 
        token?: string; 
        accessToken?: string; 
        refreshToken?: string; 
        refresh_token?: string; 
        user?: User;
      }; 
      user?: User;
    }) => {
      const accessToken = data.access_token || data.token || data.accessToken || data.data?.token || data.data?.accessToken;
      const refreshToken = data.refresh_token || data.refreshToken || data.data?.refreshToken || data.data?.refresh_token;
      
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
      } else if (accessToken) {
        setAuthToken(accessToken);
      }
      
      const userData = data.data?.user || data.data || data.user;
      if (userData && 'role' in userData) {
        setUser(userData as User);
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.auth.me();
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
      return response.data;
    },
    onSuccess: (data: { 
      access_token?: string; 
      token?: string; 
      accessToken?: string; 
      refresh_token?: string; 
      refreshToken?: string; 
      data?: { 
        token?: string; 
        accessToken?: string; 
        refreshToken?: string; 
        refresh_token?: string; 
        user?: User;
      }; 
      user?: User;
    }) => {
      const accessToken = data.access_token || data.token || data.accessToken || data.data?.token || data.data?.accessToken;
      const refreshToken = data.refresh_token || data.refreshToken || data.data?.refreshToken || data.data?.refresh_token;
      
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
      } else if (accessToken) {
        setAuthToken(accessToken);
      }

      const userData = data.data?.user || data.data || data.user;
      if (userData && 'role' in userData) {
        setUser(userData as User);
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
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
    },
  });
}
