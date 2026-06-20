"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckIcon as CheckCircle, AlertCircleIcon as XCircle, SpinnerIcon as Loader2 } from "@/shared/ui/Icons";
import { useClearCart } from "@/features/cart/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePaymentVerification } from "@/features/checkout/hooks/usePaymentVerification";

export default function CheckoutCallbackPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("cart.payment_pages.callback");
  
  // Extract provider payment ID (invoice_id or id)
  const invoiceId = searchParams.get("invoice_id") || searchParams.get("id");

  const { mutate: clearServerCart } = useClearCart();
  const clearGuestCart = useCartStore((state) => state.clearCart);

  // Poll backend for payment status securely
  const { data: verificationStatus } = usePaymentVerification(invoiceId);

  const paymentState = 
    verificationStatus?.paymentStatus === "PAID" ? "paid" :
    verificationStatus?.paymentStatus === "FAILED" ? "failed" :
    (verificationStatus?.paymentStatus === "EXPIRED" || verificationStatus?.orderStatus === "expired") ? "expired" :
    "verifying";

  useEffect(() => {
    if (paymentState === "paid") {
      clearServerCart();
      clearGuestCart();
      // Clean up sessionStorage used for Moyasar
      sessionStorage.removeItem("moyasar_order_id");
    }
  }, [paymentState, clearServerCart, clearGuestCart]);

  // If no invoice ID was found in URL at all
  if (!invoiceId) {
    return (
      <div className="min-h-screen bg-accent/30 flex flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
        <div className="bg-card p-8 rounded-3xl shadow-lg border border-border/50 max-w-md w-full">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-3">
            {t("invalid_request")}
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {t("no_reference")}
          </p>
          <Link href={`/${locale}/checkout`} className="block w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition">
            {t("return_to_checkout")}
          </Link>
        </div>
      </div>
    );
  }

  // Helper to safely format order ID for display
  const displayOrderId = verificationStatus?.orderId 
    ? `#${verificationStatus.orderId.slice(-6).toUpperCase()}`
    : "---";

  return (
    <div className="min-h-screen bg-accent/30 flex flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
      <div className="max-w-md w-full p-8 md:p-10 bg-card rounded-3xl shadow-xl border border-border/50 relative overflow-hidden">
        
        {paymentState === "verifying" && (
          <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-500">
            <Loader2 className="w-14 h-14 text-primary animate-spin mb-6" />
            <h1 className="text-2xl font-bold mb-3 text-foreground">
              {t("verifying_payment")}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("verifying_desc")}
            </p>
          </div>
        )}

        {paymentState === "paid" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-foreground">
              {t("payment_successful")}
            </h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              {t("payment_success_desc")}
              <span className="block mt-3 text-sm font-medium text-foreground bg-accent/50 py-2 rounded-lg">
                {t("order_id")} 
                <span className="tracking-wider">{displayOrderId}</span>
              </span>
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/${locale}/account/orders`}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition"
              >
                {t("view_orders")}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="w-full bg-accent text-foreground py-3.5 rounded-xl font-medium hover:bg-accent/80 transition"
              >
                {t("continue_shopping")}
              </Link>
            </div>
          </div>
        )}

        {paymentState === "failed" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-foreground">
              {t("payment_failed")}
            </h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              {t("payment_failed_desc")}
            </p>
            <Link
              href={`/${locale}/checkout`}
              className="inline-block w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition"
            >
              {t("try_again")}
            </Link>
          </div>
        )}

        {paymentState === "expired" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-foreground">
              {t("payment_expired")}
            </h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              {t("payment_expired_desc")}
            </p>
            <Link
              href={`/${locale}/checkout`}
              className="inline-block w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition"
            >
              {t("try_again")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
