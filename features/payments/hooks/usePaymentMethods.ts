import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPaymentsApi } from "@/features/payments/payments.api";
import { PaymentMethodFormValues } from "@/features/payments/payments.schema";
import { ApiResponse } from "@/types";
import { PaymentMethodRow } from "../types";

export function useAdminPaymentMethods(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["admin-payment-methods", params],
    queryFn: async () => {
      const response = await adminPaymentsApi.getAll(params);
      return response as unknown as ApiResponse<PaymentMethodRow[]>;
    },
  });
}

export function useAdminPaymentMethod(id: string) {
  return useQuery({
    queryKey: ["admin-payment-methods", id],
    queryFn: async () => {
      const response = await adminPaymentsApi.getOne(id);
      return (response as unknown as ApiResponse<PaymentMethodRow>).data;
    },
    enabled: !!id,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaymentMethodFormValues) => {
      const response = await adminPaymentsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-methods"] });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PaymentMethodFormValues>;
    }) => {
      const response = await adminPaymentsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-methods"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-payment-methods", variables.id],
      });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminPaymentsApi.delete(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-methods"] });
    },
  });
}
