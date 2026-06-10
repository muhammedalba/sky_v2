"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tag, ShieldCheck, Lock } from "lucide-react";
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
import { useApplyCoupon } from "@/features/checkout/hooks/useCheckout";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useTrans } from "@/shared/hooks/useTrans";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";

export interface CouponFormValues {
  couponCode: string;
}

interface OrderSummaryCardProps {
  // ── items & pricing ──────────────────────────────────────────────
  cartItems: CartItem[];
  subtotal: number;
  baseTotalAmount?: number;
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
  baseTotalAmount = 0,
  checkoutHref = "#",
  isCartUpdating = false,
  preview,
  checkoutMode = false,
}: OrderSummaryCardProps) {
  console.log("preview", preview);

  /* ── get user & settings ── */
  const settings = useSettings();
  const { data: user } = useMe();

  /* ── hooks & state ── */
  const toast = useToast();
  const formatCurrency = useFormatCurrency();
  const getTrans = useTrans();
  const t = useTranslations("cart");
  // coupon state
  const { mutateAsync: validateCoupon, isPending: validateCouponPending } =
    useApplyCoupon();

  const [isCouponOpen, setIsCouponOpen] = useState(false);
  // apply coupon local
  const [appliedCouponLocal, setAppliedCouponLocal] =
    useState<CouponValidationResult | null>(null);

  //if settings enable coupons
  const enableCoupons = useMemo(() => {
    return !!settings?.features?.coupons;
  }, [settings]);
  // preview
  const p = preview as Record<string, unknown> | undefined;
  // summary
  const summary = p?.summary as Record<string, unknown> | undefined;

  const parsedDiscountAmount =
    (summary?.discountAmount as number | undefined) ??
    (summary?.discount as number | undefined) ??
    (p?.discountAmount as number | undefined) ??
    0;

  // Extract coupon from server preview if present
  const serverCoupon = (p?.couponDetails as Record<string, unknown>)?.couponCode
    ? ({
        discountAmount: parsedDiscountAmount,
        couponDetails: p?.couponDetails,
      } as unknown as CouponValidationResult)
    : null;

  // Use server coupon if available, otherwise fall back to local state coupon
  const appliedCoupon = serverCoupon || appliedCouponLocal;

  const totalAmount = useMemo(() => {
    // 1. In checkoutMode (Checkout page), the server is the absolute source of truth (includes exact tax/shipping)
    if (checkoutMode && summary?.totalPrice !== undefined) {
      return summary.totalPrice as number;
    }
    // 2. In Cart mode, use baseTotalAmount (which contains local estimated tax) and subtract discount
    const discount = (summary?.discountAmount as number) ?? appliedCouponLocal?.discountAmount ?? 0;
    return Math.max(0, baseTotalAmount - discount);
  }, [summary, checkoutMode, baseTotalAmount, appliedCouponLocal]);

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
      if (!checkoutMode) {
        const p = res as Record<string, unknown>;
        const summaryObj = p?.summary as Record<string, unknown> | undefined;
        const discAmt =
          (summaryObj?.discountAmount as number | undefined) ??
          (p?.discountAmount as number | undefined) ??
          0;

        setAppliedCouponLocal({
          discountAmount: discAmt,
          totalPrice:
            (summaryObj?.subtotal as number | undefined) ??
            (p?.totalPrice as number | undefined) ??
            baseTotalAmount,
          totalPriceAfterDiscount:
            (summaryObj?.totalPrice as number | undefined) ??
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
      <div
        className={cn(
          "px-5 py-4 max-h-52 overflow-y-auto space-y-3 ",
          checkoutMode && "border-b border-border/40 ",
        )}
      >
        {cartItems.map((item: CartItem, idx: number) => {
          const product = item.product;
          if (!product) return null;
          const { price, image } = resolveItemData(item);
          const title = String(getTrans(product.title));
          return (
            <div key={idx} className="flex items-center gap-3">
              {image && checkoutMode && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/40 shrink-0 bg-accent/30">
                  <ImageWithFallback
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
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
        {/* ── Checkout-page preview mode ── */}
        {checkoutMode && (
          <>
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("summary.subtotal")}
              </span>
              <span className="font-semibold text-foreground tabular-nums">
                {formatCurrency(summary?.subtotal as number ?? subtotal)}
              </span>
            </div>

            {/* shippingCost */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("summary.shipping")}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {(summary?.shippingCost as number) > 0
                  ? formatCurrency(summary?.shippingCost as number)
                  : (summary?.shippingCost as number) === 0
                    ? t("summary.free")
                    : t("summary.calculated_at_checkout")}
              </span>
            </div>
            {/* tax */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("summary.tax")} ({String(summary?.taxPercentage ?? "")}%)
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {(summary?.taxAmount as number) > 0
                  ? formatCurrency(summary?.taxAmount as number)
                  : t("summary.calculated_at_checkout")}
              </span>
            </div>
          </>
        )}

        {/* paymentFees */}
        {(summary?.paymentFees as number) > 0 && checkoutMode && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t("summary.payment_fees")}
            </span>
            <span className="font-semibold">
              {formatCurrency(summary?.paymentFees as number)}
            </span>
          </div>
        )}
        {/* discount */}
        {((summary?.discountAmount as number) > 0 || !!appliedCoupon) && (
            <div className="flex justify-between text-sm">
              <span className="text-success font-semibold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
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
                -
                {formatCurrency(
                  (summary?.discountAmount as number) ||
                    appliedCoupon?.discountAmount,
                )}
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
                  {formatCurrency(subtotal)}
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
            {/* {taxesIncluded && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t("misc.tax_included")}
              </p>
            )} */}
          </div>
        </div>
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
            href={isCartUpdating || cartItems.length === 0 ? "#" : checkoutHref}
            className="block"
          >
            <Button
              className="w-full h-14 rounded-2xl text-base font-bold tracking-wide gap-2.5 group shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
              disabled={isCartUpdating || cartItems.length === 0}
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
