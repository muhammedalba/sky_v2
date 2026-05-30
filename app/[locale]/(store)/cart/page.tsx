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

/* ------------------------------------------------------------------ */
/* Page                                                              */
/* ------------------------------------------------------------------ */
export default function CartPage() {
  // ======> Hooks <======
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
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
      cartItems.reduce((acc: number, item: CartItem) => acc + (item.quantity || 1), 0)
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
      return appliedCoupon.totalPriceAfterDiscount ?? Math.max(0, baseTotalAmount - appliedCoupon.discountAmount);
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
    code: z.string().min(1, "Coupon code is required"),
    orderAmount: z.union([z.number(), z.null()]).nullable(),
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
      code: "",
      orderAmount: baseTotalAmount,
    },
  });
  // copon
  const { mutateAsync: validateCoupon, isPending: validateCouponPending } =
    useCouponValidation();
  const onSubmit = async (data: couponFormValues) => {
    if (!user) {
      toast.warning(t("messages.login_to_apply_coupon"));
      return;
    }

    try {
      const res = await validateCoupon({
        code: data.code,
        orderAmount: baseTotalAmount,
      });

      console.log(res);
      setAppliedCoupon(res);
      toast.success(t("messages.couponApplied"));
    } catch (error) {
      console.error(error);
    }
  };

  const isCartUpdating =
    isRemoving || updateServerQuantityPending || clearServerCartPending;

  /* Loading */
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
    <div className="min-h-screen pt-40 pb-24 bg-background selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <Breadcrumb
          items={[{ label: t("misc.home"), href: "/" }, { label: t("title") }]}
        />

        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-accent/30 rounded-3xl border border-border/40 p-8 max-w-lg mx-auto">
            <div className="bg-primary/10 text-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black mb-2 text-foreground">
              {t("empty.title")}
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">
              {t("empty.subtitle")}
            </p>
            <Link
              href="/products"
              className="inline-flex bg-primary text-white rounded-2xl px-8 py-3.5 font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
            >
              {t("empty.cta")}
            </Link>
          </div>
        ) : (
          /* ── Cart Grid ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* ── Items Column ── */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-accent/25 border border-border/40 p-6 rounded-3xl">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-2xl">
                    <ShoppingBagIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black title-gradient">
                      {t("title")}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {` ${totalQuantity} ${totalQuantity === 1 ? t("misc.item_count_single") : t("misc.item_count_plural")}`}
                    </p>
                  </div>
                </div>
                {cartItems.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleClearCart}
                    disabled={isCartUpdating}
                  >
                    <TrashIcon
                      className={`w-4 h-4 ${clearServerCartPending ? "animate-spin" : ""}`}
                    />
                    {t("misc.clear_cart")}
                  </Button>
                )}
              </div>

              <div className="bg-background border border-border/45 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <h2 className="text-base font-bold text-muted-foreground uppercase tracking-widest">
                    {t("misc.products")}
                  </h2>
                </div>

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
                      <CartItemCard
                        key={uniqueKey}
                        item={item}
                        idx={idx}
                        isAr={isAr}
                        isRemoving={isCartUpdating}
                        formatCurrency={formatCurrency}
                        onRemove={handleRemoveItem}
                        onUpdateQty={handleUpdateQuantity}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Continue shopping */}
              <Link
                href="/products"
                className="inline-flex bg-primary/5 rounded-full px-4 py-2 items-center gap-2 text-sm font-semibold text-primary hover:text-white hover:bg-primary/80 transition-colors mt-2"
              >
                {isAr ? (
                  <ArrowRightIcon className="w-4 h-4" />
                ) : (
                  <ArrowLeftIcon className="w-4 h-4" />
                )}
                {t("misc.continue_shopping")}
              </Link>
            </div>

            {/* ── Order Summary Column ── */}
            <div className="space-y-6">
              <div className="bg-background border border-border/45 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border/45">
                  <h2 className="text-xl font-black text-foreground">
                    {t("summary.title")}
                  </h2>
                </div>

                {/* Line items breakdown */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3 pb-3 border-b border-border/40 max-h-48 overflow-y-auto pr-1">
                    {cartItems.map((item: CartItem, idx: number) => {
                      const product = item.product;
                      if (!product) return null;
                      const title = getTrans(product.title);
                      const { price } = resolveItemData(item);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="text-muted-foreground truncate flex-1">
                            {title}
                            <span className="text-xs ms-1 opacity-60">
                              ×{item.quantity}
                            </span>
                          </span>
                          <span className="font-semibold text-foreground shrink-0 tabular-nums">
                            {formatCurrency((price || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      {t("summary.subtotal")}
                    </span>
                    <span className="font-bold text-foreground tabular-nums">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Tax row */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      {t("summary.tax")}
                    </span>
                    {hasCustomTaxes ? (
                      <span className="font-semibold text-muted-foreground text-xs bg-accent px-2.5 py-1 rounded-lg border border-border/40">
                        {t("summary.calculated_at_checkout")}
                      </span>
                    ) : (
                      <span className="font-semibold text-muted-foreground text-md px-2.5 py-1  ">
                        {vatRate + " %"}
                      </span>
                    )}
                  </div>

                  {/* Shipping row */}
                  {hasCustomShippingRates ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">
                        {t("summary.shipping")}
                      </span>
                      <span className="font-semibold text-muted-foreground text-xs bg-accent px-2.5 py-1 rounded-lg border border-border/40">
                        {t("summary.calculated_at_checkout")}
                      </span>
                    </div>
                  ) : (
                    <>
                      {tax > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">
                            {t("summary.tax")} ({vatRate}%)
                          </span>
                          <span className="font-bold text-foreground tabular-nums">
                            {formatCurrency(tax)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">
                          {t("summary.shipping")}
                        </span>
                        <span className="font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg text-xs">
                          {t("summary.free")}
                        </span>
                      </div>
                    </>
                  )}

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-sm text-success bg-success/5 border border-success/10 p-3 rounded-2xl">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span className="text-base leading-none">%</span>
                        {t("coupon.discount")}
                        <span className="text-xs font-bold bg-success/10 px-2 py-0.5 rounded-md">
                          {appliedCoupon.couponDetails?.couponCode}
                        </span>
                      </span>
                      <span className="font-black tabular-nums">
                        -{formatCurrency(appliedCoupon.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="h-px bg-border/60 my-1" />
                  {enableCoupons && (
                    <div className="  border border-border/40 rounded-2xl overflow-hidden bg-accent/20 transition-all duration-300 mt-2">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10">
                          <div className="flex items-center gap-2.5">
                            <span className="text-primary text-xl font-bold leading-none">%</span>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {t("coupon.applied", { code: appliedCoupon.couponDetails?.couponCode || "" })}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {t("coupon.saved", { amount: formatCurrency(appliedCoupon.discountAmount) })}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setValue("code", "");
                            }}
                            className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors group cursor-pointer"
                            aria-label="Remove coupon"
                          >
                            <TrashIcon className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsCouponOpen(!isCouponOpen)}
                            className="w-full cursor-pointer flex items-center justify-between p-4 text-sm font-semibold text-foreground hover:bg-accent/40 transition-colors focus:outline-none"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-primary text-lg leading-none">
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
                              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
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
                                className="p-4 pt-5 flex flex-col gap-3"
                              >
                                <Input
                                  placeholder={t("coupon.enter_code")}
                                  label={t("coupon.label")}
                                  {...register("code")}
                                  error={errors.code?.message}
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
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-base">
                      {t("summary.total")}
                    </span>
                    <div className="text-end">
                      {appliedCoupon ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-muted-foreground line-through tabular-nums">
                            {formatCurrency(baseTotalAmount)}
                          </span>
                          <span className="text-2xl font-black text-success tabular-nums">
                            {formatCurrency(totalAmount)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-primary tabular-nums">
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

                  {!hasCustomShippingRates && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-3 rounded-2xl text-xs font-bold text-center mt-2 leading-relaxed">
                      {t("shipping.not_available")}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 space-y-3">
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
                      className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 gap-3 group"
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
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 justify-center bg-accent/40 py-2.5 px-3 rounded-xl border border-border/40">
                      <ShieldIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("misc.secure_pay")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center bg-accent/40 py-2.5 px-3 rounded-xl border border-border/40">
                      <TruckIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("misc.fast_ship")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
