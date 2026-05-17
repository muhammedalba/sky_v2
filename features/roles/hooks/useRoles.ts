'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api';
import { Role } from '@/features/users/types';

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
