"use client";

import { Order } from "@/features/orders/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatDate } from "@/lib/utils";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTranslations } from "next-intl";

interface OrderPaymentCardProps {
  order: Order;
}

export default function OrderPaymentCard({ order }: OrderPaymentCardProps) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("orders");

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between gap-4 bg-muted">
        <CardTitle className="text-sm font-bold title-gradient flex items-center gap-2">
          <ImageWithFallback
            alt={order.shippingProviderId?.name}
            src={order.shippingProviderId?.logo}
            width={40}
            height={40}
            className="rounded-lg"
          />
          {t("paymentInfo.paymentInfo")}
        </CardTitle>
        <Badge
          variant="success"
          className="rounded-xl font-bold text-xs bg-background"
        >
          {order.paymentMethodCode}
        </Badge>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("paymentInfo.paymentMethod")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-md bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded font-black tracking-wider border-none scale-90">
                  {order.paymentMethodCode}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("paymentInfo.paymentDate")}
              </span>
              <span className="text-foreground font-bold">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("paymentInfo.paymentStatus")}
              </span>
              <Badge className="rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase border-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {order.paymentStatus || "N/A"}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("paymentInfo.currency")}
              </span>
              <span className="text-foreground font-bold uppercase">
                {order.currency || "SAR"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("paymentInfo.paymentFees")}
              </span>
              <span className="text-foreground font-bold tabular-nums">
                {formatCurrency(order.paymentFees || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("paymentInfo.amountPaid")}
              </span>
              <span className="text-foreground font-bold tabular-nums">
                {formatCurrency(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
