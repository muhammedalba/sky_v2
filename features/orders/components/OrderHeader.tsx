"use client";

import { useState } from "react";
import { Badge } from "@/shared/ui/Badge";
import { Order } from "@/features/orders/types";
import {
  cn,
  formatDate,
  getPaymentStatusColor,
  getStatusColor,
} from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useUpdateOrderStatus } from "@/features/orders/hooks/useOrders";

import Link from "next/link";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { CheckIcon, SpinnerIcon, UserIcon } from "@/shared/ui/Icons";
import { Tooltip } from "@/shared/ui/Tooltip";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/shared/constants/order-constants";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";

interface OrderHeaderProps {
  order: Order;
}

export default function OrderHeader({ order }: OrderHeaderProps) {
  const t = useTranslations("orders");
  const formatCurrency = useFormatCurrency();
  const updateStatusMutation = useUpdateOrderStatus();
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePaymentStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: order._id,
        paymentStatus: newStatus,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: order._id,
        status: newStatus,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = formatDate(order.createdAt);

  return (
    <div className="space-y-6">
      {/* Top 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Customer Card */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card  shadow-xs">
          <Tooltip content={t("viewCustomer")}>
            <Link
              href={
                order.user?._id
                  ? `/dashboard/users/${order.user._id}/edit`
                  : "#"
              }
            >
              <div className=" flex gap-3">
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
                <div className="min-w-0 flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {t("customerInfo")}
                  </h4>
                  <p className="text-xs font-medium text-foreground mt-1 truncate">
                    {order.user?.name || "Guest"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.user?.email || "-"}
                  </p>
                  {order.user?.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.user.phone}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground gap-3">
                    <span>{t("customerSince")} :</span>
                    <span className="text-primary/80 font-semibold ">
                      {order.user?.createdAt
                        ? formatDate(order.user.createdAt)
                        : "Jan 18, 2026"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Tooltip>
        </div>

        {/* Order Status Selector Card */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card flex flex-col justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2 justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("orderStatus")} :{" "}
              </p>
              <Badge
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none",
                  getStatusColor(order.status?.toLowerCase() || ""),
                )}
              >
                {order.status ? t(`status.${order.status.toLowerCase()}`) : "—"}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {isUpdating ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                  <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                  {t("updating")}
                </div>
              ) : (
                <select
                  value={order.status}
                  disabled={isUpdating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-1 my-2 outline-0 text-xs text-start font-medium text-foreground hover:bg-muted/60 disabled:opacity-50 transition-colors border rounded-lg",
                    "focus:border-primary",
                  )}
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {t(status.label)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {/* paymentStatusLabel */}
          <div>
            <div className="flex items-center gap-2 justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("paymentStatusLabel")} :{" "}
              </p>
              <Badge
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none",
                  getPaymentStatusColor(order.paymentStatus || ""),
                )}
              >
                {order.paymentStatus ? t(`paymentStatus.${order.paymentStatus.toUpperCase()}`) : "—"}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {isUpdating ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                  <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                  {t("updating")}
                </div>
              ) : (
                <select
                  value={order.paymentStatus}
                  disabled={isUpdating}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-1 my-2 outline-0 text-xs text-start font-medium text-foreground hover:bg-muted/60 disabled:opacity-50 transition-colors border rounded-lg",
                    "focus:border-primary",
                  )}
                >
                  {PAYMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value.toUpperCase()}>
                      {t(status.label)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

        </div>

        {/* Grand Total Card */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card flex flex-col justify-between gap-3 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t("grandTotal")}
            </p>
            <p className="text-2xl font-black text-foreground mt-1 tabular-nums">
              {formatCurrency(order.grandTotal || order.totalPrice || 0)}
              <span className="text-xs font-bold text-muted-foreground">
                {order.currency || "SAR"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckIcon className="w-3.5 h-3.5 shrink-0 border border-success rounded-full " />
            <span>{t("paidOn", { date: formattedDate })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
