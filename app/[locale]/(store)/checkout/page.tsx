"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  useCountries,
  useRegions,
  useCities,
  useActivePaymentMethods,
  useCheckoutSummary,
  useSetAddress,
  useSetShippingMethod,
  useSetPaymentMethod,
  useApplyCoupon,
  usePlaceOrder,
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
} from "lucide-react";
import { useShippingRates } from "@/features/shipping/hooks/useShippingRates";
import { useGetTaxByCountry, useTaxes } from "@/features/taxes/hooks/useTaxes";

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
function StepIndicator({ current, isAr }: { current: number; isAr: boolean }) {
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
                  ${
                    isDone
                      ? "bg-success text-white scale-90"
                      : isActive
                        ? "bg-primary text-primary-foreground scale-110 shadow-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap text-center leading-tight transition-colors
                  ${
                    isActive
                      ? "text-primary"
                      : isDone
                        ? "text-success"
                        : "text-muted-foreground"
                  }`}
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
          <option value="">
            {isLoading ? "جارٍ التحميل..." : placeholder}
          </option>
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
          ${
            error
              ? "border-destructive focus:border-destructive"
              : "border-border/60 focus:border-primary"
          }`}
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
                  <Image
                    src={image}
                    alt={title as string}
                    fill
                    className="object-cover"
                  />
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
                <p className="text-sm font-semibold text-foreground truncate">
                  {title as string}
                </p>
                <p className="text-xs text-muted-foreground">
                  × {item.quantity}
                </p>
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
          <span className="text-muted-foreground">
            {isAr ? "المجموع الفرعي" : "Subtotal"}
          </span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>

        {preview ? (
          <>
            {preview?.summary?.shippingCost > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr ? "الشحن" : "Shipping"}
                </span>
                <span className="font-semibold">
                  {formatCurrency(preview.summary.shippingCost)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr ? "الشحن" : "Shipping"}
                </span>
                <span className="font-bold text-success text-xs bg-success/10 px-2 py-0.5 rounded-lg">
                  {isAr ? "مجاني" : "Free"}
                </span>
              </div>
            )}
            {preview?.summary?.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr
                    ? `الضريبة (${preview.summary.taxPercentage}%)`
                    : `Tax (${preview.summary.taxPercentage}%)`}
                </span>
                <span className="font-semibold">
                  {formatCurrency(preview?.summary?.taxAmount)}
                </span>
              </div>
            )}
            {preview?.summary?.paymentFees > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAr ? "رسوم الدفع" : "Payment Fees"}
                </span>
                <span className="font-semibold">
                  {formatCurrency(preview?.summary?.paymentFees)}
                </span>
              </div>
            )}
            {preview?.summary?.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-success font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {isAr ? "خصم الكوبون" : "Coupon Discount"}
                </span>
                <span className="font-bold text-success">
                  -{formatCurrency(preview?.summary?.discount)}
                </span>
              </div>
            )}
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-foreground">
                {isAr ? "الإجمالي" : "Total"}
              </span>
              <span className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(preview?.summary?.total)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isAr ? "الشحن" : "Shipping"}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {isAr ? "يحسب لاحقاً" : "Calculated next"}
              </span>
            </div>
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-foreground">
                {isAr ? "الإجمالي" : "Total"}
              </span>
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
            <p className="text-xs font-bold text-foreground">
              {isAr ? "دفع آمن ومشفر" : "Secure & Encrypted"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              SSL / 256-bit encryption
            </p>
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
  const toast = useToast();
  const getTrans = useTrans();
  // data
  const settings = useSettings();
  const { data: user } = useMe();

  /* ─── Cart Data ───────────────────────────────────────────────── */
  const { data: serverCart } = useCart();
  const guestCartItems = useCartStore((s) => s.items);
  const cartItems: CartItem[] = useMemo(
    () => (user ? serverCart?.items || [] : guestCartItems || []),
    [user, serverCart?.items, guestCartItems],
  );

  const subtotal = useMemo(
    () =>
      serverCart?.totalPrice ??
      cartItems.reduce((acc: number, item: CartItem) => {
        const { price } = resolveItemData(item);
        return acc + (price || 0) * (item.quantity || 1);
      }, 0),
    [serverCart?.totalPrice, cartItems],
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
  // ======> check if has custom Taxes or Shipping Rates <======
  // has Custom Shipping Rates
  const hasCustomShippingRates = useMemo(() => {
    return !!settings?.hasCustomShippingRates;
  }, [settings]);

  const enableCoupons = useMemo(() => {
    return !!settings?.features?.coupons;
  }, [settings]);
  //  has Custom Taxes
  const hasCustomTaxes = useMemo(() => {
    return !!settings?.hasCustomTaxes;
  }, [settings]);

  /* ─── Locations ────────────────────────────────────────────────── */
  const { data: countries = [], isLoading: loadingCountries } = useCountries();
  const { data: regions = [], isLoading: loadingRegions } = useRegions(
    countryId || null,
  );
  const { data: cities = [], isLoading: loadingCities } = useCities(
    regionId || null,
  );
  // fetch shipping rates
  const { data: shippingRates = [], isLoading: loadingShippingRates } =
    useShippingRates({country: '6a0709145a8915b402f4c610', region: '6a0709195a8915b402f4c6e2', city: '6a0709195a8915b402f4c6f1'});
    console.log("shippingRates", shippingRates);
    
  // fetch tax rates
  const { data: taxRates = [], isLoading: loadingTaxRates } = useGetTaxByCountry(countryId);

  /* ─── Payment Methods ──────────────────────────────────────────── */
  const { data: paymentMethods = [] } = useActivePaymentMethods();

  /* ─── Checkout Summary ─────────────────────────────────────────── */
  const { data: summaryData, isLoading: summaryLoading } = useCheckoutSummary();
  const { mutate: setAddressAsync, isPending: settingAddress } = useSetAddress();
  const { mutate: setShippingMethodAsync, isPending: settingShipping } = useSetShippingMethod();
  const { mutate: setPaymentMethodAsync, isPending: settingPayment } = useSetPaymentMethod();
  const { mutate: applyCouponAsync, isPending: applyingCoupon } = useApplyCoupon();
  const { mutate: placeOrder, isPending: placingOrder } = usePlaceOrder();

  const previewResult = summaryData?.data ?? summaryData;

  const shippingOptions: ShippingOption[] = useMemo(
    () => previewResult?.shippingOptions ?? [],
    [previewResult],
  );
  const selectedPayment: PaymentMethod | undefined = paymentMethods.find(
    (m: PaymentMethod) => m._id === selectedPaymentId,
  );

  // تحقق ما إذا كانت شركة التوصيل المحددة تدعم الدفع عند الاستلام
  const selectedShippingOption = shippingOptions.find(
    (opt) => opt.providerId === selectedShippingId,
  );
  const isCODSupportedByCarrier = selectedShippingOption?.supportsCOD ?? false;

  /* ─── Reset downstream on location change ─────────────────────── */
  useEffect(() => {
    setRegionId("");
    setCityId("");
  }, [countryId]);

  useEffect(() => {
    setCityId("");
  }, [regionId]);

  /* ─── Change Handlers ───────────────────────────────────────────── */
  const handleShippingChange = (id: string) => {
    setSelectedShippingId(id);
    if (id) setShippingMethodAsync(id);
  };

  const handlePaymentChange = (id: string) => {
    setSelectedPaymentId(id);
    if (id) setPaymentMethodAsync(id);
  };

  // When step 0 is submitted
  const handleAddressSubmit = () => {
    if (!step0Valid) return;
    const addressData = {
      firstName,
      lastName,
      phone,
      countryId,
      regionId,
      cityId,
      street,
      building,
      postalCode,
      additionalInfo,
    };
    setAddressAsync(addressData, {
      onSuccess: () => setStep(1),
      onError: (err: Error | unknown) => toast.error((err as Error).message || "Failed to set address"),
    });
  };

  const handleApplyCoupon = useCallback(() => {
    if (!couponInput.trim()) return;
    setCouponError(null);

    applyCouponAsync(couponInput, {
      onSuccess: (res: Record<string, unknown> | unknown) => {
        const result = (res as any)?.data ?? res;
        if (result?.summary?.discount > 0) {
          setAppliedCoupon(couponInput);
          setCouponError(null);
          toast.success(
            isAr ? "تم تطبيق الكوبون بنجاح!" : "Coupon applied successfully!",
          );
        } else {
          setCouponError(
            isAr
              ? "هذا الكوبون لم يقدم أي خصم"
              : "This coupon did not apply any discount",
          );
        }
      },
      onError: (err: Error | unknown) => {
        const errMsg =
          (err as any).response?.data?.message ||
          (err as Error).message ||
          (isAr ? "كوبون غير صالح" : "Invalid coupon");
        setCouponError(errMsg);
        toast.error(errMsg);
      },
    });
  }, [
    couponInput,
    applyCouponAsync,
    isAr,
    toast,
  ]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponInput("");
    setAppliedCoupon("");
    setCouponError(null);

    applyCouponAsync("", {
      onSuccess: () => {
        toast.success(isAr ? "تم إزالة الكوبون بنجاح" : "Coupon removed successfully");
      }
    });
  }, [applyCouponAsync, isAr, toast]);

  /* ─── Auto-select first shipping & first payment ──────────────────── */
  useEffect(() => {
    if (shippingOptions.length > 0 && !selectedShippingId) {
      const firstId = shippingOptions[0].providerId;
      setSelectedShippingId(firstId);
      setShippingMethodAsync(firstId); // persist to backend session
    }
  }, [shippingOptions, selectedShippingId, setShippingMethodAsync]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentId) {
      const firstId = paymentMethods[0]._id;
      setSelectedPaymentId(firstId);
      setPaymentMethodAsync(firstId); // persist to backend session
    }
  }, [paymentMethods, selectedPaymentId, setPaymentMethodAsync]);


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
    const fd = new FormData();
    if (receiptFile) fd.append("transferReceiptImg", receiptFile);
    if (notes) fd.append("notes", notes);
    
    placeOrder(fd);
  }, [
    notes,
    receiptFile,
    placeOrder,
  ]);

  const isSubmitting = placingOrder;

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
            {isAr
              ? "أكمل بياناتك لتأكيد طلبك"
              : "Complete your details to confirm your order"}
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
                      label: isAr ? c.name?.ar || c.name : c.name?.en || c.name,
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
                      label: isAr ? r.name?.ar || r.name : r.name?.en || r.name,
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
                      label: isAr ? c.name?.ar || c.name : c.name?.en || c.name,
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
                    placeholder={
                      isAr ? "اسم الشارع والرقم" : "Street name and number"
                    }
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
                      placeholder={
                        isAr
                          ? "ملاحظات للسائق أو أي تعليمات خاصة..."
                          : "Notes for the driver or special instructions..."
                      }
                      rows={3}
                      className="w-full px-4 py-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {/* Next btn */}
                <button
                  onClick={handleAddressSubmit}
                  disabled={!step0Valid || settingAddress}
                  className="mt-8 w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isAr ? "التالي: الشحن والدفع" : "Next: Shipping & Payment"}
                  {isAr ? (
                    <ArrowLeft className="w-5 h-5" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}

            {/* ════ STEP 1: Shipping + Payment ════ */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-300">
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

                  {summaryLoading && !shippingOptions.length ? (
                    <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">
                        {isAr
                          ? "جارٍ حساب الشحن..."
                          : "Calculating shipping..."}
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
                              <p className="font-semibold text-sm">
                                {option.providerName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {isAr ? "المدة المتوقعة:" : "Est. Delivery:"}{" "}
                                {option.estimatedDays} {isAr ? "أيام" : "days"}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-sm">
                            {option.totalShippingCost > 0
                              ? formatCurrency(option.totalShippingCost)
                              : isAr
                                ? "مجاني"
                                : "Free"}
                          </span>
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

                  <div className="grid gap-4">
                    {paymentMethods.map((method) => {
                      const isCOD = method.code.toLowerCase() === "cod";
                      // تعطيل الدفع عند الاستلام اذا كانت شركة الشحن لا تدعمه
                      const disabled = isCOD && !isCODSupportedByCarrier;

                      return (
                        <label
                          key={method._id}
                          className={`relative flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                            disabled
                              ? "opacity-50 cursor-not-allowed bg-muted/20"
                              : selectedPaymentId === method._id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border/60 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method._id}
                              disabled={disabled}
                              checked={selectedPaymentId === method._id}
                              onChange={() => handlePaymentChange(method._id)}
                              className="w-4 h-4 text-primary focus:ring-primary/50"
                            />
                            <div className="text-xl">
                              {PAYMENT_ICONS[method.code.toLowerCase()] || "💳"}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {isAr
                                  ? PAYMENT_LABELS_AR[
                                      method.code.toLowerCase()
                                    ] || method.name
                                  : method.name}
                              </p>
                              {disabled && (
                                <p className="text-xs text-destructive mt-1">
                                  {isAr
                                    ? "شركة الشحن لا تدعم الدفع عند الاستلام"
                                    : "Carrier does not support COD"}
                                </p>
                              )}
                            </div>
                          </div>
                          {method.fees > 0 && (
                            <span className="text-xs text-muted-foreground">
                              +{formatCurrency(method.fees)}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Coupon Box */}
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

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep(0)}
                    className="w-1/3 h-14 bg-muted text-foreground rounded-2xl font-bold text-base hover:bg-muted/80 transition-all"
                  >
                    {isAr ? "رجوع" : "Back"}
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!step1Valid || summaryLoading}
                    className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAr ? "مراجعة الطلب" : "Review Order"}
                    {isAr ? (
                      <ArrowLeft className="w-5 h-5" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ════ STEP 2: Review & Confirm ════ */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
                  <h2 className="text-xl font-black text-foreground mb-4">
                    {isAr ? "مراجعة البيانات" : "Review Details"}
                  </h2>
                  <div className="space-y-4 text-sm bg-muted/20 p-4 rounded-xl border border-border/40">
                    <div className="flex justify-between border-b border-border/40 pb-3">
                      <span className="text-muted-foreground">
                        {isAr ? "الاسم" : "Name"}
                      </span>
                      <span className="font-semibold">
                        {firstName} {lastName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-3">
                      <span className="text-muted-foreground">
                        {isAr ? "العنوان" : "Address"}
                      </span>
                      <span className="font-semibold text-end">
                        {street}, {selectedCity?.name?.ar || selectedCity?.name}
                        , {selectedCountry?.name?.ar || selectedCountry?.name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-3">
                      <span className="text-muted-foreground">
                        {isAr ? "طريقة الشحن" : "Shipping"}
                      </span>
                      <span className="font-semibold">
                        {selectedShippingOption?.providerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {isAr ? "طريقة الدفع" : "Payment"}
                      </span>
                      <span className="font-semibold">
                        {isAr
                          ? PAYMENT_LABELS_AR[
                              selectedPayment?.code.toLowerCase() || ""
                            ] || selectedPayment?.name
                          : selectedPayment?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upload Receipt for Bank Transfer */}
                {(selectedPayment?.code === "bank_transfer" ||
                  selectedPayment?.code === "bankTransfer" ||
                  selectedPayment?.code === "banktransfer") && (
                  <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-primary" />
                      {isAr ? "إرفاق إيصال التحويل" : "Upload Transfer Receipt"}
                    </h2>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setReceiptFile(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    {!receiptFile && (
                      <p className="text-xs text-destructive mt-2">
                        {isAr
                          ? "* يرجى إرفاق صورة الإيصال لإتمام الطلب"
                          : "* Receipt image is required to complete order"}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="w-1/3 h-14 bg-muted text-foreground rounded-2xl font-bold text-base hover:bg-muted/80 transition-all disabled:opacity-50"
                  >
                    {isAr ? "رجوع" : "Back"}
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={
                      isSubmitting ||
                      (selectedPayment?.code.toLowerCase().includes("bank") &&
                        !receiptFile)
                    }
                    className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {isSubmitting
                      ? isAr
                        ? "جارٍ التأكيد..."
                        : "Confirming..."
                      : isAr
                        ? "تأكيد الطلب"
                        : "Confirm Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Summary ── */}
          <div className="lg:col-span-5 relative z-10">
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
