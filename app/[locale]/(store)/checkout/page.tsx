"use client";

import {
  useEffect,
  useMemo,
  useState,
  startTransition,
  useCallback,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckoutFormSchema,
  CheckoutFormValues,
} from "@/features/checkout/schemas/checkout.schema";
import {
  useCheckoutFlow,
  useCheckoutSummary,
  useActivePaymentMethods,
} from "@/features/checkout/hooks/useCheckout";
import {
  useCountries,
  useCities,
} from "@/features/locations/hooks/useLocations";
import { usePaymentRedirector } from "@/features/checkout/hooks/usePaymentRedirector";
import { useCheckoutReviewData } from "@/features/checkout/hooks/useCheckoutReviewData";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTrans } from "@/shared/hooks/useTrans";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { useSettings } from "@/app/providers/SettingsProvider";

// Components
import { CheckoutStepIndicator } from "@/features/checkout/components/CheckoutStepIndicator";
import { CheckoutAddressStep } from "@/features/checkout/components/CheckoutAddressStep";
import { CheckoutShippingPaymentStep } from "@/features/checkout/components/CheckoutShippingPaymentStep";
import { CheckoutReviewStep } from "@/features/checkout/components/CheckoutReviewStep";
import { OrderSummaryCard } from "@/features/checkout/components/OrderSummaryCard";

export default function CheckoutPage() {
  /* ────── Data ─────────────────────────────────────── */
  // check if user is authenticated
  const { data: user } = useMe();
  const isAuth = !!user;
  // get settings
  const settings = useSettings();
  const currency = settings.currencyCode;
  // get checkout summary data
  const { data: previewResult, isLoading: summaryLoading } = useCheckoutSummary(
    { enabled: isAuth },
  );
  // get countries
  const { data: countries = [] } = useCountries();
  // get cart items from server
  const { data: serverCart } = useCart();

  console.log("previewResult", previewResult);
  /* ─────────────────────────────────────────── HOOKS ──────────────────────────────────────────────── */
  const router = useRouter();
  const getTrans = useTrans();
  const { redirect } = usePaymentRedirector();
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("cart");
  /* ─── Local State for Non-Form Fields ──────────────────────────── */
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const nextStep = useCallback(
    () => setCurrentStep((p: number) => Math.min(p + 1, 2)),
    [],
  );
  const prevStep = useCallback(
    () => setCurrentStep((p: number) => Math.max(p - 1, 0)),
    [],
  );

  // shipping options from preview result
  const shippingOptions = useMemo(
    () => previewResult?.shippingOptions ?? [],
    [previewResult],
  );

  /* ─── Checkout Flow Hook */
  const {
    submitAddress,
    selectShipping,
    selectPayment,
    placeOrder,
    isSubmitting,
  } = useCheckoutFlow();

  /* ────── ────── ────── ────── ────── ────── Cart Data ────── ────── ────── ────── ────── ────── ────── ────── */
  // get cart items from store
  const localCart = useCartStore((state) => state.items);

  // merge cart items - wrapped in useMemo to stabilize the reference
  const cartItems = useMemo(
    () => (isAuth ? serverCart?.items || [] : localCart),
    [isAuth, serverCart?.items, localCart],
  );

  // calculate subtotal from items
  const subtotal = useMemo(
    () =>
      // if user is authenticated get total price from server else get from store
      serverCart?.totalPrice ??
      cartItems.reduce((acc: number, item: CartItem) => {
        // resolve item data
        const { price } = resolveItemData(item);
        // add item total price to accumulator
        return acc + (price || 0) * (item.quantity || 1);
      }, 0),
    // dependencies
    [serverCart?.totalPrice, cartItems],
  );

  /* ─── Form Setup ──────────────────────────────────────────────── */
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      countryId: previewResult?.session?.address?.countryId ?? "",
      regionId: previewResult?.session?.address?.regionId ?? "",
      cityId: previewResult?.session?.address?.cityId ?? "",
      street: previewResult?.session?.address?.street ?? "",
      building: previewResult?.session?.address?.building ?? "",
      postalCode: previewResult?.session?.address?.postalCode ?? "",
      additionalInfo: "",
    },
    mode: "onBlur",
  });

  const countryId = useWatch({ control: form.control, name: "countryId" });

  // get payment methods
  const { data: paymentMethods = [] } = useActivePaymentMethods(currency, countryId);
  console.log("paymentMethods", paymentMethods);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user && user.name) {
      const parts = user.name.split(" ");
      form.setValue("firstName", parts[0] || "");
      form.setValue("lastName", parts.slice(1).join(" ") || "");
      form.setValue("phone", user.phone || "");
    }
  }, [user, form]);

  /* ─── Redirect if cart empty ───────────────────────────────────── */
  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace(`/cart`);
    }
  }, [cartItems.length, router]);

  /* ─── Auto-select options ──────────────────────────────────────── */
  useEffect(() => {
    if (currentStep >= 1 && shippingOptions.length > 0 && !selectedShippingId) {
      const firstId = shippingOptions[0].providerId;
      startTransition(() => setSelectedShippingId(firstId));
      selectShipping(firstId);
    }
  }, [currentStep, shippingOptions, selectedShippingId, selectShipping]);

  useEffect(() => {
    if (currentStep >= 1 && paymentMethods.length > 0 && !selectedPaymentId) {
      const firstId = paymentMethods[0]._id;
      startTransition(() => setSelectedPaymentId(firstId));
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

  const handlePlaceOrder = async () => {
    const fd = new FormData();
    if (receiptFile) fd.append("transferReceiptImg", receiptFile);

    const notes = form.getValues("additionalInfo");
    if (notes) fd.append("notes", notes);

    try {
      const resData = await placeOrder(fd);
      redirect(resData);
    } catch (error) {
      console.log(error);
    }
  }; 

  /* ─── Resolved Data for Review Step ───────────────────────────── */
  const regionId = useWatch({ control: form.control, name: "regionId" });
  const { data: cities = [] } = useCities(regionId || undefined);

  const {
    selectedCityName,
    selectedCountryName,
    selectedShippingOption,
    selectedPayment,
    isCODSupportedByCarrier,
  } = useCheckoutReviewData({
    form,
    countries,
    cities,
    shippingOptions,
    paymentMethods,
    getTrans,
    selectedShippingId,
    selectedPaymentId,
  });

  return (
    <div className="min-h-screen pt-24 pb-20 bg-accent/30">
      <div className="container mx-auto px-4 sm:px-6">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), href: `/home` },
            { label: t("breadcrumb.cart"), href: `/cart` },
            { label: t("breadcrumb.checkout") },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
          {/* Left: Steps */}
          <div className="lg:col-span-7 space-y-6">
            <CheckoutStepIndicator currentStep={currentStep} />

            <FormProvider {...form}>
              {currentStep === 0 && (
                <CheckoutAddressStep
                  onNext={() =>
                    submitAddress(form.getValues(), () => nextStep())
                  }
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep === 1 && (
                <CheckoutShippingPaymentStep
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
                  receiptFile={receiptFile}
                  setReceiptFile={setReceiptFile}
                  onBack={prevStep}
                  onNext={nextStep}
                  isValid={!!selectedShippingId && !!selectedPaymentId}
                />
              )}

              {currentStep === 2 && (
                <CheckoutReviewStep
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
              showPreviewDetails={currentStep > 0}
              checkoutMode
              isCartUpdating={isSubmitting || summaryLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
