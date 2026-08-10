"use client";

import React, { useMemo, useCallback } from "react";
import {
  TruckIcon as Truck,
  CheckIcon as CheckCircle,
  UploadIcon as Upload,
  AlertCircleIcon as AlertCircle,
  InfoIcon as Info,
  ArrowRightIcon as ArrowRight,
  SpinnerIcon as Loader2,
  BanknoteIcon as Banknote,
  ShieldCheckIcon as ShieldCheck,
  ClockIcon as Clock,
} from "@/shared/ui/Icons";
import { useTranslations } from "next-intl";
import { useTrans } from "@/shared/hooks/useTrans";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { ActivePaymentMethod } from "../constants/paymentMethods";
import { getPaymentIcon, getGatewayBadgeStyle } from "../utils/payment";

/* ─── Interfaces ─────────────────────────────────────────────────────────────── */

interface ShippingOption {
  providerId: string;
  providerName: string;
  rateId: string;
  estimatedDays: number;
  totalShippingCost: number;
  supportsCOD: boolean;
}

interface CheckoutShippingPaymentStepProps {
  onBack: () => void;
  onNext: () => void;
  summaryLoading: boolean;
  shippingOptions: ShippingOption[];
  paymentMethods: ActivePaymentMethod[];
  selectedShippingId: string;
  handleShippingChange: (id: string) => void;
  selectedPaymentId: string;
  selectedPayment: ActivePaymentMethod | undefined;
  handlePaymentChange: (id: string) => void;
  isCODSupportedByCarrier: boolean;
  formatCurrency: (n: number) => string;
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
  isValid: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function CheckoutShippingPaymentStep({
  summaryLoading,
  shippingOptions,
  paymentMethods,
  selectedShippingId,
  handleShippingChange,
  selectedPaymentId,
  selectedPayment,
  handlePaymentChange,
  isCODSupportedByCarrier,
  formatCurrency,
  receiptFile,
  setReceiptFile,
  onBack,
  onNext,
  isValid,
}: CheckoutShippingPaymentStepProps) {
  const t = useTranslations("cart");
  const getTrans = useTrans();
  const { data: settings } = useSettings();

  // ─── 1. تحسين الأداء (Performance Optimization) ─────────────────────────────
  // نستخدم useMemo لتجنب إعادة حساب هذه القيم إلا إذا تغيرت التبعيات (Dependencies) الخاصة بها.

  const selectedCode = useMemo(
    () => selectedPayment?.code ?? "",
    [selectedPayment],
  );
  const isBankTransfer = useMemo(
    () => selectedCode === "banktransfer",
    [selectedCode],
  );

  // شرط التقدم للخطوة التالية: يجب أن يكون النموذج صالحاً، وإذا كان الدفع تحويلاً بنكياً يجب إرفاق الإيصال
  const canProceed = useMemo(() => {
    return isValid && (!isBankTransfer || !!receiptFile);
  }, [isValid, isBankTransfer, receiptFile]);

  // ─── 2. دوال التعامل مع الأحداث (Event Handlers) المخبأة (Memoized) ───────

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // التحقق الآمن من وجود الملف وتجنب الأخطاء في حال إلغاء المستخدم لعملية الرفع
      const file = e.target.files?.[0] || null;
      setReceiptFile(file);
    },
    [setReceiptFile],
  );

  const handleFileRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); // منع تفعيل الـ label الأصلي الذي يفتح نافذة اختيار الملفات
      setReceiptFile(null);
    },
    [setReceiptFile],
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ─── خيارات الشحن (Shipping Options) ───────────────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground">
            {t("shipping_payment.shipping_method")}
          </h2>
        </div>

        {summaryLoading &&
        (!shippingOptions || shippingOptions.length === 0) ? (
          <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">
              {t("shipping_payment.calculating_shipping")}
            </span>
          </div>
        ) : (
          <div className="grid gap-4"> 
            {shippingOptions?.map((option,i) => (
              <label
                key={`${i}-${option.providerName}`}
                className={`relative flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  selectedShippingId === option.providerId
                    ? "border-primary/40 bg-primary/5 "
                    : "border-border/60 hover:border-primary/60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="shippingProvider"
                    value={option.providerId}
                    checked={selectedShippingId === option.providerId}
                    // يتم تمرير الدالة باستخدام كلوجر مباشر لتبسيط الكود، لأنها تعتمد على الـ id الخاص بالعنصر
                    onChange={() => handleShippingChange(option.providerId)}
                    className="w-4 h-4 text-primary focus:ring-primary/50"
                  />
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {option.providerName}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {t("shipping_payment.est_delivery")}{" "}
                        {option.estimatedDays} {t("shipping_payment.days")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="font-bold text-foreground shrink-0 text-right">
                  {option.totalShippingCost > 0
                    ? formatCurrency(option.totalShippingCost)
                    : t("shipping_payment.free")}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ─── طرق الدفع (Payment Methods) ───────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <Banknote className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground">
            {t("shipping_payment.payment_method")}
          </h2>
        </div>

        {summaryLoading && (!paymentMethods || paymentMethods.length === 0) ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : paymentMethods?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("shipping_payment.no_payment_methods")}
          </div>
        ) : (
          <div className="grid gap-3">
            {paymentMethods?.map((method) => {
              const isCOD = method.code.toLowerCase() === "cod";
              const disabled = isCOD && !isCODSupportedByCarrier;
              const isSelected = selectedPaymentId === method._id;

              return (
                <label
                  key={method._id}
                  className={`relative flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                    disabled
                      ? "opacity-50 cursor-not-allowed border-border/30 bg-muted/20"
                      : isSelected
                        ? "border-primary shadow-md shadow-primary/10"
                        : "border-border/50 hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method._id}
                      disabled={disabled}
                      checked={isSelected}
                      onChange={() => handlePaymentChange(method._id)}
                      className="w-4 h-4 text-primary focus:ring-primary/50"
                    />
                  </div>

                  <div className="relative shrink-0  rounded-xl flex items-center justify-center">
                    {getPaymentIcon(method.provider)}
                  </div>

                  <div className="relative flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-foreground">
                        {getTrans(method.name)}
                      </h3>
                      {method.code && (
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md tracking-wide ${getGatewayBadgeStyle(method.code)}`}
                        >
                          {method.code}
                        </span>
                      )}
                      {method.feeType === "fixed" && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          +{formatCurrency(method.fixedFee)}
                        </span>
                      )}
                      {method.feeType === "percentage" && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          +{method.percentageFee}%
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs mt-0.5 leading-relaxed ${
                        isSelected
                          ? "text-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {getTrans(method.description)}
                    </p>

                    {disabled && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {t("shipping_payment.carrier_no_cod")}
                      </p>
                    )}

                    {isSelected && method.type === "electronic" && (
                      <p className="text-[11px] text-primary/80 mt-1.5 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        {t("shipping_payment.secure_encrypted_payment")}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── التحويل البنكي (Bank Transfer) ──────────────────────────── */}
      {isBankTransfer && (
        <div className="bg-accent rounded-3xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Upload className="w-5 h-5 text-info" />
            {t("shipping_payment.upload_receipt")}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {t("shipping_payment.upload_receipt_desc")}
          </p>

          {settings?.bankTransferDetails && (
            <div className="mb-6 p-4 bg-background border  rounded-xl space-y-2">
              <h3 className="font-semibold text-sm mb-3 text-info">
                {t("shipping_payment.bank_details_title", {
                  fallback: "معلومات الحساب البنكي",
                })}
              </h3>
              {settings.bankTransferDetails.bankName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("shipping_payment.bank_name", {
                      fallback: "اسم البنك:",
                    })}
                  </span>
                  <span className="font-medium">
                    {settings.bankTransferDetails.bankName}
                  </span>
                </div>
              )}
              {settings.bankTransferDetails.accountName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("shipping_payment.account_name", {
                      fallback: "اسم الحساب:",
                    })}
                  </span>
                  <span className="font-medium">
                    {settings.bankTransferDetails.accountName}
                  </span>
                </div>
              )}
              {settings.bankTransferDetails.accountNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("shipping_payment.account_number", {
                      fallback: "رقم الحساب:",
                    })}
                  </span>
                  <span className="font-medium" dir="ltr">
                    {settings.bankTransferDetails.accountNumber}
                  </span>
                </div>
              )}
              {settings.bankTransferDetails.iban && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("shipping_payment.iban", { fallback: "الآيبان:" })}
                  </span>
                  <span className="font-medium" dir="ltr">
                    {settings.bankTransferDetails.iban}
                  </span>
                </div>
              )}
            </div>
          )}

          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-foreground/20   rounded-2xl p-6 cursor-pointer hover:bg-info/20 transition-all">
            <input
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={handleFileUpload}
            />
            {receiptFile ? (
              <>
                <CheckCircle className="w-8 h-8 text-success" />
                <p className="text-sm font-semibold text-foreground text-center">
                  {receiptFile.name}
                </p>
                <button
                  type="button"
                  onClick={handleFileRemove}
                  className="text-xs text-destructive underline"
                >
                  {t("shipping_payment.remove")}
                </button>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-amber-400" />
                <p className="text-sm text-muted-foreground text-center">
                  {t("shipping_payment.click_to_select_receipt")}
                </p>
                <span className="text-xs text-destructive font-semibold">
                  {t("shipping_payment.required_to_place_order")}
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {/* ─── ملاحظات بوابات الدفع (Stripe / PayPal) ────────────────────── */}
      {selectedCode === "stripe" && (
        <div className="bg-accent  rounded-3xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-success" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <p className="text-sm font-bold text-foreground mb-0.5">
              {t("shipping_payment.secure_card_payment_stripe")}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("shipping_payment.stripe_desc")}
            </p>
          </div>
        </div>
      )}

      {selectedCode === "moyasar" && (
        <div className="bg-accent  rounded-3xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-0.5">
              {t("shipping_payment.secure_card_payment_moyasar") ||
                "Secure Payment (Moyasar)"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("shipping_payment.moyasar_desc") ||
                "You will be redirected securely to complete your payment using Mada, Visa, MasterCard, or Apple Pay."}
            </p>
          </div>
        </div>
      )}

      {selectedCode === "paypal" && (
        <div className="bg-accent  rounded-3xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-0.5">PayPal</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("shipping_payment.paypal_desc")}
            </p>
          </div>
        </div>
      )}

      {/* ─── أزرار التنقل (Navigation Buttons) ───────────────────────── */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="w-1/3 h-14 bg-muted text-foreground rounded-2xl font-bold text-base hover:bg-muted/80 transition-all"
        >
          {t("shipping_payment.back")}
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed || summaryLoading}
          className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("shipping_payment.review_order")}
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
