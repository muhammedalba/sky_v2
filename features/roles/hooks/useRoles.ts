'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { rolesApi } from '../api';
import { Role } from '@/features/users/types';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rolesApi.getAll();
      return response?.data;
    },
  });
}

export function usePermissionsList() {
  // تضمين اللغة في queryKey لإعادة جلب البيانات المترجمة عند تغيير اللغة
  const locale = useLocale();
  return useQuery({
    queryKey: ['permissions-list', locale],
    queryFn: async () => {
      const response = await rolesApi.getPermissionsList();
      return response.data;
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Role>) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) => 
      rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useMyPermissions() {
  return useQuery({
    queryKey: ['my-permissions'],
    queryFn: async () => {
      const response = await rolesApi.getMyPermissions();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
