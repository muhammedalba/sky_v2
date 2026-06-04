"use client";

import {
  Truck, CreditCard, Tag, Loader2, AlertCircle,
  ArrowLeft, ArrowRight, Upload, CheckCircle, Info,
  Banknote, Wallet, ShieldCheck,
} from "lucide-react";
import { ActivePaymentMethod } from "../hooks/useCheckout";

/* ─── Gateway icons ─────────────────────────────────────────────────────────── */

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
      return <CreditCard className="w-5 h-5 text-primary" />;
  }
}

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
  isAr: boolean;
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
  couponInput: string;
  setCouponInput: (val: string) => void;
  appliedCoupon: string;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  couponError: string | null;
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
  onBack: () => void;
  onNext: () => void;
  isValid: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function CheckoutShippingPaymentStep({
  isAr,
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
  couponInput,
  setCouponInput,
  appliedCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  couponError,
  receiptFile,
  setReceiptFile,
  onBack,
  onNext,
  isValid,
}: CheckoutShippingPaymentStepProps) {
  const selectedCode = selectedPayment?.code ?? "";
  const isBankTransfer = selectedCode === "banktransfer";
  const canProceed = isValid && (!isBankTransfer || !!receiptFile);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* ─── Shipping Options ────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground">
            {isAr ? "طريقة الشحن" : "Shipping Method"}
          </h2>
        </div>

        {summaryLoading && !shippingOptions.length ? (
          <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">
              {isAr ? "جارٍ حساب الشحن..." : "Calculating shipping..."}
            </span>
          </div>
        ) : (
          <div className="grid gap-4">
            {shippingOptions.map((option) => (
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
                    onChange={() => handleShippingChange(option.providerId)}
                    className="w-4 h-4 text-primary focus:ring-primary/50"
                  />
                  <div>
                    <p className="font-semibold text-sm">{option.providerName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isAr ? "المدة المتوقعة:" : "Est. Delivery:"}{" "}
                      {option.estimatedDays} {isAr ? "أيام" : "days"}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm">
                  {option.totalShippingCost > 0
                    ? formatCurrency(option.totalShippingCost)
                    : isAr ? "مجاني" : "Free"}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ─── Payment Methods ─────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground">
            {isAr ? "طريقة الدفع" : "Payment Method"}
          </h2>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">
              {isAr ? "لا توجد طرق دفع متاحة حالياً" : "No payment methods available"}
            </span>
          </div>
        ) : (
          <div className="grid gap-3">
            {paymentMethods.map((method) => {
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
                  {/* Gradient bg when selected */}
                  {isSelected && !disabled && (
                    <div
                      className={`absolute inset-0 rounded-2xl bg-linear-to-br ${method.color} opacity-60 pointer-events-none`}
                    />
                  )}

                  {/* Radio input */}
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

                  {/* Gateway icon */}
                  <div
                    className={`relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-white/80 dark:bg-black/30 shadow-sm"
                        : "bg-muted/50"
                    }`}
                  >
                    {getPaymentIcon(method.code)}
                  </div>

                  {/* Text content */}
                  <div className="relative flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-foreground">
                        {isAr ? method.nameAr : method.name}
                      </p>
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
                      {isAr ? method.descriptionAr : method.description}
                    </p>

                    {disabled && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {isAr
                          ? "شركة الشحن لا تدعم الدفع عند الاستلام"
                          : "Carrier does not support COD"}
                      </p>
                    )}

                    {isSelected && method.type === "electronic" && (
                      <p className="text-[11px] text-primary/80 mt-1.5 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        {isAr ? "مدفوعات آمنة ومشفرة" : "Secure encrypted payment"}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Bank Transfer receipt upload ────────────────────────────── */}
      {isBankTransfer && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-3xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-500" />
            {isAr ? "إرفاق إيصال التحويل" : "Upload Transfer Receipt"}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {isAr
              ? "يرجى تحويل المبلغ وإرفاق صورة الإيصال لإتمام الطلب"
              : "Please transfer the amount and attach the receipt to complete the order"}
          </p>
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl p-6 cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all">
            <input
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            />
            {receiptFile ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-500" />
                <p className="text-sm font-semibold text-foreground text-center">
                  {receiptFile.name}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setReceiptFile(null); }}
                  className="text-xs text-destructive underline"
                >
                  {isAr ? "إزالة" : "Remove"}
                </button>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-amber-400" />
                <p className="text-sm text-muted-foreground text-center">
                  {isAr ? "اضغط لاختيار صورة الإيصال" : "Click to select receipt image"}
                </p>
                <span className="text-xs text-destructive font-semibold">
                  {isAr ? "* مطلوب لإتمام الطلب" : "* Required to place order"}
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {/* ─── Stripe notice ───────────────────────────────────────────── */}
      {selectedCode === "stripe" && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-3xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-0.5">
              {isAr ? "الدفع الآمن ببطاقة الائتمان عبر Stripe" : "Secure Card Payment via Stripe"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "بعد تأكيد الطلب، ستُوجَّه إلى صفحة Stripe الآمنة لإدخال بيانات بطاقتك. تدعم فيزا، ماستركارد، ومدى."
                : "After confirmation, you'll be redirected to Stripe's secure page. Visa, Mastercard, and Mada supported."}
            </p>
          </div>
        </div>
      )}

      {/* ─── PayPal notice ───────────────────────────────────────────── */}
      {selectedCode === "paypal" && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-3xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-0.5">PayPal</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "بعد تأكيد الطلب، ستُعاد توجيهك إلى موقع PayPal لإتمام الدفع بأمان."
                : "After confirmation, you'll be redirected to PayPal to complete your payment securely."}
            </p>
          </div>
        </div>
      )}

      {/* ─── Coupon ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground">
            {isAr ? "كود الخصم" : "Coupon Code"}
          </h2>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder={isAr ? "أدخل الكوبون" : "Enter coupon"}
            disabled={!!appliedCoupon || summaryLoading}
            className="flex-1 h-12 px-4 bg-background border border-border/60 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
          />
          {appliedCoupon ? (
            <button
              onClick={handleRemoveCoupon}
              className="h-12 px-6 bg-destructive text-destructive-foreground rounded-xl font-bold text-sm hover:bg-destructive/90 transition-all"
            >
              {isAr ? "إزالة" : "Remove"}
            </button>
          ) : (
            <button
              onClick={handleApplyCoupon}
              disabled={!couponInput || summaryLoading}
              className="h-12 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {isAr ? "تطبيق" : "Apply"}
            </button>
          )}
        </div>
        {couponError && (
          <p className="text-xs text-destructive mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {couponError}
          </p>
        )}
      </div>

      {/* ─── Navigation ──────────────────────────────────────────────── */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="w-1/3 h-14 bg-muted text-foreground rounded-2xl font-bold text-base hover:bg-muted/80 transition-all"
        >
          {isAr ? "رجوع" : "Back"}
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed || summaryLoading}
          className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAr ? "مراجعة الطلب" : "Review Order"}
          {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
