"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRightIcon, PackageIcon } from "@/shared/ui/Icons";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { cn, formatDateTime, getStatusColor } from "@/lib/utils";
import type { Order } from "@/types";

// Compact order row, shared by the Overview "recent orders" list and the
// mobile card list on the Orders tab.
export function OrderRow({ order, locale }: { order: Order; locale: string }) {
  const tOrders = useTranslations("orders");
  const formatCurrency = useFormatCurrency();
  const statusLabel = tOrders(`status.${order.status.toLowerCase()}`, {
    defaultValue: order.status,
  });

  return (
    <Link
      href={`/${locale}/account/orders/${order._id}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 -mx-2 px-2 rounded-xl first:pt-0 last:pb-0 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
          <PackageIcon className="w-5 h-5 text-muted-foreground/80" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground">
            #{order._id.slice(-6).toUpperCase()}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDateTime(order.createdAt, locale)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-end">
        <p className="font-extrabold text-sm text-foreground">
          {formatCurrency(order.grandTotal ?? order.totalPrice ?? 0)}
        </p>
        <div
          className={cn(
            "px-2.5 py-1 rounded-lg font-semibold text-xs uppercase tracking-wide",
            getStatusColor(order.status),
          )}
        >
          {statusLabel}
        </div>
        <ChevronRightIcon className="w-5 h-5 text-muted-foreground/30 rtl:rotate-180 group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all hidden sm:block" />
      </div>
    </Link>
  );
}
