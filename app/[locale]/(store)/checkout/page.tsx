"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckoutFormSchema,
  CheckoutFormValues,
} from "@/features/checkout/schemas/checkout.schema";
import {
  useCheckoutFlow,
  useCheckoutSummary,
  useActivePaymentMethods,
  useCountries,
  useCities,
} from "@/features/checkout/hooks/useCheckout";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { resolveItemData } from "@/features/cart/utils/cartUtils";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTrans } from "@/shared/hooks/useTrans";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { useToast } from "@/shared/hooks/useToast";

// Components
import { CheckoutStepIndicator } from "@/features/checkout/components/CheckoutStepIndicator";
import { CheckoutAddressStep } from "@/features/checkout/components/CheckoutAddressStep";
import { CheckoutShippingPaymentStep } from "@/features/checkout/components/CheckoutShippingPaymentStep";
import { CheckoutReviewStep } from "@/features/checkout/components/CheckoutReviewStep";
import { OrderSummaryCard } from "@/features/checkout/components/OrderSummaryCard";

export default function CheckoutPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const formatCurrency = useFormatCurrency();
  const toast = useToast();
  const getTrans = useTrans();
  const { data: user } = useMe();

  /* ─── Cart Data ───────────────────────────────────────────────── */
  const { data: serverCart } = useCart();
  const localCart = useCartStore((state) => state.items);
  const isAuth = !!user;
  const cartItems = isAuth ? serverCart?.items || [] : localCart;
  const subtotal = useMemo(
    () =>
      serverCart?.totalPrice ??
      cartItems.reduce((acc: number, item: any) => {
        const { price } = resolveItemData(item);
        return acc + (price || 0) * (item.quantity || 1);
      }, 0),
    [serverCart?.totalPrice, cartItems]
  );

  /* ─── Checkout Flow Hook ──────────────────────────────────────── */
  const {
    currentStep,
    nextStep,
    prevStep,
    submitAddress,
    selectShipping,
    selectPayment,
    applyCoupon,
    placeOrder,
    isSubmitting,
  } = useCheckoutFlow();

  /* ─── Form Setup ──────────────────────────────────────────────── */
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      countryId: "",
      regionId: "",
      cityId: "",
      street: "",
      building: "",
      postalCode: "",
      additionalInfo: "",
    },
    mode: "onBlur",
  });

  // Pre-fill user data
  useEffect(() => {
    if (user && user.name) {
      const parts = user.name.split(" ");
      form.setValue("firstName", parts[0] || "");
      form.setValue("lastName", parts.slice(1).join(" ") || "");
      form.setValue("phone", user.phone || "");
    }
  }, [user, form]);

  /* ─── Checkout Summary & Options ───────────────────────────────── */
  const { data: summaryData, isLoading: summaryLoading } = useCheckoutSummary();
  const previewResult = summaryData?.data ?? summaryData;
  const shippingOptions = useMemo(
    () => previewResult?.shippingOptions ?? [],
    [previewResult]
  );
  const { data: paymentMethods = [] } = useActivePaymentMethods();

  /* ─── Local State for Non-Form Fields ──────────────────────────── */
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  /* ─── Redirect if cart empty ───────────────────────────────────── */
  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace(`/${locale}/cart`);
    }
  }, [cartItems.length, locale, router]);

  /* ─── Auto-select options ──────────────────────────────────────── */
  useEffect(() => {
    if (currentStep >= 1 && shippingOptions.length > 0 && !selectedShippingId) {
      const firstId = shippingOptions[0].providerId;
      setSelectedShippingId(firstId);
      selectShipping(firstId);
    }
  }, [currentStep, shippingOptions, selectedShippingId, selectShipping]);

  useEffect(() => {
    if (currentStep >= 1 && paymentMethods.length > 0 && !selectedPaymentId) {
      const firstId = paymentMethods[0]._id;
      setSelectedPaymentId(firstId);
      selectPayment(firstId);
    }
  }, [currentStep, paymentMethods, selectedPaymentId, selectPayment]);

  /* ─── Handlers ─────────────────────────────────────────────────── */
  const handleShippingChange = (id: string) => {
    setSelectedShippingId(id);
    selectShipping(id);
  };

  const handlePaymentChange = (id: string) => {
    setSelectedPaymentId(id);
    selectPayment(id);
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    applyCoupon(
      couponInput,
      (res: any) => {
        const result = res?.data ?? res;
        if (result?.summary?.discount > 0) {
          setAppliedCoupon(couponInput);
          toast.success(
            isAr ? "تم تطبيق الكوبون بنجاح!" : "Coupon applied successfully!"
          );
        } else {
          setCouponError(
            isAr
              ? "هذا الكوبون لم يقدم أي خصم"
              : "This coupon did not apply any discount"
          );
        }
      },
      (err: any) => {
        const errMsg =
          err?.response?.data?.message ||
          err?.message ||
          (isAr ? "كوبون غير صالح" : "Invalid coupon");
        setCouponError(errMsg);
        toast.error(errMsg);
      }
    );
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setAppliedCoupon("");
    setCouponError(null);
    applyCoupon("", () => {
      toast.success(
        isAr ? "تم إزالة الكوبون بنجاح" : "Coupon removed successfully"
      );
    });
  };

  const handlePlaceOrder = () => {
    const fd = new FormData();
    if (receiptFile) fd.append("transferReceiptImg", receiptFile);

    const notes = form.getValues("additionalInfo");
    if (notes) fd.append("notes", notes);

    placeOrder(fd);
  };

  /* ─── Resolved Data for Review Step ───────────────────────────── */
  const countryId = form.watch("countryId");
  const regionId = form.watch("regionId");
  const cityId = form.watch("cityId");
  const { data: countries = [] } = useCountries();
  const { data: cities = [] } = useCities(regionId || null);

  const selectedCountry = countries.find((c: any) => c._id === countryId);
  const selectedCity = cities.find((c: any) => c._id === cityId);
  const selectedCountryName = isAr
    ? selectedCountry?.name?.ar || selectedCountry?.name
    : selectedCountry?.name?.en || selectedCountry?.name;
  const selectedCityName = isAr
    ? selectedCity?.name?.ar || selectedCity?.name
    : selectedCity?.name?.en || selectedCity?.name;

  const selectedShippingOption = shippingOptions.find(
    (opt: any) => opt.providerId === selectedShippingId
  );
  const selectedPayment = paymentMethods.find(
    (m: any) => m._id === selectedPaymentId
  );
  const isCODSupportedByCarrier = selectedShippingOption?.supportsCOD ?? false;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <Breadcrumb
          items={[
            { label: isAr ? "الرئيسية" : "Home", href: `/home` },
            { label: isAr ? "عربة التسوق" : "Cart", href: `/cart` },
            { label: isAr ? "إتمام الطلب" : "Checkout" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
          {/* Left: Steps */}
          <div className="lg:col-span-7 space-y-6">
            <CheckoutStepIndicator currentStep={currentStep} isAr={isAr} />

            <FormProvider {...form}>
              {currentStep === 0 && (
                <CheckoutAddressStep
                  isAr={isAr}
                  onNext={() => submitAddress(form.getValues())}
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep === 1 && (
                <CheckoutShippingPaymentStep
                  isAr={isAr}
                  summaryLoading={summaryLoading}
                  shippingOptions={shippingOptions}
                  paymentMethods={paymentMethods}
                  selectedShippingId={selectedShippingId}
                  handleShippingChange={handleShippingChange}
                  selectedPaymentId={selectedPaymentId}
                  selectedPayment={selectedPayment}
                  handlePaymentChange={handlePaymentChange}
                  isCODSupportedByCarrier={isCODSupportedByCarrier}
                  formatCurrency={formatCurrency}
                  couponInput={couponInput}
                  setCouponInput={setCouponInput}
                  appliedCoupon={appliedCoupon}
                  handleApplyCoupon={handleApplyCoupon}
                  handleRemoveCoupon={handleRemoveCoupon}
                  couponError={couponError}
                  receiptFile={receiptFile}
                  setReceiptFile={setReceiptFile}
                  onBack={prevStep}
                  onNext={nextStep}
                  isValid={!!selectedShippingId && !!selectedPaymentId}
                />
              )}

              {currentStep === 2 && (
                <CheckoutReviewStep
                  isAr={isAr}
                  selectedCityName={selectedCityName}
                  selectedCountryName={selectedCountryName}
                  selectedShippingProviderName={
                    selectedShippingOption?.providerName || ""
                  }
                  selectedPayment={selectedPayment}
                  onBack={prevStep}
                  onPlaceOrder={handlePlaceOrder}
                  isSubmitting={isSubmitting}
                />
              )}
            </FormProvider>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-5 relative z-10">
            <OrderSummaryCard
              cartItems={cartItems}
              subtotal={subtotal}
              preview={previewResult}
              isAr={isAr}
              formatCurrency={formatCurrency}
              getTrans={getTrans}
              showPreviewDetails={currentStep > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
