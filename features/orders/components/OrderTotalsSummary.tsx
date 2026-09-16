"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/ui/Card";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

interface OrderTotalsSummaryProps {
  order: Order;
  className?: string;
}

/**
 * Order price breakdown (subtotal → grand total), shared between the admin
 * order drawer and the customer order-detail page — same fields, same math,
 * same currency formatting in both places, so it's kept as a single source
 * instead of two copies that could silently drift apart.
 */
export default function OrderTotalsSummary({
  order,
  className,
}: OrderTotalsSummaryProps) {
  const t = useTranslations("orders");
  const formatCurrency = useFormatCurrency();

  return (
    <Card className={cn("border-border/30 bg-muted/5", className)}>
      <CardContent className="p-4 space-y-2 text-xs">
        <h4 className="text-sm font-bold text-foreground mb-1">
          {t("orderSummary")}
        </h4>
        <div className="flex justify-between text-muted-foreground">
          <span>{t("subtotal")}</span>
          <span className="tabular-nums font-semibold">
            {formatCurrency(order.totalPrice || 0)}
          </span>
        </div>
        {!!order.shippingAmount && order.shippingAmount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>{t("shippingAmount")}</span>
            <span className="tabular-nums font-semibold">
              {formatCurrency(order.shippingAmount)}
            </span>
          </div>
        )}
        {!!order.discountAmount && order.discountAmount > 0 && (
          <div className="flex justify-between text-red-500 dark:text-red-400">
            <span>{t("discount")}</span>
            <span className="tabular-nums font-bold">
              -{formatCurrency(order.discountAmount)}
            </span>
          </div>
        )}
        {!!order.taxAmount && order.taxAmount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>{t("taxAmount")}</span>
            <span className="tabular-nums font-semibold">
              {formatCurrency(order.taxAmount)}
            </span>
          </div>
        )}
        {!!order.paymentFees && order.paymentFees > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>{t("paymentFees")}</span>
            <span className="tabular-nums font-semibold">
              {formatCurrency(order.paymentFees)}
            </span>
          </div>
        )}
        <div className="border-t border-border/40 mt-2 pt-2 flex justify-between text-sm font-black text-foreground">
          <span>{t("grandTotal")}</span>
          <span className="tabular-nums text-primary text-base">
            {formatCurrency(order.grandTotal || order.totalPrice || 0)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
