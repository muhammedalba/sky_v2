"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useLocale, useTranslations } from "next-intl";

import { useToast } from "@/shared/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { ShieldCheckIcon, CreditCardIcon, AlertCircleIcon } from "lucide-react";

declare global {
  interface Window {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    Moyasar?: any;
  }
}

export default function MoyasarCheckoutPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("cart.payment_pages.moyasar");
  const toast = useToast();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderAmount, setOrderAmount] = useState<number | null>(null);
  const [orderCurrency, setOrderCurrency] = useState<string>("SAR");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const hasFetched = useRef(false);
  const hasInitialized = useRef(false);

  // 1. Get orderId from session storage on mount
  useEffect(() => {
    const storedOrderId = sessionStorage.getItem("moyasar_order_id");
    if (!storedOrderId) {
      router.replace(`/checkout`);
      return;
    }
    setOrderId(storedOrderId);
  }, [router]);

  // 2. Fetch order details to know the amount
  useEffect(() => {
    if (!orderId) return;

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/order/${orderId}`);
        const order = res?.data;
        if (order && order.grandTotal) {
          setOrderAmount(order.grandTotal);
          setOrderCurrency(order.currency || "SAR");
        } else {
          throw new Error("Order details missing");
        }
      } catch {
        setError(t("failed_to_load_order"));
        toast.error(t("failed_to_load_order"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, locale, t, toast]);

  // 3. Initialize Moyasar once script is loaded and amount is ready
  useEffect(() => {
    if (isScriptLoaded && orderAmount !== null && orderId && !error) {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY;
      
      if (!publishableKey) {
        toast.error("Payment configuration error.");
        return;
      }

      const amountInHalalas = Math.round(orderAmount * 100);
      let currencyCode = (orderCurrency || 'SAR').toUpperCase().trim();
      if (currencyCode === 'ر.س' || currencyCode === 'ر.س.') {
        currencyCode = 'SAR';
      }

      const Moyasar = window.Moyasar;

      if (Moyasar) {
        try {
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
              timestamp: Date.now().toString(),
            },
            on_completed: function() {
              return new Promise((resolve) => {
                resolve(true);
              });
            }
          });
        } catch {
          setError(t("failed_to_init"));
        }
      }
    }
  }, [isScriptLoaded, orderAmount, orderCurrency, orderId, locale, toast, error, t]);

  if (error) {
    return (
      <div className="min-h-screen pt-40 pb-20 bg-accent/30 flex flex-col items-center justify-center px-4">
        <div className="bg-card p-8 rounded-3xl shadow-lg text-center max-w-md w-full border border-border/50">
          <AlertCircleIcon className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3 text-foreground">{t("payment_error")}</h2>
          <p className="text-muted-foreground mb-8 text-sm">{error}</p>
          <button 
            onClick={() => router.push(`/${locale}/checkout`)}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium transition-colors hover:bg-primary/90"
          >
            {t("return_to_checkout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-20 bg-accent/30 flex flex-col items-center">
      {/* App Router specific way to hoist external CSS to <head> without hydration warnings */}
      <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.14.0/moyasar.css" precedence="default" />
      
      <Script 
        src="https://cdn.moyasar.com/mpf/1.14.0/moyasar.js" 
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div className="container max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 title-gradient">
            {t("secure_payment")}
          </h1>
          <p className="text-muted-foreground">
            {t("secure_payment_desc")}
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 min-h-[400px] flex flex-col relative overflow-hidden">
          
          {isLoading && (
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-5 font-medium text-muted-foreground animate-pulse">
                {t("preparing_gateway")}
              </p>
            </div>
          )}

          {!isLoading && orderAmount !== null && (
            <>
              {/* Order Summary Header */}
              <div className="flex flex-col items-center pb-8 mb-8 border-b border-border/60">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                  <CreditCardIcon className="w-7 h-7" />
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-2">
                  {t("total_amount")}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-foreground tracking-tight">
                    {orderAmount.toFixed(2)}
                  </span>
                  <span className="text-lg font-medium text-muted-foreground">
                    {orderCurrency}
                  </span>
                </div>
              </div>
              
              {/* Form Container */}
              <div className="mysr-form-wrapper">
                <div className="mysr-form"></div>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex items-center justify-center gap-2.5 text-xs text-muted-foreground bg-accent/50 py-3.5 px-4 rounded-xl">
                <ShieldCheckIcon className="w-4 h-4 text-success" />
                <span className="font-medium">
                  {t("secure_ssl_msg")}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
