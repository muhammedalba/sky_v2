"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useLocale } from "next-intl";

import { useToast } from "@/shared/hooks/useToast";
import { apiClient } from "@/lib/api/client";

export default function MoyasarCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const toast = useToast();

  const orderId = searchParams.get("orderId");
  
  const [orderAmount, setOrderAmount] = useState<number | null>(null);
  const [orderCurrency, setOrderCurrency] = useState<string>("SAR");
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const hasFetched = useRef(false);
  const hasInitialized = useRef(false);

  // 1. Fetch order details to know the amount
  useEffect(() => {
    if (!orderId) {
      router.push(`/${locale}/checkout`);
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/order/${orderId}`);
        console.log("res", res);
        const order = res.data?.data || res.data;
        if (order && order.grandTotal) {
          setOrderAmount(order.grandTotal);
          setOrderCurrency(order.currency || "SAR");
        } else {
          throw new Error("Order details missing");
        }
      } catch (error) {
        console.error("Failed to load order details", error);
        toast.error("Failed to load order details");
        router.push(`/${locale}/checkout`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // 2. Initialize Moyasar once script is loaded and amount is ready
  useEffect(() => {
    if (isScriptLoaded && orderAmount !== null && orderId) {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY;
      
      if (!publishableKey) {
        console.error("Moyasar Publishable Key is missing in environment variables.");
        toast.error("Payment configuration error. Please contact support.");
        return;
      }

      const amountInHalalas = Math.round(orderAmount * 100);
      let currencyCode = (orderCurrency || 'SAR').toUpperCase().trim();
      if (currencyCode === 'ر.س' || currencyCode === 'ر.س.') {
        currencyCode = 'SAR';
      }

      // Ensure Moyasar is available globally
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const Moyasar = (window as any).Moyasar;

      if (Moyasar) {
        try {
          console.log("Initializing Moyasar with:", {
            amount: amountInHalalas,
            currency: currencyCode,
            description: `Order ${orderId}`,
            publishable_api_key: publishableKey,
          });
          Moyasar.init({
            element: '.mysr-form',
            amount: amountInHalalas,
            currency: currencyCode,
            description: `Order ${orderId}`,
            publishable_api_key: publishableKey,
            callback_url: `${window.location.origin}/${locale}/checkout/callback`,
            methods: ['creditcard', 'stcpay'],
           supported_networks: ['visa', 'mastercard', 'mada', 'amex', 'unionpay'],
            metadata: {
              orderId,
            },
            on_completed: function() {
              return new Promise((resolve) => {
                resolve(true);
              });
            }
          });
        } catch (err) {
          console.error("Moyasar init error:", err);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScriptLoaded, orderAmount, orderCurrency, orderId]);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background flex flex-col items-center">
      {/* Load Moyasar CSS */}
      <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.14.0/moyasar.css" />
      
      {/* Load Moyasar JS */}
      <Script 
        src="https://cdn.moyasar.com/mpf/1.14.0/moyasar.js" 
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div className="container max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold mb-8 text-center">
          {locale === "ar" ? "إتمام الدفع" : "Complete Payment"}
        </h1>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col justify-center relative">
          
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 rounded-xl">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground animate-pulse">
                {locale === "ar" ? "جاري تحميل تفاصيل الدفع..." : "Loading payment details..."}
              </p>
            </div>
          )}

          {!isLoading && orderAmount !== null && (
            <>
              <div className="mb-6 text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {locale === "ar" ? "المبلغ المطلوب" : "Total Amount"}
                </p>
                <div className="text-3xl font-bold text-foreground mt-1">
                  {orderAmount.toFixed(2)} {orderCurrency}
                </div>
              </div>
              
              {/* Moyasar Form Container */}
              <div className="mysr-form"></div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
