"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Sheet, SheetContent } from "@/shared/ui/sheet/Sheet";
import { Card, CardContent } from "@/shared/ui/Card";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { Order } from "@/types";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { cn, formatDate, formatRelativeTime, getPaymentStatusColor, getStatusColor } from "@/lib/utils";
import {
  MapPinIcon,
  CreditCardIcon,
  UserIcon,
  TruckIcon,
  TagIcon,
} from "@/shared/ui/Icons";
import { FileText as StickyNoteIcon } from "lucide-react";
import { useTrans } from "@/shared/hooks/useTrans";

interface OrderDetailDrawerProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function OrderDetailDrawer({
  order,
  open,
  onOpenChange,
}: OrderDetailDrawerProps) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("orders");
  const getTrans = useTrans();
  const locale = useLocale();

  const formattedAddress = useMemo(() => {
    if (!order?.shippingAddress) return "";
    const addr = order.shippingAddress;
    const cityName =
      typeof addr.city === "object" && addr.city ? addr.city.name : addr.city;
    const countryName =
      typeof addr.country === "object" && addr.country
        ? addr.country.name
        : addr.country;
    return [addr.building, addr.street, cityName, countryName, addr.postalCode]
      .filter(Boolean)
      .join(", ");
  }, [order?.shippingAddress]);

  // Constructing timeline based on order lifecycle fields
  const timelineSteps = useMemo(() => {
    if (!order) return [];

    const steps = [
      {
        key: "pending_payment",
        time: order.createdAt,
        isCompleted: !!order.createdAt,
      },
      {
        key: "pending",
        time: order.checkedOutAt || order.createdAt,
        isCompleted: [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "completed",
        ].includes(order.status),
      },
      {
        key: "processing",
        time:
          order.processingAt ||
          (order.paymentStatus === "PAID" ? order.updatedAt : undefined),
        isCompleted: [
          "processing",
          "shipped",
          "delivered",
          "completed",
        ].includes(order.status),
      },
      {
        key: "shipped",
        time: ["shipped", "delivered", "completed"].includes(order.status)
          ? order.updatedAt
          : undefined,
        isCompleted: ["shipped", "delivered", "completed"].includes(
          order.status,
        ),
      },
      {
        key: "delivered",
        time: ["delivered", "completed"].includes(order.status)
          ? order.updatedAt
          : undefined,
        isCompleted: ["delivered", "completed"].includes(order.status),
      },
      {
        key: "completed",
        time: order.completedAt,
        isCompleted: order.status === "completed",
      },
    ];

    if (order.status === "cancelled" || order.cancelledAt) {
      steps.push({
        key: "cancelled",
        time: order.cancelledAt || order.updatedAt,
        isCompleted: true,
      });
    }

    if (order.status === "expired") {
      steps.push({
        key: "expired",
        time: order.updatedAt,
        isCompleted: true,
      });
    }

    return steps;
  }, [order]);

  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full h-full flex flex-col p-0 border-l border-border/50 bg-background/95 backdrop-blur-md">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono font-black text-lg text-foreground bg-muted px-2.5 py-1 rounded-lg">
                #{order._id?.toUpperCase().slice(0, 8)}
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none",
                  getStatusColor(order.status)
                )}
              >
                {order.status ? t(`status.${order.status}`) : "—"}
              </span>
              <Link
                href={`/dashboard/orders/${order._id}`}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 shrink-0 bg-primary/10 px-2.5 py-1.5 rounded-xl border border-primary/20 hover:bg-primary/20"
                onClick={() => onOpenChange(false)}
              >
                {t("manageOrder")} {locale === "ar" ? "←" : "→"}
              </Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("placedOn", { date: formatDate(order.createdAt) })} ({formatRelativeTime(order.createdAt, locale === "ar" ? "ar" : "en-US")})
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info Card */}
            <Card className="border-border/30 bg-secondary/10">
              <CardContent className="p-4 flex gap-3">
                <div className="h-10 w-10 rounded-full shrink-0 overflow-hidden relative bg-muted/40 flex items-center justify-center">
                  {order.user?.avatar ? (
                    <ImageWithFallback
                      src={order.user.avatar}
                      alt={order.user.name || "Guest"}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {t("customerInfo")}
                  </h4>
                  <p className="text-xs font-medium text-foreground mt-1 truncate">
                    {order.user?.name || "Guest"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.user?.email || ""}
                  </p>
                  {order.user?.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.user.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address Card */}
            <Card className="border-border/30 bg-secondary/10">
              <CardContent className="p-4 flex gap-3">
                <div className="h-10 w-10 rounded-full shrink-0 bg-muted/40 flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">
                    {t("shippingAddress")}
                  </h4>
                  {formattedAddress ? (
                    <p className="text-xs font-medium text-muted-foreground mt-1 leading-relaxed">
                      {formattedAddress}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {t("noAddress")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment & Shipping Method Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method & Status */}
            <Card className="border-border/30 bg-secondary/10">
              <CardContent className="p-4 flex gap-3">
                <div className="h-10 w-10 rounded-full shrink-0 bg-muted/40 flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    {t("paymentMethod")}
                  </h4>
                  <p className="text-xs font-medium text-foreground mt-1 capitalize">
                    {order.paymentMethodCode || order.paymentMethod || "—"}
                  </p>
                  <div className="mt-1">
                    <span
                    
                      className={cn(
                        "rounded-full px-2 py-0.5 font-semibold text-[9px] uppercase tracking-wider border-none",
                        getPaymentStatusColor(order.paymentStatus || "") 
                      )}
                    >
                      {order.paymentStatus ? t(`paymentStatus.${order.paymentStatus.toUpperCase()}`, { defaultValue: order.paymentStatus }) : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="border-border/30 bg-secondary/10">
              <CardContent className="p-4 flex gap-3">
                <div className="h-10 w-10 rounded-full shrink-0 bg-muted/40 flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    {t("shippingProvider")}
                  </h4>
                  <p className="text-xs font-medium text-foreground mt-1">
                    {typeof order.shippingProviderId === "object" &&
                    order.shippingProviderId
                      ? order.shippingProviderId.name
                      : order.shippingProviderId ||
                        order.shippingMethod ||
                        "Standard Shipping"}
                  </p>
                  {(order.shippingRateId?.estimatedDays ||
                    order.deliveryDate) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.shippingRateId?.estimatedDays
                        ? t("delivery", { days: order.shippingRateId.estimatedDays })
                        : t("estimatedDelivery", { date: order.deliveryDate || "" })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extra Info (Notes, Coupon Code, Tracking Number) */}
          {(order.notes || order.couponCode) && (
            <Card className="border-border/30 bg-secondary/5">
              <CardContent className="p-4 space-y-3">
                {order.couponCode && (
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {t("coupon")}:
                    </span>
                    <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                      {order.couponCode}
                    </span>
                  </div>
                )}
                {order.notes && (
                  <div className="flex items-start gap-2 pt-1 border-t border-border/10">
                    <StickyNoteIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground font-semibold">
                        {t("notes")}:
                      </span>
                      <p className="text-xs text-foreground/80 mt-0.5 whitespace-pre-wrap leading-relaxed">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Products List Compact Table */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">{t("orderItems")}</h4>
            <div className="rounded-xl border border-border/40 overflow-x-auto bg-card">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="p-3">{t("product")}</th>
                    <th className="p-3">{t("sku")}</th>
                    <th className="p-3 text-center">{t("qty")}</th>
                    <th className="p-3 text-end">{t("unitPrice")}</th>
                    <th className="p-3 text-end">{t("fields.total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="p-3 flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg relative overflow-hidden shrink-0 bg-muted/40">
                          {(item.productId?.imageCover ||
                            item.productId?.images?.[0]) && (
                            <ImageWithFallback
                              src={
                                item.productId.imageCover ||
                                item.productId.images?.[0] ||
                                ""
                              }
                              alt={getTrans(item.productId.title)}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate max-w-[150px]">
                            {getTrans(item.productId?.title)}
                          </span>
                          {typeof item.variantId === "object" &&
                            item.variantId?.attributes && (
                              <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                                {Object.entries(item.variantId.attributes).map(
                                  ([key, val]) => {
                                    const valStr =
                                      typeof val === "object" && val
                                        ? ((val as Record<string, unknown>)
                                            .value ?? JSON.stringify(val))
                                        : val;
                                    return (
                                      <span
                                        key={key}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-secondary/80 text-secondary-foreground border border-border/30 capitalize whitespace-nowrap"
                                      >
                                        {key}: {String(valStr)}
                                      </span>
                                    );
                                  },
                                )}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground font-mono">
                        {item.sku || item.variantId?.sku || "—"}
                      </td>
                      <td className="p-3 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-end text-muted-foreground tabular-nums">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="p-3 text-end font-bold text-foreground tabular-nums">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">{t("orderSummary")}</h4>
            <Card className="border-border/30 bg-muted/5">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("subtotal")}</span>
                  <span className="tabular-nums font-semibold">
                    {formatCurrency(order.totalPrice || 0)}
                  </span>
                </div>
                {order.shippingAmount !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("shippingAmount")}</span>
                    <span className="tabular-nums font-semibold">
                      {formatCurrency(order.shippingAmount)}
                    </span>
                  </div>
                )}
                {order.discountAmount !== undefined &&
                  order.discountAmount > 0 && (
                    <div className="flex justify-between text-red-500 dark:text-red-400">
                      <span>{t("discount")}</span>
                      <span className="tabular-nums font-bold">
                        -{formatCurrency(order.discountAmount)}
                      </span>
                    </div>
                  )}
                {order.taxAmount !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("taxAmount")}</span>
                    <span className="tabular-nums font-semibold">
                      {formatCurrency(order.taxAmount)}
                    </span>
                  </div>
                )}
                {order.paymentFees !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("paymentFees")}</span>
                    <span className="tabular-nums font-semibold">
                      {formatCurrency(order.paymentFees)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border/40 my-2 pt-2 flex justify-between text-sm font-black text-foreground">
                  <span>{t("grandTotal")}</span>
                  <span className="tabular-nums text-primary text-base">
                    {formatCurrency(order.grandTotal || order.totalPrice || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline lifecycle */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-foreground">{t("orderJourney")}</h4>
            <div className="relative ps-6 border-s border-border/40 ms-3 space-y-6 py-2">
              {timelineSteps.map((step, idx) => {
                if (step.key === "cancelled" && !order.cancelledAt) return null;
                const isCancelledStep =
                  step.key === "cancelled" || step.key === "expired";
                return (
                  <div key={idx} className="relative group">
                    {/* Circle node */}
                    <div
                      className={cn(
                        "absolute inset-s-[-30px] top-1 w-4.5 h-4.5 rounded-full border-4 border-background flex items-center justify-center transition-all duration-300 z-10",
                        step.isCompleted
                          ? isCancelledStep
                            ? "bg-red-500"
                            : "bg-primary"
                          : "bg-muted border-muted-foreground/20",
                      )}
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-xs font-bold transition-colors",
                            step.isCompleted
                              ? isCancelledStep
                                ? "text-red-500"
                                : "text-foreground"
                              : "text-muted-foreground/60",
                          )}
                        >
                          {t(`status.${step.key}`)}
                        </p>
                        {step.time && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(step.time)}
                          </span>
                        )}
                      </div>
                      {step.isCompleted && step.time && (
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                          {locale === "ar" ? "اكتمل" : "Completed"} {formatRelativeTime(step.time, locale === "ar" ? "ar" : "en-US")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
