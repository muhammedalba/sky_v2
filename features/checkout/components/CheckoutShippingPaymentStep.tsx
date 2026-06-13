"use client";

import React, { useMemo, useCallback } from "react";
import {
  Truck, CheckCircle, Upload, AlertCircle, Info, ArrowRight, Loader2,
  Banknote, Wallet, ShieldCheck, Clock
} from "lucide-react";
import { ActivePaymentMethod } from "../hooks/useCheckout";
import { useTranslations } from "next-intl";
import { useTrans } from "@/shared/hooks/useTrans";
import { useSettings } from "@/features/settings/hooks/useSettings";

/* ─── Gateway icons ─────────────────────────────────────────────────────────── */

/** مكون أيقونة بوابة Stripe */
function StripeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30.3 10.8c0-2.4 1.9-3.3 5-3.3 4.5 0 10.2 1.4 14.5 3.9V2.2C45.2.8 40.4 0 35.3 0
           24 0 16.5 5.7 16.5 15c0 14.6 20.1 12.3 20.1 18.6 0 2.8-2.4 3.7-5.8 3.7
           -5 0-11.4-2.1-16.5-4.9v9.2c5.6 2.4 11.3 3.4 16.5 3.4C42.5 45 50 39.6 50 30
           c0-15.8-19.7-12.9-19.7-19.2z"
        fill="#6772E5"
      />
    </svg>
  );
}

/** مكون أيقونة بوابة PayPal */
function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 101 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.2 0H4.6C4 0 3.4.4 3.3 1L0 20.3c-.1.5.3.9.8.9h3.9c.5 0 1-.4 1.1-.9l.9-5.5
           c.1-.5.6-.9 1.1-.9h2.5c5.2 0 8.2-2.5 9-7.5.3-2.2 0-3.9-1-5.1C17.3.6 15.1 0 12.2 0z
           m.9 7.4c-.4 2.8-2.6 2.8-4.7 2.8H7.2l.9-5.4c0-.3.3-.6.6-.6h.6c1.4 0 2.8 0 3.5.8
           .4.5.5 1.3.3 2.4z"
        fill="#003087"
      />
      <path
        d="M35.5.6h-3.9c-.3 0-.6.2-.6.6L28.3 9c-.1.5.3.9.8.9h1.8c.6 0 1.1-.4 1.2-.9l.8-4.9
           c.1-.6.6-1 1.2-1h.5c1.8 0 3.5.4 3.8 2.5.2 1.1 0 2-.5 2.8-.6 1-1.7 1.5-3.1 1.5H33
           c-.3 0-.6.2-.7.5l-.6 3.6c-.1.4.2.7.6.7h1.6c2.7 0 4.8-1.1 5.8-3.1.8-1.5.9-3.3.4-5
           C39.3 2 37.8.8 35.5.6z"
        fill="#009CDE"
      />
    </svg>
  );
}

/**
 * دالة جلب الأيقونة المناسبة بناءً على كود طريقة الدفع
 * @param {string} code - كود بوابة الدفع
 * @returns {JSX.Element} - المكون البصري للأيقونة
 */
function getPaymentIcon(code: string) {
  switch (code) {
    case "stripe":
      return <StripeIcon className="h-5 w-auto" />;
    case "paypal":
      return <PayPalIcon className="h-5 w-auto" />;
    case "banktransfer":
      return <Banknote className="w-5 h-5 text-amber-600" />;
    case "cod":
      return <Wallet className="w-5 h-5 text-green-600" />;
    default:
      return <Banknote className="w-5 h-5 text-primary" />;
  }
}

/**
 * دالة جلب تنسيقات شارة (Badge) طريقة الدفع
 * @param {string} code - كود بوابة الدفع
 * @returns {string} - أصناف Tailwind CSS
 */
function getGatewayBadgeStyle(code: string) {
  switch (code) {
    case "stripe":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300";
    case "paypal":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300";
    case "banktransfer":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
    case "cod":
      return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

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
  
  const selectedCode = useMemo(() => selectedPayment?.code ?? "", [selectedPayment]);
  const isBankTransfer = useMemo(() => selectedCode === "banktransfer", [selectedCode]);
  
  // شرط التقدم للخطوة التالية: يجب أن يكون النموذج صالحاً، وإذا كان الدفع تحويلاً بنكياً يجب إرفاق الإيصال
  const canProceed = useMemo(() => {
    return isValid && (!isBankTransfer || !!receiptFile);
  }, [isValid, isBankTransfer, receiptFile]);

  // ─── 2. دوال التعامل مع الأحداث (Event Handlers) المخبأة (Memoized) ───────
  
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // التحقق الآمن من وجود الملف وتجنب الأخطاء في حال إلغاء المستخدم لعملية الرفع
    const file = e.target.files?.[0] || null;
    setReceiptFile(file);
  }, [setReceiptFile]);

  const handleFileRemove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // منع تفعيل الـ label الأصلي الذي يفتح نافذة اختيار الملفات
    setReceiptFile(null);
  }, [setReceiptFile]);

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

        {summaryLoading && (!shippingOptions || shippingOptions.length === 0) ? (
          <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">
              {t("shipping_payment.calculating_shipping")}
            </span>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* استخدام التحقق الآمن ?.map لمنع الانهيار إذا كانت shippingOptions فارغة (undefined) */}
            {shippingOptions?.map((option) => (
              <label
                key={option.providerId}
                className={`relative flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  selectedShippingId === option.providerId
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/60 hover:border-primary/50"
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
                    <div className="font-semibold text-foreground text-sm">{option.providerName}</div>
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
            {/* استخدام التحقق الآمن ?.map هنا أيضاً */}
            {paymentMethods?.map((method) => {
              const isCOD = method.code === "cod";
              const disabled = isCOD && !isCODSupportedByCarrier;
              const isSelected = selectedPaymentId === method._id;

              return (
                <label
                  key={method._id}
                  className={`relative flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
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

                  <div
                    className={`relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-white/80 dark:bg-black/30 shadow-sm"
                        : "bg-muted/50"
                    }`}
                  >
                    {getPaymentIcon(method.code)}
                  </div>

                  <div className="relative flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-foreground">
                        {getTrans(method.name)}
                      </h3>
                      {method.badge && (
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md tracking-wide ${getGatewayBadgeStyle(method.code)}`}
                        >
                          {method.badge}
                        </span>
                      )}
                      {method.fees > 0 && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          +{formatCurrency(method.fees)}
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs mt-0.5 leading-relaxed ${
                        isSelected ? "text-foreground/70" : "text-muted-foreground"
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
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-3xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-500" />
            {t("shipping_payment.upload_receipt")}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {t("shipping_payment.upload_receipt_desc")}
          </p>

          {settings?.bankTransferDetails && (
            <div className="mb-6 p-4 bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
              <h3 className="font-semibold text-sm mb-3 text-amber-700 dark:text-amber-400">
                 {t("shipping_payment.bank_details_title", { fallback: "معلومات الحساب البنكي" })}
              </h3>
              {settings.bankTransferDetails.bankName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping_payment.bank_name", { fallback: "اسم البنك:" })}</span>
                  <span className="font-medium">{settings.bankTransferDetails.bankName}</span>
                </div>
              )}
              {settings.bankTransferDetails.accountName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping_payment.account_name", { fallback: "اسم الحساب:" })}</span>
                  <span className="font-medium">{settings.bankTransferDetails.accountName}</span>
                </div>
              )}
              {settings.bankTransferDetails.accountNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping_payment.account_number", { fallback: "رقم الحساب:" })}</span>
                  <span className="font-medium" dir="ltr">{settings.bankTransferDetails.accountNumber}</span>
                </div>
              )}
              {settings.bankTransferDetails.iban && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping_payment.iban", { fallback: "الآيبان:" })}</span>
                  <span className="font-medium" dir="ltr">{settings.bankTransferDetails.iban}</span>
                </div>
              )}
            </div>
          )}

          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl p-6 cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all">
            <input
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              // تم استبدال الدالة المباشرة بدالة مخبأة (Memoized)
              onChange={handleFileUpload}
            />
            {receiptFile ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-500" />
                <p className="text-sm font-semibold text-foreground text-center">
                  {receiptFile.name}
                </p>
                <button
                  type="button"
                  // تم استبدال الدالة المباشرة بدالة مخبأة (Memoized)
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
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-3xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
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
        <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 rounded-3xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-0.5">
              {t("shipping_payment.secure_card_payment_moyasar") || "Secure Payment (Moyasar)"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("shipping_payment.moyasar_desc") || "You will be redirected securely to complete your payment using Mada, Visa, MasterCard, or Apple Pay."}
            </p>
          </div>
        </div>
      )}

      {selectedCode === "paypal" && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-3xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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