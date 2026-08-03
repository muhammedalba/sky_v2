"use client";

import { useState } from "react";
import { Order } from "@/features/orders/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { formatDate } from "@/lib/utils";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useDownloadFile } from "@/shared/hooks/useDownloadFile";
import { useTranslations } from "next-intl";
import Modal from "@/shared/ui/Modal";
import { FileTextIcon, EyeIcon, ExternalLinkIcon, DownloadIcon } from "@/shared/ui/Icons";

interface OrderPaymentCardProps {
  order: Order;
}

export default function OrderPaymentCard({ order }: OrderPaymentCardProps) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslations("orders");
  const { downloadFile, isDownloading } = useDownloadFile();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const hasReceipt = Boolean(order.transferReceiptImg);

  const handleDownloadReceipt = () => {
    const ext = order.transferReceiptImg?.split(".").pop()?.split("?")[0] || "jpg";
    downloadFile(order.transferReceiptImg, {
      fileName: `receipt-${order.user?.name || "transfer"}.${ext}`,
    });
  };

  return (
    <>
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
            {t("paymentInfo.paymentInfo")}
          </CardTitle>
          <Badge
            variant="success"
            className="rounded-xl font-bold text-xs bg-background"
          >
            {order.paymentMethodCode}
          </Badge>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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

          {/* Bank Transfer Receipt Section */}
          {hasReceipt && (
            <div className="pt-4 border-t border-border/20">
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <FileTextIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {t("paymentInfo.transferReceipt")}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReceiptModalOpen(true)}
                      className="h-8 text-xs font-medium gap-1.5 rounded-lg border-border/60"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      {t("paymentInfo.viewReceipt")}
                    </Button>
                    <a
                      href={order.transferReceiptImg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-border/60 bg-background text-muted-foreground hover:text-foreground text-xs transition-colors"
                      title={t("paymentInfo.downloadReceipt")}
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Interactive Receipt Preview Thumbnail */}
                <div
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-background/60 h-44 flex items-center justify-center transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md"
                >
                  <ImageWithFallback
                    src={order.transferReceiptImg || ""}
                    alt={t("paymentInfo.transferReceipt")}
                    fill
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <span className="bg-background/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 z-10">
                      <EyeIcon className="w-3.5 h-3.5 text-indigo-500" />
                      {t("paymentInfo.viewReceipt")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Preview Modal */}
      {hasReceipt && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title={t("paymentInfo.transferReceipt")}
          size="lg"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-auto rounded-xl bg-muted/10 p-2  border border-border">
              <ImageWithFallback
                src={order.transferReceiptImg || ""}
                alt={t("paymentInfo.transferReceipt")}
                width={800}
                height={800}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-end gap-3 w-full pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs rounded-xl"
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
              >
                <DownloadIcon className="w-4 h-4" />
                {t("paymentInfo.downloadReceipt")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
