"use client";

import { Order } from "@/features/orders/types";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { useTranslations } from "next-intl";

interface OrderSummaryCardProps {
  order: Order;
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  // hooks
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("orders");

  // order data
  const subtotal = order.totalPrice || 0;
  const shipping = order.shippingAmount || 0;
  const discount = order.discountAmount || 0;
  const tax = order.taxAmount || 0;
  const paymentFees = order.paymentFees || 0;
  const grandTotal = order.grandTotal || subtotal;

  const totalQuantity =
    order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
  const totalItems = order.items?.length || 0;

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20 bg-muted/70  rounded-t-2xl">
        <CardTitle className="text-sm font-bold title-gradient">
          {t("orderSummary")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{t("subtotal")}</span>
            <span className="text-foreground tabular-nums">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{t("shipping")}</span>
            <span className="text-foreground tabular-nums">
              {formatCurrency(shipping)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-xs font-bold text-red-500">
              <span>{t("discount")}</span>
              <span className="tabular-nums">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="h-px bg-border/40 my-1" />
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="text-success">{t("tax")}</span>
            <span className="text-success tabular-nums">
              {formatCurrency(tax)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="text-warning">{t("paymentFees")}</span>
            <span className="text-warning tabular-nums">
              {formatCurrency(paymentFees)}
            </span>
          </div>
        </div>

        <div className="h-px bg-border/40 my-1" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-foreground">
            {t("grandTotal")}
          </span>
          <span className="text-lg font-black text-primary tabular-nums">
            {formatCurrency(grandTotal)}
          </span>
        </div>

        <div className="h-px bg-border/40 my-1" />

        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{t("totalQuantity")}</span>
            <span className="text-foreground font-bold tabular-nums">
              {totalQuantity}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{t("totalItems")}</span>
            <span className="text-foreground font-bold tabular-nums">
              {totalItems}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
