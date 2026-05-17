'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api';
import { useToast } from '@/shared/hooks/useToast';
import { Role } from '@/features/users/types';
import { AxiosError } from 'axios';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rolesApi.getAll();
      console.log('from useRoles ',response.data);
      return response?.data;
    },
  });
}

export function usePermissionsList() {
  return useQuery({
    queryKey: ['permissions-list'],
    queryFn: async () => {
      const response = await rolesApi.getPermissionsList();
      console.log('from usePermissionsList ',response);
      return response.data;
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: Partial<Role>) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('تم إنشاء الدور بنجاح');
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<{message: string}>;
      toast.error(axiosError.response?.data?.message || 'فشل إنشاء الدور');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) => 
      rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('تم تحديث الدور بنجاح');
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<{message: string}>;
      toast.error(axiosError.response?.data?.message || 'فشل تحديث الدور');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('تم حذف الدور بنجاح');
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<{message: string}>;
      toast.error(axiosError.response?.data?.message || 'فشل حذف الدور');
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
