"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Tag, ShieldCheck, Lock } from "lucide-react";
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { CouponValidationResult } from "@/features/cart/hooks/useCart";
import ErrorMessage from "@/shared/ui/ErrorMessage";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  ArrowRightIcon,
  OrdersIcon,
  ShieldIcon,
  TrashIcon,
  TruckIcon,
} from "@/shared/ui/Icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useToast } from "@/shared/hooks/useToast";
import { useApplyCoupon, useCheckoutSummary } from "@/features/checkout/hooks/useCheckout";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useTrans } from "@/shared/hooks/useTrans";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTranslations } from "next-intl";

export interface CouponFormValues {
  couponCode: string;
}

interface OrderSummaryCardProps {
  // ── items & pricing ──────────────────────────────────────────────
  cartItems: CartItem[];
  subtotal: number;
  tax?: number;
  vatRate?: number;
  baseTotalAmount?: number;
  totalAmount?: number;
  hasCustomTaxes?: boolean;
  hasCustomShippingRates?: boolean;
  taxesIncluded?: boolean;

  // ── coupon ───────────────────────────────────────────────────────
  // Coupon state is now managed internally by this component.

  // ── checkout CTA ─────────────────────────────────────────────────
  checkoutHref?: string;
  isCartUpdating?: boolean;

  // ── checkout mode (used by checkout page — no coupon form, no CTA) ──
  preview?: unknown;
  showPreviewDetails?: boolean;
  checkoutMode?: boolean;
}

export function OrderSummaryCard({
  cartItems,
  subtotal,
  tax = 0,
  vatRate = 0,
  baseTotalAmount = 0,
  totalAmount: externalTotalAmount = 0,
  hasCustomTaxes = false,
  hasCustomShippingRates = false,
  taxesIncluded,
  checkoutHref = "#",
  isCartUpdating = false,
  preview,
  showPreviewDetails,
  checkoutMode = false,
}: OrderSummaryCardProps) {
  console.log("preview", preview);
  // console.log(
  //   "=================================================================",
  // );
  // console.log("showPreviewDetails", showPreviewDetails);
  // console.log(
  //   "=================================================================",
  // );
  // // console.log("cartItems", cartItems);
  // console.log(
  //   "=================================================================",
  // );
  // console.log("subtotal", subtotal);
  // console.log(
  //   "=================================================================",
  // );
  // console.log("externalTotalAmount", externalTotalAmount);
  // console.log(
  //   "=================================================================",
  // );
  // console.log("vatRate", vatRate);
  // console.log(
  //   "=================================================================",
  // );
  // console.log("tax", tax);
  // console.log(
  //   "=================================================================",
  // );
  // console.log("baseTotalAmount", baseTotalAmount);
  // console.log(
  //   "=================================================================",
  // );
  // console.log("checkoutMode", checkoutMode);

  /* ── hooks & state ── */
  const settings = useSettings();
  const { data: user } = useMe();
  // get checkout summary data

  const toast = useToast();
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("cart");
  //if settings enable coupons
  const enableCoupons = useMemo(() => {
    return !!settings?.features?.coupons;
  }, [settings]);
  // coupon state
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  // apply coupon local
  const [appliedCouponLocal, setAppliedCouponLocal] =
    useState<CouponValidationResult | null>(null);
  // preview
  const p =  preview   as Record<string, unknown> | undefined;
  // summary
  const summary = p?.summary as Record<string, unknown> | undefined;
  const parsedDiscountAmount =
    (summary?.discount as number | undefined) ??
    (p?.discountAmount as number | undefined) ??
    0;

  // In checkout mode, the applied coupon comes from the preview details.
  // Otherwise, it comes from the local state.
  const appliedCoupon = checkoutMode
    ? (p?.couponDetails as Record<string, unknown>)?.couponCode
      ? ({
          discountAmount: parsedDiscountAmount,
          couponDetails: {
            couponCode: (p?.couponDetails as Record<string, unknown>)
              ?.couponCode,
            discount: parsedDiscountAmount,
            couponType: "fixed",
          },
        } as unknown as CouponValidationResult)
      : null
    : appliedCouponLocal;

  const totalAmount = checkoutMode
    ? externalTotalAmount
    : appliedCouponLocal
      ? (appliedCouponLocal.totalPriceAfterDiscount ??
        Math.max(0, baseTotalAmount - appliedCouponLocal.discountAmount))
      : baseTotalAmount;

  const { mutateAsync: validateCoupon, isPending: validateCouponPending } =
    useApplyCoupon();

  const couponSchema = z.object({
    couponCode: z.string().min(1, "Coupon code is required"),
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: { couponCode: "" },
  });

  const onCouponSubmit = handleSubmit(async (data: CouponFormValues) => {
    if (!user) {
      toast.warning(t("messages.login_to_apply_coupon"));
      return;
    }
    try {
      const res = await validateCoupon(data.couponCode);
      console.log("ressssss", res);

      if (!checkoutMode) {
        const p = res as Record<string, unknown>;
        const summaryObj = p?.summary as Record<string, unknown> | undefined;
        const discAmt =
          (summaryObj?.discount as number | undefined) ??
          (p?.discountAmount as number | undefined) ??
          0;

        setAppliedCouponLocal({
          discountAmount: discAmt,
          totalPrice:
            (summaryObj?.subtotal as number | undefined) ??
            (p?.totalPrice as number | undefined) ??
            baseTotalAmount,
          totalPriceAfterDiscount:
            (summaryObj?.total as number | undefined) ??
            (p?.totalPriceAfterDiscount as number | undefined) ??
            baseTotalAmount - discAmt,
          couponDetails: p?.couponDetails as Record<string, unknown>,
        } as CouponValidationResult);
      }
      toast.success(t("messages.couponApplied"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "something went wrong";
      toast.error(errorMessage);
    }
  });

  const onRemoveCoupon = async () => {
    try {
      await validateCoupon("");
      if (!checkoutMode) {
        setAppliedCouponLocal(null);
      }
      setValue("couponCode", "");
      toast.success(t("messages.couponRemoved"));
    } catch (error) {
      console.error(error);
    }
  };

  const onToggleCoupon = () => setIsCouponOpen(!isCouponOpen);

  return (
    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl shadow-primary/5 sticky top-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-border/40 bg-accent/50 flex items-center justify-between">
        <h2 className="text-lg font-bold title-gradient">
          {t("summary.title")}
        </h2>
        <OrdersIcon className="size-7 text-primary" />
      </div>

      {/* Items mini-list */}
      <div className="px-5 py-4 border-b border-border/40 max-h-52 overflow-y-auto space-y-3">
        {cartItems.map((item: CartItem, idx: number) => {
          const product = item.product;
          if (!product) return null;
          const { price, image } = resolveItemData(item);
          const title = String(getTrans(product.title));
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/40 shrink-0 bg-accent/30">
                {image ? (
                  <Image
                    src={image}
                    alt={title}
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
                  {title}
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

      {/* Pricing breakdown */}
      <div className="px-6 py-5 space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("summary.subtotal")}</span>
          <span className="font-semibold text-foreground tabular-nums">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* ── Checkout-page preview mode ── */}
        {checkoutMode && p && showPreviewDetails ? (
          <>
            {(summary?.shippingCost as number) > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("summary.shipping")}
                </span>
                <span className="font-semibold">
                  {formatCurrency(summary?.shippingCost as number)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("summary.shipping")}
                </span>
                <span className="font-bold text-success text-xs bg-success/10 px-2 py-0.5 rounded-lg">
                  {t("summary.free")}
                </span>
              </div>
            )}
            {(summary?.taxAmount as number) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("summary.tax")} ({String(summary?.taxPercentage ?? "")}%)
                </span>
                <span className="font-semibold">
                  {formatCurrency(summary?.taxAmount as number)}
                </span>
              </div>
            )}
            {(summary?.paymentFees as number) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("summary.payment_fees")}
                </span>
                <span className="font-semibold">
                  {formatCurrency(summary?.paymentFees as number)}
                </span>
              </div>
            )}
            {(summary?.discount as number) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-success font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {t("coupon.discount")}
                </span>
                <span className="font-bold text-success">
                  -{formatCurrency(summary?.discount as number)}
                </span>
              </div>
            )}
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-foreground">
                {t("summary.total")}
              </span>
              <span className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(summary?.total as number)}
              </span>
            </div>
          </>
        ) : checkoutMode && p && !showPreviewDetails ? (
          /* checkout-page fallback (no preview yet) */
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("summary.shipping")}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {t("summary.calculated_at_checkout")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("summary.tax")}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {t("summary.calculated_at_checkout")}
              </span>
            </div>
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-foreground">
                {t("summary.total")}
              </span>
              <span className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(
                  (p?.totalPriceAfterDiscount as number) ?? subtotal,
                )}
              </span>
            </div>
          </>
        ) : (
          /* ── Cart-page mode ── */
          <>
            {/* Tax row */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("summary.tax")}</span>
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

            {/* Shipping row */}
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
                    {appliedCoupon?.couponDetails?.couponType === "percentage"
                      ? `${appliedCoupon?.couponDetails?.discount} %`
                      : formatCurrency(
                          appliedCoupon?.couponDetails?.discount ?? 0,
                        )}
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
                {taxesIncluded && !hasCustomTaxes && (
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
          </>
        )}
      </div>

      {/* ── Coupon section ── */}
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
                      code: appliedCoupon.couponDetails?.couponCode || "",
                    })}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t("coupon.saved", {
                      amount: formatCurrency(appliedCoupon.discountAmount),
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemoveCoupon}
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
                onClick={onToggleCoupon}
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
                    onSubmit={onCouponSubmit}
                    className="px-4 pb-4 pt-2 flex flex-col gap-3"
                  >
                    <Input
                      placeholder={t("coupon.enter_code")}
                      label={t("coupon.label")}
                      {...register("couponCode")}
                      error={errors?.couponCode?.message}
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

      {/* ── Checkout CTA (cart mode only) ── */}
      {!checkoutMode && (
        <div className="px-6 pb-6 space-y-4">
          {appliedCoupon?.message && (
            <ErrorMessage
              message={appliedCoupon.message}
              className="py-1 px-3 md:text-sm font-medium leading-relaxed bg-warning/5 border border-warning/30 text-warning mb-2"
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
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
      )}

      {/* ── Trust badges (checkout mode) ── */}
      {checkoutMode && (
        <div className="px-5 pb-5">
          {!!p?.message && (
            <ErrorMessage
              message={String(p.message)}
              className="py-1 px-3 md:text-sm font-medium leading-relaxed bg-warning/5 border border-warning/30 text-warning mb-2"
            />
          )}
          <div className="flex items-center gap-3 bg-muted/40 rounded-2xl p-3 border border-border/30">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">
                {t("misc.secure_encrypted")}
              </p>
              <p className="text-[10px] text-muted-foreground">
                SSL / 256-bit encryption
              </p>
            </div>
            <Lock className="w-4 h-4 text-muted-foreground ms-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
