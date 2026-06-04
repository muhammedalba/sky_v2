"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckoutFormValues } from "../schemas/checkout.schema";
import { ActivePaymentMethod } from "../hooks/useCheckout";

interface CheckoutReviewStepProps {
  isAr: boolean;
  selectedCityName: string;
  selectedCountryName: string;
  selectedShippingProviderName: string;
  selectedPayment: ActivePaymentMethod | undefined;
  onBack: () => void;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
}

export function CheckoutReviewStep({
  isAr,
  selectedCityName,
  selectedCountryName,
  selectedShippingProviderName,
  selectedPayment,
  onBack,
  onPlaceOrder,
  isSubmitting,
}: CheckoutReviewStepProps) {
  const { control } = useFormContext<CheckoutFormValues>();
  const firstName = useWatch({ control, name: "firstName" });
  const lastName  = useWatch({ control, name: "lastName" });
  const street    = useWatch({ control, name: "street" });

  const paymentLabel = selectedPayment
    ? isAr
      ? selectedPayment.nameAr
      : selectedPayment.name
    : "—";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
        <h2 className="text-xl font-black text-foreground mb-4">
          {isAr ? "مراجعة البيانات" : "Review Details"}
        </h2>
        <div className="space-y-4 text-sm bg-muted/20 p-4 rounded-xl border border-border/40">

          {/* Name */}
          <div className="flex justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">{isAr ? "الاسم" : "Name"}</span>
            <span className="font-semibold">{firstName} {lastName}</span>
          </div>

          {/* Address */}
          <div className="flex justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">{isAr ? "العنوان" : "Address"}</span>
            <span className="font-semibold text-end">
              {street}, {selectedCityName}, {selectedCountryName}
            </span>
          </div>

          {/* Shipping */}
          <div className="flex justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">{isAr ? "طريقة الشحن" : "Shipping"}</span>
            <span className="font-semibold">{selectedShippingProviderName}</span>
          </div>

          {/* Payment */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isAr ? "طريقة الدفع" : "Payment"}</span>
            <span className="font-semibold">{paymentLabel}</span>
          </div>

        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-1/3 h-14 bg-muted text-foreground rounded-2xl font-bold text-base hover:bg-muted/80 transition-all disabled:opacity-50"
        >
          {isAr ? "رجوع" : "Back"}
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          {isSubmitting
            ? isAr ? "جارٍ التأكيد..." : "Confirming..."
            : isAr ? "تأكيد الطلب" : "Confirm Order"}
        </button>
      </div>
    </div>
  );
}
