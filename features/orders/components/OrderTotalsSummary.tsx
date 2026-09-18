"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/ui/Card";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import Price from "@/shared/ui/Price";
import { ShoppingBagIcon } from "@/shared/ui/Icons";

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

  return (
    <ScrollReveal animation="fade">
      <Card className={cn("border-border/30 bg-muted/5", className)}>
        <div className="w-full p-4 border-b bg-accent/70 flex gap-2 items-center">
        <ShoppingBagIcon className="text-warning w-5 h-5"/>
          <h4 className="text-sm font-bold title-gradient ">
            {t("orderSummary")}
          </h4>
        </div>
        <CardContent className="p-4 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground p-2">
            <span>{t("subtotal")}</span>

            <Price
              className="tabular-nums font-semibold"
              currencyClassName=" text-[1em]"
              amount={order.totalPrice}
              animate={false}
            />
          </div>
          {!!order.shippingAmount && order.shippingAmount > 0 && (
            <div className="flex justify-between text-muted-foreground p-2">
              <span>{t("shippingAmount")}</span>
              <span className="tabular-nums font-semibold">
                <Price
                  className="tabular-nums font-semibold"
                  currencyClassName=" text-[1em]"
                  amount={order.shippingAmount}
                  animate={false}
                />
              </span>
            </div>
          )}
          {!!order.discountAmount && order.discountAmount > 0 && (
            <div className="flex justify-between text-destructive p-2">
              <span>{t("discount")}</span>
              <span className="tabular-nums font-bold">
                -
                <Price
                  className="tabular-nums font-semibold"
                  currencyClassName=" text-[1em]"
                  amount={order.discountAmount}
                  animate={false}
                />
              </span>
            </div>
          )}
          {!!order.taxAmount && order.taxAmount > 0 && (
            <div className="flex justify-between text-muted-foreground p-2">
              <span>{t("taxAmount")}</span>
              <span className="tabular-nums font-semibold">
                <Price
                  className="tabular-nums font-semibold"
                  currencyClassName=" text-[1em]"
                  amount={order.taxAmount}
                  animate={false}
                />
              </span>
            </div>
          )}
          {!!order.paymentFees && order.paymentFees > 0 && (
            <div className="flex justify-between text-muted-foreground p-2">
              <span>{t("paymentFees")}</span>
              <span className="tabular-nums font-semibold">
                <Price
                  className="tabular-nums font-semibold"
                  currencyClassName=" text-[1em]"
                  amount={order.paymentFees}
                  animate={false}
                />
              </span>
            </div>
          )}
          <div className="border-t border-border/40 mt-2 pt-2 flex justify-between text-sm font-black text-foreground p-2">
            <span>{t("grandTotal")}</span>
            <span className="tabular-nums text-primary text-base">
              <Price
                className="tabular-nums font-semibold"
                currencyClassName=" text-[1em]"
                amount={order.grandTotal || order.totalPrice || 0}
                animate={false}
              />
            </span>
          </div>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}
