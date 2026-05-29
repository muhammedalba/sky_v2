"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useCountries,
  useRegions,
  useCities,
  useActivePaymentMethods,
  useCheckoutPreview,
  usePlaceOrder,
  useBankTransferOrder,
} from "@/features/checkout/hooks/useCheckout";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useToast } from "@/shared/hooks/useToast";
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { useTrans } from "@/shared/hooks/useTrans";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import {
  ChevronDown,
  CreditCard,
  Truck,
  MapPin,
  User,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Upload,
  Tag,
  Loader2,
  Package,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";

/* ─────────────────────── Types ─────────────────────────────────── */
interface ShippingOption {
  providerId: string;
  providerName: string;
  rateId: string;
  estimatedDays: number;
  totalShippingCost: number;
  supportsCOD: boolean;
}

interface PaymentMethod {
  _id: string;
  name: string;
  code: string;
  type: string;
  fees: number;
  icon?: string;
}

/* ─────────────────────── Helpers ────────────────────────────────── */
const PAYMENT_ICONS: Record<string, string> = {
  cod: "💵",
  bank_transfer: "🏦",
  bankTransfer: "🏦",
  banktransfer: "🏦",
  stripe: "💳",
  paypal: "🅿️",
  card: "💳",
  wallet: "👛",
};

const PAYMENT_LABELS_AR: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  bank_transfer: "تحويل بنكي",
  bankTransfer: "تحويل بنكي",
  banktransfer: "تحويل بنكي",
  stripe: "بطاقة ائتمانية",
  paypal: "PayPal",
  card: "بطاقة ائتمانية",
  wallet: "محفظة إلكترونية",
};

/* ─────────────────────── Step Indicator ─────────────────────────── */
function StepIndicator({
  current,
  isAr,
}: {
  current: number;
  isAr: boolean;
}) {
  const steps = isAr
    ? ["معلومات التوصيل", "الشحن والدفع", "مراجعة وتأكيد"]
    : ["Shipping Info", "Shipping & Payment", "Review & Confirm"];

  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md
                  ${isDone ? "bg-success text-white scale-90" : isActive ? "bg-primary text-primary-foreground scale-110 shadow-primary/30" : "bg-muted text-muted-foreground"}`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap text-center leading-tight transition-colors
                  ${isActive ? "text-primary" : isDone ? "text-success" : "text-muted-foreground"}`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mt-[-14px] rounded-full transition-all duration-500
                  ${isDone ? "bg-success" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── Select Field ──────────────────────────── */
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  isLoading,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="w-full h-12 px-4 pr-10 bg-card border border-border/60 rounded-xl text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{isLoading ? "جارٍ التحميل..." : placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Input Field ───────────────────────────── */
function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-12 px-4 bg-card border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50
          ${error ? "border-destructive focus:border-destructive" : "border-border/60 focus:border-primary"}`}
      />
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────── Order Summary Card ─────────────────────── */
function OrderSummaryCard({
  cartItems,
  subtotal,
  preview,
  isAr,
  formatCurrency,
  getTrans,
}: {
  cartItems: CartItem[];
  subtotal: number;
  preview: any;
  isAr: boolean;
  formatCurrency: (n: number) => string;
  getTrans: (v: any) => string;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl shadow-primary/5 sticky top-24">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/15 rounded-xl">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-black text-foreground">
            {isAr ? "ملخص الطلب" : "Order Summary"}
          </h2>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-4 space-y-3 max-h-52 overflow-y-auto border-b border-border/40">
        {cartItems.map((item: CartItem, idx: number) => {
          const product = item.product;
          if (!product) return null;
          const { price, image } = resolveItemData(item);
          const title = getTrans(product.title);
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/40 shrink-0 bg-accent/30">
                {image ? (
                  <Image src={image} alt={title as string} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
                <span className="absolute -top-1 -end-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{title as string}</p>
                <p className="text-xs text-muted-foreground">× {item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums shrink-0">
                {formatCurrency((price || 0) * (item.quantity || 1))}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>

        {preview ? (
          <>
            {preview.summary.shippingCost > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "الشحن" : "Shipping"}</span>
                <span className="font-semibold">{formatCurrency(preview.summary.shippingCost)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "الشحن" : "Shipping"}</span>
                <span className="font-bold text-success text-xs bg-success/10 px-2 py-0.5 rounded-lg">
                  {isAr ? "مجاني" : "Free"}
                </span>
              </div>
            )}
            {preview.summary.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr ? `الضريبة (${preview.summary.taxPercentage}%)` : `Tax (${preview.summary.taxPercentage}%)`}
                </span>
                <span className="font-semibold">{formatCurrency(preview.summary.taxAmount)}</span>
              </div>
            )}
            {preview.summary.paymentFees > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "رسوم الدفع" : "Payment Fees"}</span>
                <span className="font-semibold">{formatCurrency(preview.summary.paymentFees)}</span>
              </div>
            )}
            {preview.summary.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-success font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {isAr ? "خصم الكوبون" : "Coupon Discount"}
                </span>
                <span className="font-bold text-success">-{formatCurrency(preview.summary.discount)}</span>
              </div>
            )}
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-foreground">{isAr ? "الإجمالي" : "Total"}</span>
              <span className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(preview.summary.total)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isAr ? "الشحن" : "Shipping"}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {isAr ? "يحسب لاحقاً" : "Calculated next"}
              </span>
            </div>
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-foreground">{isAr ? "الإجمالي" : "Total"}</span>
              <span className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Trust badges */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-3 bg-muted/40 rounded-2xl p-3 border border-border/30">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">{isAr ? "دفع آمن ومشفر" : "Secure & Encrypted"}</p>
            <p className="text-[10px] text-muted-foreground">SSL / 256-bit encryption</p>
          </div>
          <Lock className="w-4 h-4 text-muted-foreground ms-auto" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ════════════════════════════════ */
export default function CheckoutPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const formatCurrency = useFormatCurrency();
  const settings = useSettings();
  const getTrans = useTrans();
  const { data: user } = useMe();
  const toast = useToast();

  /* ─── Cart Data ───────────────────────────────────────────────── */
  const { data: serverCart } = useCart();
  const guestCartItems = useCartStore((s) => s.items);
  const cartItems: CartItem[] = useMemo(
    () => (user ? serverCart?.items || [] : guestCartItems || []),
    [user, serverCart?.items, guestCartItems]
  );

  const subtotal = useMemo(
    () =>
      serverCart?.totalPrice ??
      cartItems.reduce((acc: number, item: CartItem) => {
        const { price } = resolveItemData(item);
        return acc + (price || 0) * (item.quantity || 1);
      }, 0),
    [serverCart?.totalPrice, cartItems]
  );

  /* ─── Step ────────────────────────────────────────────────────── */
  const [step, setStep] = useState(0);

  /* ─── Step 0: Shipping Address ───────────────────────────────── */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryId, setCountryId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [notes, setNotes] = useState("");

  /* ─── Step 1: Shipping Provider + Payment ─────────────────────── */
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  /* ─── Locations ────────────────────────────────────────────────── */
  const { data: countries = [], isLoading: loadingCountries } = useCountries();
  const { data: regions = [], isLoading: loadingRegions } = useRegions(countryId || null);
  const { data: cities = [], isLoading: loadingCities } = useCities(regionId || null);

  /* ─── Payment Methods ──────────────────────────────────────────── */
  const { data: paymentMethods = [] } = useActivePaymentMethods();

  /* ─── Checkout Preview ─────────────────────────────────────────── */
  const { mutate: fetchPreview, data: previewData, isPending: previewLoading } = useCheckoutPreview();
  const { mutate: placeOrder, isPending: placingOrder } = usePlaceOrder();
  const { mutate: bankTransfer, isPending: bankTransferring } = useBankTransferOrder();

  const previewResult = previewData?.data ?? previewData;
  const shippingOptions: ShippingOption[] = previewResult?.shippingOptions ?? [];
  const selectedPayment: PaymentMethod | undefined = paymentMethods.find(
    (m: PaymentMethod) => m._id === selectedPaymentId
  );

  /* ─── Reset downstream on location change ─────────────────────── */
  useEffect(() => {
    setRegionId("");
    setCityId("");
  }, [countryId]);

  useEffect(() => {
    setCityId("");
  }, [regionId]);

  /* ─── Auto-fetch preview when on step 1 ───────────────────────── */
  useEffect(() => {
    if (step === 1 && cityId && selectedPaymentId) {
      triggerPreview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, cityId, selectedPaymentId, selectedShippingId, appliedCoupon]);

  const triggerPreview = useCallback((overrideCoupon?: string | null) => {
    if (!cityId || !selectedPaymentId) return;
    const items = cartItems.map((item: CartItem) => {
      const { price } = resolveItemData(item);
      return {
        productId: (item.product?._id || item.productId) as string,
        variantId: (item.variant?._id || item.variantId) as string,
        quantity: item.quantity,
        weight: (item.variant as any)?.weight ?? (item.product as any)?.weight ?? 0.5,
        price: price || 0,
      };
    });

    const couponToSend = overrideCoupon === null
      ? undefined
      : (overrideCoupon !== undefined ? overrideCoupon : (appliedCoupon || undefined));

    fetchPreview({
      cityId,
      items,
      paymentMethodId: selectedPaymentId,
      shippingProviderId: selectedShippingId || "auto",
      couponCode: couponToSend,
    });
  }, [cityId, selectedPaymentId, selectedShippingId, appliedCoupon, cartItems, fetchPreview]);

  const handleApplyCoupon = useCallback(() => {
    if (!couponInput.trim()) return;
    setCouponError(null);

    const items = cartItems.map((item: CartItem) => {
      const { price } = resolveItemData(item);
      return {
        productId: (item.product?._id || item.productId) as string,
        variantId: (item.variant?._id || item.variantId) as string,
        quantity: item.quantity,
        weight: (item.variant as any)?.weight ?? (item.product as any)?.weight ?? 0.5,
        price: price || 0,
      };
    });

    fetchPreview(
      {
        cityId,
        items,
        paymentMethodId: selectedPaymentId,
        shippingProviderId: selectedShippingId || "auto",
        couponCode: couponInput,
      },
      {
        onSuccess: (res) => {
          const result = res?.data ?? res;
          if (result?.summary?.discount > 0) {
            setAppliedCoupon(couponInput);
            setCouponError(null);
            toast.success(isAr ? "تم تطبيق الكوبون بنجاح!" : "Coupon applied successfully!");
          } else {
            setCouponError(isAr ? "هذا الكوبون لم يقدم أي خصم" : "This coupon did not apply any discount");
          }
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || (isAr ? "كوبون غير صالح" : "Invalid coupon");
          setCouponError(errMsg);
          toast.error(errMsg);
        },
      }
    );
  }, [couponInput, cityId, selectedPaymentId, selectedShippingId, cartItems, fetchPreview, isAr, toast]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponInput("");
    setAppliedCoupon("");
    setCouponError(null);

    triggerPreview(null);
    toast.success(isAr ? "تم إزالة الكوبون بنجاح" : "Coupon removed successfully");
  }, [triggerPreview, isAr, toast]);

  /* ─── Auto-select first shipping & first payment ──────────────── */
  useEffect(() => {
    if (shippingOptions.length > 0 && !selectedShippingId) {
      setSelectedShippingId(shippingOptions[0].providerId);
    }
  }, [shippingOptions, selectedShippingId]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentId) {
      setSelectedPaymentId(paymentMethods[0]._id);
    }
  }, [paymentMethods, selectedPaymentId]);

  /* ─── Validation ──────────────────────────────────────────────── */
  const step0Valid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    phone.trim().length >= 8 &&
    countryId &&
    regionId &&
    cityId &&
    street.trim().length >= 2;

  const step1Valid = selectedShippingId && selectedPaymentId;

  /* ─── Redirect if cart empty ───────────────────────────────────── */
  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace(`/${locale}/cart`);
    }
  }, [cartItems.length, locale, router]);

  /* ─── Selected city/region labels ─────────────────────────────── */
  const selectedCity = cities.find((c: any) => c._id === cityId);
  const selectedCountry = countries.find((c: any) => c._id === countryId);

  /* ─── Place order handler ──────────────────────────────────────── */
  const handlePlaceOrder = useCallback(() => {
    const shippingAddress = {
      firsName: firstName,
      lastName,
      phone,
      country: selectedCountry?.name?.ar ?? selectedCountry?.name ?? "",
      city: selectedCity?.name?.ar ?? selectedCity?.name ?? "",
      cityId,
      street,
      building,
      postalCode,
      additionalInfo,
    };

    const orderItems = cartItems.map((item: CartItem) => {
      const { price } = resolveItemData(item);
      return {
        product: item.product?._id || item.productId,
        variant: item.variant?._id || item.variantId,
        quantity: item.quantity,
        unitPrice: price,
      };
    });

    const isBankTransfer =
      selectedPayment?.code === "bank_transfer" ||
      selectedPayment?.code === "bankTransfer" ||
      selectedPayment?.code === "banktransfer";

    if (isBankTransfer) {
      const fd = new FormData();
      if (receiptFile) fd.append("transferReceiptImg", receiptFile);
      fd.append("shippingAddress", JSON.stringify(shippingAddress));
      fd.append("items", JSON.stringify(orderItems));
      fd.append("cityId", cityId);
      fd.append("paymentMethodId", selectedPaymentId);
      fd.append("shippingProviderId", selectedShippingId);
      if (appliedCoupon) fd.append("couponCode", appliedCoupon);
      if (notes) fd.append("notes", notes);
      bankTransfer(fd);
    } else {
      placeOrder({
        shippingAddress,
        items: orderItems,
        cityId,
        paymentMethodId: selectedPaymentId,
        shippingProviderId: selectedShippingId,
        couponCode: appliedCoupon || undefined,
        notes: notes || undefined,
      });
    }
  }, [
    firstName, lastName, phone, selectedCountry, selectedCity, cityId,
    street, building, postalCode, additionalInfo, cartItems, selectedPayment,
    selectedPaymentId, selectedShippingId, appliedCoupon, notes, receiptFile,
    placeOrder, bankTransfer,
  ]);

  const isSubmitting = placingOrder || bankTransferring;

  /* ─────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: isAr ? "الرئيسية" : "Home", href: "/" },
            { label: isAr ? "السلة" : "Cart", href: "/cart" },
            { label: isAr ? "الدفع" : "Checkout" },
          ]}
        />

        {/* Page Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">
            {isAr ? "إتمام الطلب" : "Checkout"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr ? "أكمل بياناتك لتأكيد طلبك" : "Complete your details to confirm your order"}
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator current={step} isAr={isAr} />

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left: Steps ── */}
          <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">

            {/* ════ STEP 0: Shipping Address ════ */}
            {step === 0 && (
              <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-primary/10 rounded-2xl">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-black text-foreground">
                    {isAr ? "عنوان التوصيل" : "Delivery Address"}
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label={isAr ? "الاسم الأول" : "First Name"}
                      value={firstName}
                      onChange={setFirstName}
                      placeholder={isAr ? "محمد" : "John"}
                      required
                    />
                    <InputField
                      label={isAr ? "اسم العائلة" : "Last Name"}
                      value={lastName}
                      onChange={setLastName}
                      placeholder={isAr ? "أحمد" : "Doe"}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <InputField
                    label={isAr ? "رقم الهاتف" : "Phone Number"}
                    value={phone}
                    onChange={setPhone}
                    placeholder="+966 5X XXX XXXX"
                    type="tel"
                    required
                  />

                  {/* Country */}
                  <SelectField
                    label={isAr ? "الدولة" : "Country"}
                    value={countryId}
                    onChange={setCountryId}
                    options={countries.map((c: any) => ({
                      value: c._id,
                      label: isAr ? (c.name?.ar || c.name) : (c.name?.en || c.name),
                    }))}
                    placeholder={isAr ? "اختر الدولة" : "Select country"}
                    isLoading={loadingCountries}
                    required
                  />

                  {/* Region */}
                  <SelectField
                    label={isAr ? "المنطقة" : "Region"}
                    value={regionId}
                    onChange={setRegionId}
                    options={regions.map((r: any) => ({
                      value: r._id,
                      label: isAr ? (r.name?.ar || r.name) : (r.name?.en || r.name),
                    }))}
                    placeholder={isAr ? "اختر المنطقة" : "Select region"}
                    disabled={!countryId}
                    isLoading={loadingRegions}
                    required
                  />

                  {/* City */}
                  <SelectField
                    label={isAr ? "المدينة" : "City"}
                    value={cityId}
                    onChange={setCityId}
                    options={cities.map((c: any) => ({
                      value: c._id,
                      label: isAr ? (c.name?.ar || c.name) : (c.name?.en || c.name),
                    }))}
                    placeholder={isAr ? "اختر المدينة" : "Select city"}
                    disabled={!regionId}
                    isLoading={loadingCities}
                    required
                  />

                  {/* Street */}
                  <InputField
                    label={isAr ? "الشارع" : "Street"}
                    value={street}
                    onChange={setStreet}
                    placeholder={isAr ? "اسم الشارع والرقم" : "Street name and number"}
                    required
                  />

                  {/* Building + Postal */}
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label={isAr ? "المبنى / الشقة" : "Building / Apt"}
                      value={building}
                      onChange={setBuilding}
                      placeholder={isAr ? "٢أ" : "2A"}
                    />
                    <InputField
                      label={isAr ? "الرمز البريدي" : "Postal Code"}
                      value={postalCode}
                      onChange={setPostalCode}
                      placeholder="12345"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      {isAr ? "ملاحظات إضافية" : "Additional Notes"}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isAr ? "ملاحظات للسائق أو أي تعليمات خاصة..." : "Notes for the driver or special instructions..."}
                      rows={3}
                      className="w-full px-4 py-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {/* Next btn */}
                <button
                  onClick={() => setStep(1)}
                  disabled={!step0Valid}
                  className="mt-8 w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isAr ? "التالي: الشحن والدفع" : "Next: Shipping & Payment"}
                  {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            )}

            {/* ════ STEP 1: Shipping + Payment ════ */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Shipping Options */}
                <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-primary/10 rounded-2xl">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-black text-foreground">
                      {isAr ? "طريقة الشحن" : "Shipping Method"}
                    </h2>
                  </div>

                  {previewLoading ? (
                    <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">{isAr ? "جارٍ حساب الشحن..." : "Calculating shipping..."}</span>
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        {isAr ? "لا توجد خيارات شحن متاحة للمدينة المختارة" : "No shipping options available for this city"}
                      </p>
                      <button
                        onClick={triggerPreview}
                        className="mt-3 text-sm text-primary font-semibold hover:underline"
                      >
                        {isAr ? "إعادة المحاولة" : "Retry"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shippingOptions.map((opt: ShippingOption) => (
                        <label
                          key={opt.providerId}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                            ${selectedShippingId === opt.providerId
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-border/50 hover:border-border"
                            }`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={opt.providerId}
                            checked={selectedShippingId === opt.providerId}
                            onChange={() => setSelectedShippingId(opt.providerId)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                              ${selectedShippingId === opt.providerId ? "border-primary" : "border-muted-foreground/40"}`}
                          >
                            {selectedShippingId === opt.providerId && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-foreground text-sm">{opt.providerName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {isAr
                                ? `${opt.estimatedDays} أيام عمل`
                                : `${opt.estimatedDays} business days`}
                            </p>
                          </div>
                          <div className="text-end shrink-0">
                            {opt.totalShippingCost === 0 ? (
                              <span className="text-success font-bold text-sm">
                                {isAr ? "مجاني" : "Free"}
                              </span>
                            ) : (
                              <span className="font-bold text-foreground">
                                {formatCurrency(opt.totalShippingCost)}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-primary/10 rounded-2xl">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-black text-foreground">
                      {isAr ? "طريقة الدفع" : "Payment Method"}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {paymentMethods.map((method: PaymentMethod) => (
                      <label
                        key={method._id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                          ${selectedPaymentId === method._id
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border/50 hover:border-border"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method._id}
                          checked={selectedPaymentId === method._id}
                          onChange={() => setSelectedPaymentId(method._id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                            ${selectedPaymentId === method._id ? "border-primary" : "border-muted-foreground/40"}`}
                        >
                          {selectedPaymentId === method._id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-xl shrink-0">
                          {PAYMENT_ICONS[method.code] ?? "💳"}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold text-foreground text-sm">
                            {isAr
                              ? PAYMENT_LABELS_AR[method.code] ?? method.name
                              : method.name}
                          </p>
                          {method.fees > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {isAr ? `رسوم إضافية: ` : `Additional fee: `}
                              {formatCurrency(method.fees)}
                            </p>
                          )}
                        </div>
                        {selectedPaymentId === method._id && (
                          <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Bank transfer receipt upload */}
                  {(selectedPayment?.code === "bank_transfer" ||
                    selectedPayment?.code === "bankTransfer" ||
                    selectedPayment?.code === "banktransfer") && (
                    <div className="mt-5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        {isAr ? "📎 يرجى رفع إيصال التحويل البنكي" : "📎 Please upload your bank transfer receipt"}
                      </p>
                      <label className="flex flex-col items-center gap-3 cursor-pointer">
                        <div
                          className={`w-full border-2 border-dashed rounded-2xl p-5 flex flex-col items-center gap-2 transition-colors
                            ${receiptFile ? "border-success bg-success/5" : "border-border hover:border-primary/50"}`}
                        >
                          {receiptFile ? (
                            <>
                              <CheckCircle2 className="w-8 h-8 text-success" />
                              <p className="text-sm font-bold text-success">{receiptFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(receiptFile.size / 1024).toFixed(0)} KB
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground/50" />
                              <p className="text-sm font-semibold text-muted-foreground">
                                {isAr ? "انقر لرفع الإيصال" : "Click to upload receipt"}
                              </p>
                              <p className="text-xs text-muted-foreground/60">PNG, JPEG, WEBP (Max 1MB)</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Coupon (only for authenticated users) */}
                {user && settings.features.coupons && (
                  <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2.5 bg-primary/10 rounded-2xl">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-black text-foreground">
                        {isAr ? "كوبون الخصم" : "Discount Coupon"}
                      </h2>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-success animate-bounce" />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {isAr ? `الكوبون المطبق: ${appliedCoupon}` : `Applied Coupon: ${appliedCoupon}`}
                            </p>
                            {previewResult?.summary?.discount > 0 && (
                              <p className="text-xs text-success font-semibold mt-0.5">
                                {isAr
                                  ? `تم تطبيق خصم بقيمة -${formatCurrency(previewResult.summary.discount)}`
                                  : `Discount of -${formatCurrency(previewResult.summary.discount)} applied`}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          disabled={previewLoading}
                          className="px-4 h-9 bg-destructive/15 text-destructive hover:bg-destructive/25 text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          {isAr ? "إزالة الكوبون" : "Remove"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                              if (couponError) setCouponError(null);
                            }}
                            placeholder={isAr ? "أدخل رمز الكوبون" : "Enter coupon code"}
                            className="flex-1 h-12 px-4 bg-background border border-border/60 rounded-xl text-sm tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all uppercase placeholder:font-normal placeholder:tracking-normal"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!couponInput.trim() || previewLoading}
                            className="h-12 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {isAr ? "تطبيق" : "Apply"}
                          </button>
                        </div>
                        {couponError && (
                          <div className="flex items-center gap-2 text-destructive text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                            <AlertCircle className="w-4 h-4" />
                            <span>{couponError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-none h-12 px-6 bg-muted text-foreground rounded-2xl font-semibold text-sm hover:bg-muted/80 transition-all flex items-center gap-2"
                  >
                    {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {isAr ? "رجوع" : "Back"}
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!step1Valid}
                    className="flex-1 h-12 bg-primary text-primary-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isAr ? "التالي: المراجعة" : "Next: Review"}
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* ════ STEP 2: Review & Confirm ════ */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Address review */}
                <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-black text-foreground">{isAr ? "عنوان التوصيل" : "Delivery Address"}</h3>
                    </div>
                    <button
                      onClick={() => setStep(0)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      {isAr ? "تعديل" : "Edit"}
                    </button>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-4 space-y-1.5 text-sm">
                    <p className="font-bold text-foreground">{firstName} {lastName}</p>
                    <p className="text-muted-foreground">{phone}</p>
                    <p className="text-muted-foreground">
                      {street}{building ? `, ${building}` : ""}, {selectedCity?.name?.ar ?? selectedCity?.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedCountry?.name?.ar ?? selectedCountry?.name}
                      {postalCode ? ` - ${postalCode}` : ""}
                    </p>
                    {notes && (
                      <p className="text-muted-foreground/70 italic text-xs pt-1 border-t border-border/30">
                        {notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipping & Payment review */}
                <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-black text-foreground">{isAr ? "الشحن والدفع" : "Shipping & Payment"}</h3>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      {isAr ? "تعديل" : "Edit"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {previewResult?.delivery && (
                      <div className="flex items-center gap-3 bg-muted/30 rounded-2xl p-3.5">
                        <Truck className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-bold">{previewResult.delivery.providerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {isAr ? `${previewResult.delivery.estimatedDays} أيام عمل` : `${previewResult.delivery.estimatedDays} business days`}
                          </p>
                        </div>
                        <span className="ms-auto font-bold text-sm">
                          {previewResult.summary.shippingCost === 0
                            ? <span className="text-success">{isAr ? "مجاني" : "Free"}</span>
                            : formatCurrency(previewResult.summary.shippingCost)}
                        </span>
                      </div>
                    )}
                    {selectedPayment && (
                      <div className="flex items-center gap-3 bg-muted/30 rounded-2xl p-3.5">
                        <span className="text-xl">{PAYMENT_ICONS[selectedPayment.code] ?? "💳"}</span>
                        <div>
                          <p className="text-sm font-bold">
                            {isAr ? PAYMENT_LABELS_AR[selectedPayment.code] ?? selectedPayment.name : selectedPayment.name}
                          </p>
                          {selectedPayment.fees > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {isAr ? "رسوم:" : "Fees:"} {formatCurrency(selectedPayment.fees)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank transfer warning */}
                {(selectedPayment?.code === "bank_transfer" ||
                  selectedPayment?.code === "bankTransfer" ||
                  selectedPayment?.code === "banktransfer") && !receiptFile && (
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                      {isAr
                        ? "يرجى العودة ورفع إيصال التحويل البنكي قبل تأكيد الطلب"
                        : "Please go back and upload the bank transfer receipt before confirming"}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-none h-14 px-6 bg-muted text-foreground rounded-2xl font-semibold hover:bg-muted/80 transition-all flex items-center gap-2"
                  >
                    {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {isAr ? "رجوع" : "Back"}
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={
                      isSubmitting ||
                      ((selectedPayment?.code === "bank_transfer" ||
                        selectedPayment?.code === "bankTransfer" ||
                        selectedPayment?.code === "banktransfer") && !receiptFile)
                    }
                    className="flex-1 h-14 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isAr ? "جارٍ تقديم الطلب..." : "Placing order..."}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        {isAr ? "تأكيد الطلب" : "Place Order"}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  {isAr
                    ? "بالنقر على تأكيد الطلب، أنت توافق على "
                    : "By clicking Place Order, you agree to our "}
                  <Link href="/terms" className="text-primary hover:underline font-semibold">
                    {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-600">
            <OrderSummaryCard
              cartItems={cartItems}
              subtotal={subtotal}
              preview={previewResult}
              isAr={isAr}
              formatCurrency={formatCurrency}
              getTrans={getTrans}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
