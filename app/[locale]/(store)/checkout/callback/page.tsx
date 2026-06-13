"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useClearCart } from "@/features/cart/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export default function CheckoutCallbackPage() {

  const searchParams = useSearchParams();
  
  // Extract provider payment ID (invoice_id or id)
  const invoiceId = searchParams.get("invoice_id") || searchParams.get("id");

  const { mutate: clearServerCart } = useClearCart();
  const clearGuestCart = useCartStore((state) => state.clearCart);

  // Poll backend for payment status securely
  const { data: verificationStatus } = useQuery({
    queryKey: ["payment-verification", invoiceId],
    queryFn: async () => {
      if (!invoiceId) throw new Error("No invoice ID found");
      const res = await apiClient.get(`/payments/verify/${invoiceId}`);
      return res.data;
    },
    enabled: !!invoiceId,
    refetchInterval: (query) => {
      // Poll every 3 seconds as long as we are verifying and status is still INITIATED/PENDING
      const status = query.state?.data?.paymentStatus;
      if (status === "PAID" || status === "FAILED" || !status) return false;
      return 3000;
    },
  });

  const paymentState = 
    verificationStatus?.paymentStatus === "PAID" ? "paid" :
    verificationStatus?.paymentStatus === "FAILED" ? "failed" :
    "verifying";

  useEffect(() => {
    if (paymentState === "paid") {
      clearServerCart();
      clearGuestCart();
    }
  }, [paymentState, clearServerCart, clearGuestCart]);

  // If no invoice ID was found in URL at all
  if (!invoiceId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Invalid Request</h1>
        <p className="text-muted-foreground mb-6">No payment reference was found in the URL.</p>
        <Link href="/checkout" className="w-full max-w-md bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 transition">
          Return to Checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
      <div className="max-w-md w-full p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border">
        
        {paymentState === "verifying" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
            <h1 className="text-2xl font-bold mb-3">Verifying Payment...</h1>
            <p className="text-muted-foreground">
              Please wait while we securely confirm your payment with the provider.
            </p>
          </div>
        )}

        {paymentState === "paid" && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. Your payment was processed successfully.
              <span className="block mt-2 text-sm">Order ID: {verificationStatus?.orderId}</span>
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/account"
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 transition"
              >
                View Orders
              </Link>
              <Link
                href="/products"
                className="w-full bg-accent text-accent-foreground py-3 rounded-full font-medium hover:bg-accent/80 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}

        {paymentState === "failed" && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">
              Unfortunately, your payment could not be securely verified or failed.
            </p>
            <Link
              href="/checkout"
              className="inline-block w-full bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 transition"
            >
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
