"use client";

import { Order } from "@/types";
import { Badge } from "@/shared/ui/Badge";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import {
  cn,
  formatRelativeTime,
  getPaymentStatusColor,
  getStatusColor,
} from "@/lib/utils";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";

interface OrderMobileCardProps {
  order: Order;
  onClick: () => void;
}

export default function OrderMobileCard({
  order,
  onClick,
}: OrderMobileCardProps) {
  const formatCurrency = useFormatCurrency();

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl border border-border/40 bg-accent/40  hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99] space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-xs text-foreground bg-muted/50 px-2 py-1 rounded-md">
          #{order._id?.slice(0, 8).toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(order.createdAt, "en-US")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full shrink-0 overflow-hidden relative bg-muted/30">
          <ImageWithFallback
            src={order.user?.avatar || ""}
            alt={order.user?.name || "Guest"}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {order.user?.name || "Guest"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {order.user?.email || ""}
          </p>
        </div>
        <div className="text-end shrink-0">
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(order.grandTotal || order.totalPrice || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {order.totalQuantity ?? order.items?.length ?? 0} items
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/10">
        <Badge
          className={cn(
            "rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none",
            getStatusColor(order.status),
          )}
        >
          {order.status?.replace("_", " ") || "Unknown"}
        </Badge>
        <Badge
          className={cn(
            "rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none",
            getPaymentStatusColor(order.paymentStatus || ""),
          )}
        >
          {order.paymentStatus || "—"}
        </Badge>
      </div>
    </div>
  );
}
