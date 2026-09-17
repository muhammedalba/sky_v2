"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRightIcon } from "@/shared/ui/Icons";
import { cn, formatDateTime, formatOrderNumber, getStatusColor } from "@/lib/utils";
import type { Order } from "@/types";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { useTrans } from "@/shared/hooks/useTrans";
import Price from "@/shared/ui/Price";

// Compact order row, shared by the Overview "recent orders" list and the
// mobile card list on the Orders tab.
export function OrderRow({ order, locale }: { order: Order; locale: string }) {
  const tOrders = useTranslations("orders");

  const getTrans = useTrans();
  const statusLabel = tOrders(`status.${order.status.toLowerCase()}`, {
    defaultValue: order.status,
  });

  return (
    <Link
      href={`/${locale}/account/orders/${order._id}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 -mx-2 px-2 rounded-xl first:pt-0 last:pb-0 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center gap-2">
        <div className="w-auto h-18 flex items-center">
          {order.items.map((item, i) => (
            <ImageWithFallback
              key={i}
              src={item?.productId?.imageCover?.url || ""}
              alt={getTrans(item?.productId?.title || "Product image")}
              width={42}
              height={42}
              className={cn(
                "rounded-full object-cover border-2 border-background",
                i !== 0 && "-ms-3",
              )}
              style={{ zIndex: order.items.length - i }}
            />
          ))}
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground">
            #{formatOrderNumber(order)}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDateTime(order.createdAt, locale)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-end">
          <Price
            amount={order.grandTotal ?? order.totalPrice ?? 0}
            className="font-extrabold text-md text-foreground"
          />
  
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
