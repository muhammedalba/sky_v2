"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { locationsApi, paymentsApi, checkoutApi, orderApi, CheckoutPreviewPayload } from "../api";
import { useToast } from "@/shared/hooks/useToast";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

// ─── Locations hooks ──────────────────────────────────────────────────────────

export function useCountries() {
  return useQuery({
    queryKey: ["locations", "countries"],
    queryFn: async () => {
      const res = await locationsApi.getCountries();
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegions(countryId: string | null) {
  return useQuery({
    queryKey: ["locations", "regions", countryId],
    queryFn: async () => {
      const res = await locationsApi.getRegions(countryId!);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCities(regionId: string | null) {
  return useQuery({
    queryKey: ["locations", "cities", regionId],
    queryFn: async () => {
      const res = await locationsApi.getCities(regionId!);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!regionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Payment methods ──────────────────────────────────────────────────────────

export function useActivePaymentMethods() {
  return useQuery({
    queryKey: ["payments", "active"],
    queryFn: async () => {
      const res = await paymentsApi.getActiveMethods();
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Checkout preview ─────────────────────────────────────────────────────────

export function useCheckoutPreview() {
  return useMutation({
    mutationFn: async (payload: CheckoutPreviewPayload) => {
      const res = await checkoutApi.preview(payload);
      return res.data;
    },
  });
}

// ─── Place order ──────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const toast = useToast();
  const router = useRouter();
  const locale = useLocale();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await orderApi.placeOrder(data);
      return res.data;
    },
    onSuccess: (data) => {
      const orderId = data?.data?._id ?? data?._id;
      toast.success(locale === "ar" ? "تم تقديم طلبك بنجاح!" : "Order placed successfully!");
      if (orderId) {
        router.push(`/${locale}/account/orders/${orderId}`);
      } else {
        router.push(`/${locale}/account/orders`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (locale === "ar" ? "فشل تقديم الطلب" : "Failed to place order"));
    },
  });
}

export function useBankTransferOrder() {
  const toast = useToast();
  const router = useRouter();
  const locale = useLocale();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await orderApi.payByBankTransfer(data);
      return res.data;
    },
    onSuccess: (data) => {
      const orderId = data?.data?._id ?? data?._id;
      toast.success(locale === "ar" ? "تم تقديم طلبك! سيتم مراجعة التحويل." : "Order submitted! Transfer will be reviewed.");
      if (orderId) {
        router.push(`/${locale}/account/orders/${orderId}`);
      } else {
        router.push(`/${locale}/account/orders`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (locale === "ar" ? "فشل إرسال الطلب" : "Failed to submit order"));
    },
  });
}
