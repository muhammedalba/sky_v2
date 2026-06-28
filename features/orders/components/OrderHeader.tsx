"use client";

import { useState } from "react";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Order } from "@/features/orders/types";
import { formatDate } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useUpdateOrderStatus } from "@/features/orders/hooks/useOrders";
import {
  RefreshCwIcon,
  ChevronRightIcon,
  PencilIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";

interface OrderHeaderProps {
  order: Order;
  onRefresh?: () => void;
}

export default function OrderHeader({ order, onRefresh }: OrderHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("orders");
  const updateStatusMutation = useUpdateOrderStatus();
  const [isUpdating, setIsUpdating] = useState(false);

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
      {/* Main Title & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            #{order._id.slice(0, 8)}
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            {t("placedOn", { date: formattedDate })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="rounded-xl font-bold text-xs h-10 px-4 bg-card border-border hover:bg-secondary/40 flex items-center gap-1.5 active:scale-[0.98]"
            >
              <RefreshCwIcon className="w-3.5 h-3.5 text-muted-foreground" />
              {t("refresh")}
            </Button>
          )}

                     <div className="mt-1 flex items-center gap-2">
              {isUpdating ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  {t("updating")}
                </div>
              ) : (
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-bold text-foreground bg-accent/70 border-none outline-hidden focus:ring-0 rounded-lg px-2.5 py-1.5 cursor-pointer capitalize"
                >
                  <option value="pending_payment">
                    {t("status.pending_payment")}
                  </option>
                  <option value="pending">{t("status.pending")}</option>
                  <option value="processing">{t("status.processing")}</option>
                  <option value="shipped">{t("status.shipped")}</option>
                  <option value="delivered">{t("status.delivered")}</option>
                  <option value="completed">{t("status.completed")}</option>
                  <option value="cancelled">{t("status.cancelled")}</option>
                </select>
              )}
            </div>
        </div>
      </div>

      {/* Top 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Card */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card flex items-start justify-between gap-4 shadow-xs">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
              {order.user?.name?.charAt(0).toUpperCase() || "G"}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">
                {order.user?.name ||
                  (locale === "ar" ? "عميل زائر" : "Guest User")}
              </h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {order.user?.email ||
                  (locale === "ar"
                    ? "لا يوجد بريد إلكتروني"
                    : "No email provided")}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {order.shippingAddress?.phone || order.user?.phone || ""}
              </p>
            </div>
          </div>
          {order.user?._id && (
            <Link href={`/${locale}/dashboard/users/${order.user._id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-xs h-8 px-2.5 bg-card border-border hover:bg-secondary/40 shrink-0"
              >
                {t("viewCustomer")}
              </Button>
            </Link>
          )}
        </div>

        {/* Order Status Selector Card */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card flex flex-col justify-between gap-3 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t("orderStatus")}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {isUpdating ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  {t("updating")}
                </div>
              ) : (
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none outline-hidden focus:ring-0 rounded-lg px-2.5 py-1.5 cursor-pointer capitalize"
                >
                  <option value="pending_payment">
                    {t("status.pending_payment")}
                  </option>
                  <option value="pending">{t("status.pending")}</option>
                  <option value="processing">{t("status.processing")}</option>
                  <option value="shipped">{t("status.shipped")}</option>
                  <option value="delivered">{t("status.delivered")}</option>
                  <option value="completed">{t("status.completed")}</option>
                  <option value="cancelled">{t("status.cancelled")}</option>
                </select>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t("paymentStatusLabel")}
            </p>
            <div className="mt-1">
              <Badge className="rounded-lg px-2.5 py-1 font-bold text-[10px] uppercase border-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {order.paymentStatus
                  ? t(`paymentStatus.${order.paymentStatus.toUpperCase()}`, {
                      defaultValue: order.paymentStatus,
                    })
                  : "—"}
              </Badge>
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
              {(order.grandTotal || order.totalPrice || 0).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 },
              )}{" "}
              <span className="text-xs font-bold text-muted-foreground">
                {order.currency || "SAR"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{t("paidOn", { date: formattedDate })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
