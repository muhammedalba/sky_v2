"use client";

import { useState, useCallback } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { locationsApi, checkoutApi } from "../api";
import { useToast } from "@/shared/hooks/useToast";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

// ─── Locations hooks ──────────────────────────────────────────────────────────

// Shared type for countries, regions, and cities returned by the locations API
export interface LocationItem {
  _id: string;
  name: string | { ar: string; en: string };
  [key: string]: unknown;
}

export function useCountries() {
  return useQuery({
    queryKey: ["locations", "countries"],
    queryFn: async () => {
      const res = await locationsApi.getCountries();
      return (res.data?.data ?? res.data ?? []) as LocationItem[];
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
      return (res.data?.data ?? res.data ?? []) as LocationItem[];
    },
    enabled: !!regionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Payment methods ──────────────────────────────────────────────────────────

import { useSettings } from "@/app/providers/SettingsProvider";
import { useMemo } from "react";

export interface ActivePaymentMethod {
  _id: string;        // same as code — sent to backend as paymentMethodId
  code: string;       // "stripe" | "paypal" | "banktransfer" | "cod"
  name: string;       // English display name
  nameAr: string;     // Arabic display name
  description: string;
  descriptionAr: string;
  type: "electronic" | "offline";
  fees: number;
  color: string;      // Tailwind bg color class for the card accent
  badge?: string;     // optional badge text
}

const ALL_METHODS: ActivePaymentMethod[] = [
  {
    _id: "stripe",
    code: "stripe",
    name: "Credit / Debit Card",
    nameAr: "بطاقة ائتمان / بطاقة مدى",
    description: "Pay securely with Visa, Mastercard or Mada via Stripe",
    descriptionAr: "ادفع بأمان عبر Stripe باستخدام فيزا أو ماستركارد أو مدى",
    type: "electronic",
    fees: 0,
    color: "from-indigo-500/10 to-violet-500/10",
    badge: "Stripe",
  },
  {
    _id: "moyasar",
    code: "moyasar",
    name: "Credit Card / Apple Pay (Moyasar)",
    nameAr: "البطاقة الائتمانية / أبل باي (ميسر)",
    description: "Pay securely using Mada, Visa, MasterCard, or Apple Pay",
    descriptionAr: "ادفع بأمان عبر مدى، فيزا، ماستركارد، أو أبل باي",
    type: "electronic",
    fees: 0,
    color: "from-teal-500/10 to-emerald-500/10",
    badge: "Moyasar",
  },
  {
    _id: "paypal",
    code: "paypal",
    name: "PayPal",
    nameAr: "PayPal",
    description: "Pay with your PayPal account or card via PayPal",
    descriptionAr: "ادفع عبر حسابك في PayPal أو ببطاقتك الائتمانية",
    type: "electronic",
    fees: 0,
    color: "from-blue-500/10 to-sky-500/10",
    badge: "PayPal",
  },
  {
    _id: "banktransfer",
    code: "banktransfer",
    name: "Bank Transfer",
    nameAr: "تحويل بنكي",
    description: "Transfer to our account and upload the receipt",
    descriptionAr: "حوّل المبلغ لحسابنا البنكي وأرفق إيصال التحويل",
    type: "offline",
    fees: 0,
    color: "from-amber-500/10 to-orange-500/10",
  },
  {
    _id: "cod",
    code: "cod",
    name: "Cash on Delivery",
    nameAr: "الدفع عند الاستلام",
    description: "Pay with cash when your order arrives",
    descriptionAr: "ادفع نقداً عند استلام طلبك",
    type: "offline",
    fees: 0,
    color: "from-green-500/10 to-emerald-500/10",
  },
];

export function useActivePaymentMethods() {
  const settings = useSettings();

  const methods = useMemo(() => {
    const gateways = settings?.gateways ?? {};
    return ALL_METHODS.filter((m) => {
      if (m.code === "moyasar") return true; // Enabled by default as implemented
      if (m.code === "stripe") return !!gateways.stripe;
      if (m.code === "paypal") return !!gateways.paypal;
      if (m.code === "banktransfer") return !!gateways.bankTransfer;
      if (m.code === "cod") return !!gateways.cod;
      return false;
    });
  }, [settings]);

  return { data: methods, isLoading: false };
}

// ─── Checkout Orchestrator Hooks ──────────────────────────────────────────────

export function useCheckoutSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["checkout", "summary"],
    queryFn: async () => {
      const res = await checkoutApi.getSummary();  
      return res.data;
    },
    // Don't cache checkout summary as it changes based on user interactions
    staleTime: 0,
    ...options,
  });
}

export function useSetAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: Record<string, unknown>) => {
      const res = await checkoutApi.setAddress(address);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "summary"] });
    },
  });
}

export function useSetShippingMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shippingProviderId: string) => {
      const res = await checkoutApi.setShippingMethod(shippingProviderId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "summary"] });
    },
  });
}

export function useSetPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const res = await checkoutApi.setPaymentMethod(paymentMethodId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "summary"] });
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (couponCode: string) => {
      const res = await checkoutApi.applyCoupon(couponCode);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout", "summary"] });
    },
  });
}

// ─── Place order ──────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const toast = useToast();
  const router = useRouter();
  const locale = useLocale();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await checkoutApi.placeOrder(data);
      return res.data;
    },
    onSuccess: (data) => {
      const resData = data?.data || data;
      const orderId = resData?.orderId || resData?._id;
      const methodCode = resData?.methodCode;

      toast.success(locale === "ar" ? "تم تقديم طلبك بنجاح!" : "Order placed successfully!");

      if ((methodCode === "paypal" || methodCode === "moyasar") && resData?.approvalUrl) {
        window.location.href = resData.approvalUrl;
      } else if (methodCode === "stripe" && resData?.client_secret) {
        router.push(`/${locale}/checkout/payment?orderId=${orderId}&client_secret=${resData.client_secret}`);
      } else {
        if (orderId) {
          router.push(`/${locale}/account/orders/${orderId}`);
        } else {
          router.push(`/${locale}/account/orders`);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (locale === "ar" ? "فشل تقديم الطلب" : "Failed to place order"));
    },
  });
}

// ─── Checkout Flow Orchestrator ───────────────────────────────────────────────

export function useCheckoutFlow() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = useCallback(() => setCurrentStep((p: number) => Math.min(p + 1, 2)), []);
  const prevStep = useCallback(() => setCurrentStep((p: number) => Math.max(p - 1, 0)), []);
  // /checkout/address
  const { mutateAsync: setAddressAsync, isPending: settingAddress } = useSetAddress();
  // /checkout/shipping-method
  const { mutateAsync: setShippingMethodAsync, isPending: settingShipping } = useSetShippingMethod();
  // /checkout/payment-method
  const { mutateAsync: setPaymentMethodAsync, isPending: settingPayment } = useSetPaymentMethod();
  // /checkout/coupon
  const { mutateAsync: applyCouponAsync, isPending: applyingCoupon } = useApplyCoupon();
  // /checkout/place-order
  const { mutateAsync: placeOrderAsync, isPending: placingOrder } = usePlaceOrder();

  const submitAddress = async (data: Record<string, unknown>, onSuccess?: () => void, onError?: (err: unknown) => void) => {
    try {
      await setAddressAsync(data);
      if (onSuccess) onSuccess();
      nextStep();
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const selectShipping = async (id: string) => {
    await setShippingMethodAsync(id);
  };

  const selectPayment = async (id: string) => {
    await setPaymentMethodAsync(id);
  };

  const applyCoupon = async (code: string, onSuccess?: (res: unknown) => void, onError?: (err: unknown) => void) => {
    try {
      const res = await applyCouponAsync(code);
      if (onSuccess) onSuccess(res);
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const placeOrder = async (data: FormData) => {
    return placeOrderAsync(data);
  };

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    submitAddress,
    selectShipping,
    selectPayment,
    applyCoupon,
    placeOrder,
    isSubmitting: settingAddress || settingShipping || settingPayment || applyingCoupon || placingOrder,
  };
}
