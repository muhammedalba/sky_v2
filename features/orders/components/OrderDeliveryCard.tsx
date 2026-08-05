"use client";

import { useState } from "react";
import { Order } from "@/features/orders/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { useDownloadFile } from "@/shared/hooks/useDownloadFile";
import { useTranslations } from "next-intl";
import Modal from "@/shared/ui/Modal";
import { useUpdateOrderDetails } from "@/features/orders/hooks/useOrders";
import { useToast } from "@/shared/hooks/useToast";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import {
  FileTextIcon,
  EyeIcon,
  ExternalLinkIcon,
  DownloadIcon,
  UploadIcon,
  EditIcon,
  CheckIcon,
  CopyIcon,
  SpinnerIcon,
  TruckIcon,
  TrashIcon,
} from "@/shared/ui/Icons";

interface OrderDeliveryCardProps {
  order: Order;
}

export default function OrderDeliveryCard({ order }: OrderDeliveryCardProps) {
  const t = useTranslations("orders");
  const tButtons = useTranslations("buttons");
  const { downloadFile, isDownloading } = useDownloadFile();
  const updateDetailsMutation = useUpdateOrderDetails();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    openDialog,
    closeDialog,
    handleConfirm,
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    title: confirmTitle,
    message: confirmMessage,
    isDangerous: isConfirmDangerous,
  } = useConfirmDialog();

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Edit Name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [deliveryName, setDeliveryName] = useState(order.deliveryName || "");

  // Edit Receipt Number state
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [deliveryReceiptNumber, setDeliveryReceiptNumber] = useState(
    order.deliveryReceiptNumber || "",
  );

  const hasReceipt = Boolean(order.DeliveryReceiptImage);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleUpdateField = async (fields: {
    deliveryName?: string;
    deliveryReceiptNumber?: string;
    DeliveryReceiptImage?: File | null;
  }) => {
    const formData = new FormData();

    if (fields.deliveryName !== undefined) {
      formData.append("deliveryName", fields.deliveryName);
    }
    if (fields.deliveryReceiptNumber !== undefined) {
      formData.append("deliveryReceiptNumber", fields.deliveryReceiptNumber);
    }
    if (fields.DeliveryReceiptImage !== undefined) {
      if (fields.DeliveryReceiptImage) {
        formData.append("DeliveryReceiptImage", fields.DeliveryReceiptImage);
      } else {
        // If explicitly null, clear it in database
        formData.append("DeliveryReceiptImage", "");
      }
    }

    try {
      await updateDetailsMutation.mutateAsync({
        id: order._id,
        data: formData,
      });
      toastSuccess(t("messages.statusUpdated") || "Updated successfully");
    } catch (err) {
      console.error(err);
      toastError(t("messages.errorNotes") || "Failed to update details");
    }
  };

  const handleSaveName = async () => {
    await handleUpdateField({ deliveryName });
    setIsEditingName(false);
  };

  const handleSaveNumber = async () => {
    await handleUpdateField({ deliveryReceiptNumber });
    setIsEditingNumber(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (1MB max, same as backend)
      if (file.size > 1024 * 1024) {
        toastError("File is too large. Maximum size is 1MB");
        return;
      }
      await handleUpdateField({ DeliveryReceiptImage: file });
    }
  };

  const handleDeleteReceipt = () => {
    openDialog({
      title: t("deliveryInfo.deleteReceiptConfirmTitle"),
      message: t("deliveryInfo.deleteReceiptConfirmMessage"),
      isDangerous: true,
      onConfirm: async () => {
        await handleUpdateField({ DeliveryReceiptImage: null });
      },
    });
  };

  const handleDownloadReceipt = () => {
    if (!order.DeliveryReceiptImage) return;
    const ext = order.DeliveryReceiptImage.split(".").pop()?.split("?")[0] || "jpg";
    downloadFile(order.DeliveryReceiptImage, {
      fileName: `delivery-receipt-${order._id.slice(0, 8)}.${ext}`,
    });
  };

  return (
    <>
      <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between gap-4 bg-muted/70">
          <CardTitle className="text-sm font-bold title-gradient flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TruckIcon className="w-4 h-4" />
            </div>
            {t("deliveryInfo.title")}
          </CardTitle>
          {updateDetailsMutation.isPending && (
            <Badge
              variant="outline"
              className="rounded-xl font-bold text-xs h-7 px-2.5 bg-card border-border flex items-center gap-1.5"
            >
              <SpinnerIcon className="w-3 h-3 text-primary" />
              {t("deliveryInfo.saving")}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
            {/* Delivery Agent Name Section */}
            <div className="space-y-2 border-b border-border/10 pb-4 md:border-b-0 md:pb-0">
              <span className="text-xs font-semibold text-muted-foreground block">
                {t("deliveryInfo.deliveryName")}
              </span>
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={deliveryName}
                    onChange={(e) => setDeliveryName(e.target.value)}
                    className="flex-1 px-3 py-1 text-xs border rounded-lg outline-hidden focus:border-primary bg-background"
                    placeholder={t("deliveryInfo.deliveryName")}
                    disabled={updateDetailsMutation.isPending}
                  />
                  <Button
                    size="sm"
                    className="h-8 rounded-lg px-2.5 font-bold"
                    onClick={handleSaveName}
                    disabled={updateDetailsMutation.isPending}
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg px-2.5 font-bold"
                    onClick={() => {
                      setDeliveryName(order.deliveryName || "");
                      setIsEditingName(false);
                    }}
                    disabled={updateDetailsMutation.isPending}
                  >
                    <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 mt-1 bg-muted/20 p-2.5 rounded-xl border border-border/40">
                  <span className="text-xs font-bold text-foreground truncate">
                    {order.deliveryName || t("deliveryInfo.noDeliveryName")}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-muted-foreground hover:text-primary transition-colors focus:outline-hidden p-1"
                    title={t("deliveryInfo.editName")}
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Receipt Number Section */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground block">
                {t("deliveryInfo.receiptNumber")}
              </span>
              {isEditingNumber ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={deliveryReceiptNumber}
                    onChange={(e) => setDeliveryReceiptNumber(e.target.value)}
                    className="flex-1 px-3 py-1 text-xs border rounded-lg outline-hidden focus:border-primary bg-background"
                    placeholder={t("deliveryInfo.receiptNumber")}
                    disabled={updateDetailsMutation.isPending}
                  />
                  <Button
                    size="sm"
                    className="h-8 rounded-lg px-2.5 font-bold"
                    onClick={handleSaveNumber}
                    disabled={updateDetailsMutation.isPending}
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg px-2.5 font-bold"
                    onClick={() => {
                      setDeliveryReceiptNumber(order.deliveryReceiptNumber || "");
                      setIsEditingNumber(false);
                    }}
                    disabled={updateDetailsMutation.isPending}
                  >
                    <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 mt-1 bg-muted/20 p-2.5 rounded-xl border border-border/40">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold font-mono text-foreground truncate">
                      {order.deliveryReceiptNumber ||
                        t("deliveryInfo.noReceiptNumber")}
                    </span>
                    {order.deliveryReceiptNumber && (
                      <button
                        onClick={() => copyToClipboard(order.deliveryReceiptNumber!)}
                        className="text-muted-foreground hover:text-primary transition-colors focus:outline-hidden"
                      >
                        {copiedNumber ? (
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <CopyIcon className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditingNumber(true)}
                    className="text-muted-foreground hover:text-primary transition-colors focus:outline-hidden p-1"
                    title={t("deliveryInfo.editNumber")}
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Receipt Image Section */}
          <div className="pt-4 border-t border-border/20">
            <span className="text-xs font-semibold text-muted-foreground block mb-3">
              {t("deliveryInfo.receiptImage")}
            </span>
            {hasReceipt ? (
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <FileTextIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {t("deliveryInfo.receiptImage")}
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
                      {t("deliveryInfo.viewReceipt")}
                    </Button>
                    <a
                      href={order.DeliveryReceiptImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-border/60 bg-background text-muted-foreground hover:text-foreground text-xs transition-colors"
                      title={t("deliveryInfo.viewReceipt")}
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleDeleteReceipt}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 text-xs transition-colors"
                      title="Delete Image"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Receipt Preview Thumbnail */}
                <div
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-background/60 h-48 flex items-center justify-center transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md"
                >
                  <ImageWithFallback
                    src={order.DeliveryReceiptImage || ""}
                    alt={t("deliveryInfo.receiptImage")}
                    fill
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <span className="bg-background/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 z-10">
                      <EyeIcon className="w-3.5 h-3.5 text-emerald-500" />
                      {t("deliveryInfo.viewReceipt")}
                    </span>
                  </div>
                </div>

                {/* Change Image Button */}
                <div className="flex justify-end">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline">
                    <UploadIcon className="w-3.5 h-3.5" />
                    {t("deliveryInfo.changeImage")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={updateDetailsMutation.isPending}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-primary/50 bg-muted/10 rounded-xl p-8 transition-colors duration-200">
                <UploadIcon className="w-8 h-8 text-muted-foreground/60 mb-3" />
                <p className="text-xs font-bold text-foreground mb-1">
                  {t("deliveryInfo.noReceiptImage")}
                </p>
                <p className="text-[10px] text-muted-foreground mb-4">
                  {t("deliveryInfo.dragDrop")}
                </p>
                <label className="cursor-pointer">
                  <span className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5">
                    <UploadIcon className="w-3.5 h-3.5" />
                    {t("deliveryInfo.uploadImage")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={updateDetailsMutation.isPending}
                  />
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Preview Modal */}
      {hasReceipt && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title={t("deliveryInfo.receiptImage")}
          size="lg"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-auto rounded-xl bg-muted/10 p-2 border border-border">
              <ImageWithFallback
                src={order.DeliveryReceiptImage || ""}
                alt={t("deliveryInfo.receiptImage")}
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
                {t("deliveryInfo.downloadReceipt")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={tButtons("confirm")}
        cancelText={tButtons("cancel")}
        isDangerous={isConfirmDangerous}
        isLoading={isConfirmLoading}
      />
    </>
  );
}
