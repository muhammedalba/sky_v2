"use client";

import { useState } from "react";
import { Order } from "@/features/orders/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { useTrans } from "@/shared/hooks/useTrans";
import Badge from "@/shared/ui/Badge";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTranslations } from "next-intl";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { CheckIcon, CopyIcon } from "@/shared/ui/Icons";

interface OrderShippingCardProps {
  order: Order;
}

export default function OrderShippingCard({ order }: OrderShippingCardProps) {
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("orders");
  const address = order.shippingAddress;
  const fullName =
    `${address?.firstName || ""} ${address?.lastName || ""}`.trim() ||
    "Guest Customer";

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between gap-4 bg-muted">
        <CardTitle className="text-sm font-bold title-gradient flex items-center gap-2">
          <ImageWithFallback
            alt={order.shippingProviderId?.name || ""}
            src={order.shippingProviderId?.logo || ""}
            width={40}
            height={40}
            className="rounded-lg"
          />
          {t("shippingInfo.shippingInfo")}
        </CardTitle>
        <Badge
          variant="success"
          className="rounded-xl font-bold text-xs h-8 px-3 bg-card border-border hover:bg-secondary/40 flex items-center gap-1.5"
        >
          {order.shippingAddress?.addressType}
        </Badge>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.fullName")}
              </span>
              <span className="text-foreground font-bold text-right">
                {fullName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.phone")}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-bold">
                  {address?.phone || "N/A"}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(address?.phone || "N/A", setCopiedPhone)
                  }
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {copiedPhone ? (
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <CopyIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.country")}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span>{getTrans(address?.country?.name) || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.city")}
              </span>
              <span className="text-foreground font-bold">
                {getTrans(address?.city?.name) || "N/A"}
              </span>
            </div>

            <div className="flex items-start justify-between text-xs font-medium border-b border-border/10 pb-2 gap-4">
              <span className="text-muted-foreground font-semibold shrink-0">
                {t("shippingInfo.address")}
              </span>
              <span className="text-foreground font-bold text-right leading-normal">
                {address?.street || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.building")}
              </span>
              <span className="text-foreground font-bold">
                {address?.building || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.postalCode")}
              </span>
              <span className="text-foreground font-bold">
                {address?.postalCode || "N/A"}
              </span>
            </div>
            {address?.companyName && (
              <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
                <span className="text-muted-foreground font-semibold">
                  {t("shippingInfo.companyName")}
                </span>
                <span className="text-foreground font-bold">
                  {address.companyName}
                </span>
              </div>
            )}
            {address?.vendorVatNo && (
              <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
                <span className="text-muted-foreground font-semibold">
                  {t("shippingInfo.vendorVatNo")}
                </span>
                <span className="text-foreground font-bold">
                  {address.vendorVatNo}
                </span>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.shippingProvider")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded font-black tracking-wider border-none scale-90">
                  {order?.shippingProviderId?.name}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.shippingCode")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded font-black tracking-wider border-none scale-90">
                  {order?.shippingProviderId?.code}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.estimatedDays")}
              </span>
              <span className="text-foreground font-bold">
                {order?.shippingRateId?.estimatedDays}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.basePrice")}
              </span>
              <span className="text-foreground font-bold">
                {formatCurrency(order?.shippingRateId?.basePrice)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.additionalKg")}
              </span>
              <span className="text-foreground font-bold">
                {formatCurrency(order?.shippingRateId?.additionalKgPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.baseWeight")}
              </span>
              <span className="text-foreground font-bold">
                {order?.shippingRateId?.baseWeight} kg
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.trackingUrl")}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-bold font-mono text-[11px]">
                  {order?.shippingProviderId?.trackingUrl}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      order?.shippingProviderId?.trackingUrl || "N/A",
                      setCopiedTracking,
                    )
                  }
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {copiedTracking ? (
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <CopyIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.shippingCost")}
              </span>
              <span className="text-foreground font-bold tabular-nums">
                {formatCurrency(order.shippingAmount)}
              </span>
            </div>
          </div>
        </div>
        {order.shippingAddress?.additionalInfo && (
          <>
            <div className="h-px bg-border/40 my-1" />
            <div className="flex items-start justify-between text-xs font-medium  py-2 gap-3 ">
              <span className="text-muted-foreground font-semibold">
                {t("shippingInfo.additionalInfo")}:
              </span>
              <span className="text-foreground font-bold">
                {order.shippingAddress?.additionalInfo}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
