'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, User } from '@/types';
import { usersApi } from '@/features/users/api';

export function useUsers(params?: { page?: number; limit?: number; role?: string, keywords?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = (await usersApi.getAll(params)) as unknown as ApiResponse<User[]>;
      return response;
    },
    throwOnError: true,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = (await usersApi.getOne(id)) as unknown as ApiResponse<User>;
      return response.data;
    },
    enabled: !!id,
    throwOnError: true,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await usersApi.updateRole(id, role);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}
