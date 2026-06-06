"use client";

import { useMemo, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import {
  useCart,
  useRemoveFromCart,
  useClearCart,
  useUpdateCartQuantity,
  useCouponValidation,
  CouponValidationResult,
} from "@/features/cart/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useSettings } from "@/app/providers/SettingsProvider";

import { useTrans } from "@/shared/hooks/useTrans";
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { CartItemCard } from "@/features/cart/components/CartItemCard";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  OrdersIcon,
  ShieldIcon,
  ShoppingBagIcon,
  TrashIcon,
  TruckIcon,
} from "@/shared/ui/Icons";
import { Input } from "@/shared/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useToast } from "@/shared/hooks/useToast";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { useApplyCoupon } from "@/features/checkout/hooks/useCheckout";
import ErrorMessage from "@/shared/ui/ErrorMessage";

/* ------------------------------------------------------------------ */
/* Page                                                              */
/* ------------------------------------------------------------------ */
export default function CartPage() {
  // ======> Hooks <======
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResult | null>(null);

  const t = useTranslations("cart");
  const locale = useLocale();
  const formatCurrency = useFormatCurrency();
  const getTrans = useTrans();
  const toast = useToast();
  const isAr = locale === "ar";

  // ======> Data <======
  const settings = useSettings();
  const { data: user } = useMe();
  const { data: serverCart, isLoading } = useCart();

  // ======> cart operations <======
  const { mutate: removeServerItem, isPending: isRemoving } =
    useRemoveFromCart();
  const { mutate: clearServerCart, isPending: clearServerCartPending } =
    useClearCart();
  const {
    mutate: updateServerQuantity,
    isPending: updateServerQuantityPending,
  } = useUpdateCartQuantity();

  const { mutateAsync: validateCoupon, isPending: validateCouponPending } =
    useApplyCoupon();
  // ======> cart states <======
  const guestCartItems = useCartStore((state) => state.items);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const clearGuestCart = useCartStore((state) => state.clearCart);

  // ======> cart items <======
  const cartItems = useMemo(() => {
    return user ? serverCart?.items || [] : guestCartItems || [];
  }, [user, serverCart?.items, guestCartItems]);

  // ======> total quantity <======
  const totalQuantity = useMemo(() => {
    return (
      serverCart?.totalQuantity ??
      cartItems.reduce(
        (acc: number, item: CartItem) => acc + (item.quantity || 1),
        0,
      )
    );
  }, [serverCart?.totalQuantity, cartItems]);

  // ======> cart actions <======
  // remove item from cart
  const handleRemoveItem = useCallback(
    (productId: string, variantId?: string) => {
      if (!productId) return;
      if (user) removeServerItem(productId);
      else removeGuestItem(productId, variantId);
    },
    [user, removeServerItem, removeGuestItem],
  );
  // update item quantity in cart
  const handleUpdateQuantity = useCallback(
    (productId: string, variantId: string, newQty: number) => {
      if (!productId) return;
      const safeQty = Math.max(1, Number(newQty) || 1);
      if (user) {
        updateServerQuantity({ productId, variantId, quantity: safeQty });
      } else {
        updateGuestQuantity(productId, variantId, safeQty);
      }
    },
    [user, updateServerQuantity, updateGuestQuantity],
  );
  // clear cart
  const handleClearCart = useCallback(() => {
    if (user) clearServerCart();
    else clearGuestCart();
  }, [user, clearServerCart, clearGuestCart]);

  // ======> cart subtotal <======
  const subtotal = useMemo(() => {
    return (
      serverCart?.totalPrice ??
      cartItems.reduce((acc: number, item: CartItem) => {
        const { price } = resolveItemData(item);
        return acc + (price || 0) * (item.quantity || 1);
      }, 0)
    );
  }, [serverCart?.totalPrice, cartItems]);

  // derived state update / render phase trigger to reset coupon state when subtotal changes.
  // This is safe, runs in a single render cycle, and avoids the "setState inside useEffect" lint error.
  const [prevSubtotal, setPrevSubtotal] = useState(subtotal);
  if (prevSubtotal !== subtotal) {
    setPrevSubtotal(subtotal);
    setAppliedCoupon(null);
  }

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

  // ======> vat rate <======
  const vatRate = settings?.vatRate || 15;

  // ======> cart tax <======
  const tax = useMemo(() => {
    // if custom tax is enabled, return 0
    if (hasCustomTaxes) return 0;
    // otherwise, return the calculated tax from global settings
    return settings?.taxesIncluded ? 0 : subtotal * (vatRate / 100);
  }, [settings?.taxesIncluded, subtotal, vatRate, hasCustomTaxes]);

  // ======> cart base total <======
  const baseTotalAmount = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  // ======> cart final total after discount <======
  const totalAmount = useMemo(() => {
    if (appliedCoupon) {
      return (
        appliedCoupon.totalPriceAfterDiscount ??
        Math.max(0, baseTotalAmount - appliedCoupon.discountAmount)
      );
    }
    return baseTotalAmount;
  }, [baseTotalAmount, appliedCoupon]);

  // for guest checkout
  const checkoutHref = useMemo(() => {
    if (!user && !settings?.features?.guestCheckout) {
      return "/login?redirect=/checkout";
    }
    return "/checkout";
  }, [user, settings?.features?.guestCheckout]);

  // add coupon
  const couponSchema = z.object({
    couponCode: z.string().min(1, "Coupon code is required"),
  });

  type couponFormValues = z.infer<typeof couponSchema>;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<couponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      couponCode: "",
    },
  });

  const onSubmit = async (data: couponFormValues) => {
    if (!user) {
      toast.warning(t("messages.login_to_apply_coupon"));
      return;
    }

    try {
      const res = await validateCoupon(data.couponCode);
      setAppliedCoupon(res);
      console.log("res is: ", res);

      toast.success(t("messages.couponApplied"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "something went wrong";
      toast.error(errorMessage);
    }
  };

  const isCartUpdating =
    isRemoving || updateServerQuantityPending || clearServerCartPending;

  /* ── Loading ── */
  if (isLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {t("misc.loading_cart")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-24 bg-accent/70 selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <ScrollReveal animation="fade" delay={200}>
          <Breadcrumb
            items={[
              { label: t("misc.home"), href: "/" },
              { label: t("title") },
            ]}
          />
        </ScrollReveal>
        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 max-w-md mx-auto gap-6">
            <div className="w-28 h-28 rounded-full bg-accent flex items-center justify-center">
              <ScrollReveal animation="slide-up" delay={100}>
                <ShoppingBagIcon className="w-14 h-14 text-muted-foreground/40" />
              </ScrollReveal>
            </div>
            <ScrollReveal animation="slide-up" delay={100}>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {t("empty.title")}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("empty.subtitle")}
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex mt-3 items-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3.5 font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-[1.02]"
              >
                {t("empty.cta")}
                {isAr ? (
                  <ArrowLeftIcon className="w-4 h-4" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4" />
                )}
              </Link>
            </ScrollReveal>
          </div>
        ) : (
          <div className="w-full">
            {/* Page heading + clear */}
            <div className="flex items-center justify-between">
              <ScrollReveal animation="slide-right">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="size-8 text-primary" />
                  <h1 className="text-2xl sm:text-3xl font-bold title-gradient tracking-tight">
                    {t("title")}
                  </h1>
                </div>

                <p className="text-sm text-muted-foreground mt-0.5">
                  {totalQuantity}{" "}
                  {totalQuantity === 1
                    ? t("misc.item_count_single")
                    : t("misc.item_count_plural")}
                </p>
              </ScrollReveal>
              {cartItems.length > 0 && (
                <ScrollReveal animation="slide-left">
                  <button
                    onClick={handleClearCart}
                    disabled={isCartUpdating}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <TrashIcon
                      className={`w-4 h-4 text-destructive ${clearServerCartPending ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">
                      {t("misc.clear_cart")}
                    </span>
                  </button>
                </ScrollReveal>
              )}
            </div>
            {/* ── Cart Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start mt-6">
              {/* ════════════════════════════
                LEFT — Items Column
            ════════════════════════════ */}
              <div className="space-y-5">
                {/* Items list */}
                <div className="space-y-3">
                  {cartItems.map((item: CartItem, idx: number) => {
                    const uniqueKey = [
                      item.product?._id || item.productId,
                      item.variant?._id || item.variantId,
                      idx,
                    ]
                      .filter(Boolean)
                      .join("-");

                    return (
                      <ScrollReveal
                        key={uniqueKey}
                        delay={idx * 50}
                        animation="slide-up"
                      >
                        <CartItemCard
                          item={item}
                          idx={idx}
                          isAr={isAr}
                          isRemoving={isCartUpdating}
                          formatCurrency={formatCurrency}
                          onRemove={handleRemoveItem}
                          onUpdateQty={handleUpdateQuantity}
                        />
                      </ScrollReveal>
                    );
                  })}
                </div>

                {/* Continue shopping */}
                <ScrollReveal
                  animation="slide-right"
                  delay={cartItems.length * 50}
                >
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mt-1"
                  >
                    {isAr ? (
                      <ArrowRightIcon className="w-4 h-4" />
                    ) : (
                      <ArrowLeftIcon className="w-4 h-4" />
                    )}
                    {t("misc.continue_shopping")}
                  </Link>
                </ScrollReveal>
              </div>

              {/* ════════════════════════════
                RIGHT — Order Summary
            ════════════════════════════ */}
              <div className="lg:sticky lg:top-28">
                <ScrollReveal
                  animation="slide-up"
                  delay={cartItems.length * 50}
                >
                  <div className="bg-card border border-border/50 rounded-3xl overflow-hidden ">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-5 border-b border-border/40 bg-accent/50 flex items-center justify-between">
                      <h2 className="text-lg font-bold title-gradient">
                        {t("summary.title")}
                      </h2>
                      <OrdersIcon className="size-7 text-primary " />
                    </div>

                    {/* Items mini-list */}
                    <div className="px-6 py-4 border-b border-border/40 max-h-44 overflow-y-auto space-y-2.5">
                      {cartItems.map((item: CartItem, idx: number) => {
                        const product = item.product;
                        if (!product) return null;
                        const title = getTrans(product.title);
                        const { price } = resolveItemData(item);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="text-muted-foreground truncate flex-1 leading-snug">
                              {title as string}
                              <span className="text-xs ms-1 opacity-50">
                                ×{item.quantity}
                              </span>
                            </span>
                            <span className="font-semibold text-foreground shrink-0 tabular-nums">
                              {formatCurrency(
                                (price || 0) * (item.quantity || 1),
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pricing breakdown */}
                    <div className="px-6 py-5 space-y-3">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("summary.subtotal")}
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>

                      {/* Tax */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("summary.tax")}
                        </span>
                        {hasCustomTaxes ? (
                          <span className="text-xs text-muted-foreground bg-accent px-2.5 py-1 rounded-lg border border-border/50">
                            {t("summary.calculated_at_checkout")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground tabular-nums">
                            {vatRate}%
                          </span>
                        )}
                      </div>

                      {/* Shipping */}
                      {hasCustomShippingRates ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("summary.shipping")}
                          </span>
                          <span className="text-xs text-muted-foreground bg-accent px-2.5 py-1 rounded-lg border border-border/50">
                            {t("summary.calculated_at_checkout")}
                          </span>
                        </div>
                      ) : (
                        <>
                          {tax > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {t("summary.tax")} ({vatRate}%)
                              </span>
                              <span className="font-semibold text-foreground tabular-nums">
                                {formatCurrency(tax)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t("summary.shipping")}
                            </span>
                            <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-lg">
                              {t("summary.free")}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Coupon discount row */}
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-sm pt-1">
                          <span className="font-medium text-success flex items-center gap-1.5">
                            {t("coupon.discount")}
                            <span className="text-[11px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-md uppercase">
                              {appliedCoupon?.couponDetails?.couponType ===
                              "percentage"
                                ? `${appliedCoupon?.couponDetails?.discount} %`
                                :formatCurrency(appliedCoupon?.couponDetails?.discount)}
                            </span>
                          </span>
                          <span className="font-bold text-success tabular-nums">
                            −{formatCurrency(appliedCoupon.discountAmount)}
                          </span>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="h-px bg-border/50 my-1" />

                      {/* Total */}
                      <div className="flex items-end justify-between">
                        <span className="font-semibold text-foreground text-base">
                          {t("summary.total")}
                        </span>
                        <div className="text-end">
                          {appliedCoupon ? (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-muted-foreground line-through tabular-nums">
                                {formatCurrency(baseTotalAmount)}
                              </span>
                              <span className="text-xl font-black text-success tabular-nums leading-tight">
                                {formatCurrency(totalAmount)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-black text-primary tabular-nums leading-tight">
                              {formatCurrency(totalAmount)}
                            </span>
                          )}
                          {settings?.taxesIncluded && !hasCustomTaxes && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {t("misc.tax_included")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Shipping unavailable notice */}
                      {!hasCustomShippingRates && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-3 rounded-xl text-xs font-medium text-center leading-relaxed">
                          {t("shipping.not_available")}
                        </div>
                      )}
                    </div>

                    {/* Coupon section */}
                    {enableCoupons && (
                      <div className="px-6 pb-5">
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between bg-success/5 border border-success/20 rounded-2xl px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-success text-base leading-none font-bold">
                                %
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {t("coupon.applied", {
                                    code:
                                      appliedCoupon.couponDetails?.couponCode ||
                                      "",
                                  })}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {t("coupon.saved", {
                                    amount: formatCurrency(
                                      appliedCoupon.discountAmount,
                                    ),
                                  })}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAppliedCoupon(null);
                                setValue("couponCode", "");
                              }}
                              className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-destructive"
                              aria-label="Remove coupon"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="border border-border/50 rounded-2xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setIsCouponOpen(!isCouponOpen)}
                              className="w-full cursor-pointer flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors focus:outline-none"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-primary font-bold text-base leading-none">
                                  %
                                </span>
                                {t("coupon.have_coupon")}
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isCouponOpen ? "rotate-180" : "rotate-0"
                                }`}
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <div
                              className={`grid transition-all duration-300 ease-in-out ${
                                isCouponOpen
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-0"
                              }`}
                            >
                              <div className="overflow-hidden">
                                <form
                                  onSubmit={handleSubmit(onSubmit)}
                                  className="px-4 pb-4 pt-2 flex flex-col gap-3"
                                >
                                  <Input
                                    placeholder={t("coupon.enter_code")}
                                    label={t("coupon.label")}
                                    {...register("couponCode")}
                                    error={errors.couponCode?.message}
                                    disabled={validateCouponPending}
                                    className="bg-background"
                                  />
                                  <Button
                                    type="submit"
                                    disabled={validateCouponPending}
                                    className="w-full"
                                    variant="outline"
                                  >
                                    {t("coupon.apply")}
                                  </Button>
                                </form>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Checkout CTA ── */}
                    <div className="px-6 pb-6 space-y-4">
                      {appliedCoupon?.message && (
                        <ErrorMessage
                          message={appliedCoupon?.message}
                          className=" py-1 px-3  md:text-sm font-medium leading-relaxed  bg-warning/5 border border-warning/30 text-warning mb-2"
                        />
                      )}
                      <Link
                        href={
                          isCartUpdating ||
                          cartItems.length === 0 ||
                          !hasCustomShippingRates
                            ? "#"
                            : checkoutHref
                        }
                        className="block"
                      >
                        <Button
                          className="w-full h-14 rounded-2xl text-base font-bold tracking-wide gap-2.5 group shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                          disabled={
                            isCartUpdating ||
                            cartItems.length === 0 ||
                            !hasCustomShippingRates
                          }
                        >
                          {t("summary.checkout")}
                          {isAr ? (
                            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                          ) : (
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          )}
                        </Button>
                      </Link>

                      {/* Trust badges */}
                      <div className="flex items-center justify-center gap-6 pt-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ShieldIcon className="w-3.5 h-3.5 text-primary/70" />
                          <span>{t("misc.secure_pay")}</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <TruckIcon className="w-3.5 h-3.5 text-primary/70" />
                          <span>{t("misc.fast_ship")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
