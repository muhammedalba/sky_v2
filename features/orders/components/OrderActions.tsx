"use client";

import { useCallback, useState } from "react";
import { Order } from "@/features/orders/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  useDeleteOrder,
  useUpdateOrderStatus,
} from "@/features/orders/hooks/useOrders";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import Link from "next/link";
import { CouponsIcon, ProductsIcon, SpinnerIcon, UserIcon, XIcon } from "@/shared/ui/Icons";

import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/shared/constants/order-constants";
import { cn } from "@/lib/utils";

interface OrderActionsProps {
  order: Order;
}

export default function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const t = useTranslations("orders");
  const tButtons = useTranslations("buttons");
  const tMessages = useTranslations("messages");
  const deleteOrderMutation = useDeleteOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const [isUpdating, setIsUpdating] = useState(false);
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
  const { success: toastSuccess, error: toastError } = useToast();

  const handleDelete = useCallback(
    (id: string, name: string) => {
      openDialog({
        title: tMessages("deleteConfirm"),
        message: tMessages("deleteConfirmWithName", { name }),
        onConfirm: async () => {
          try {
            await deleteOrderMutation.mutateAsync(id);
            toastSuccess(tMessages("success"));
            router.push(`/dashboard/orders`);
          } catch (error: unknown) {
            const msg =
              error instanceof Error
                ? error.message
                : tMessages("error") || "حدث خطأ أثناء الحذف";
            toastError(msg);
          }
        },
      });
    },
    [
      openDialog,
      deleteOrderMutation,
      toastSuccess,
      toastError,
      tMessages,
      router,
    ],
  );

  const handlePaymentStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: order._id,
        paymentStatus: newStatus,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: order._id,
        status: newStatus,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/20 bg-muted/70 ">
          <CardTitle className="text-sm font-bold title-gradient">
            {t("actions.quickActions")}
          </CardTitle>
        </CardHeader>
        {/*Card Content  */}
        <CardContent className="p-6 space-y-2.5">
          <Link
            href={`/dashboard/users/${order.user?._id}/edit`}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            <UserIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {t("actions.viewUser")}
          </Link>

          {order.couponId && (
            <Link
              href={`/dashboard/coupons/${order.couponId?._id}/edit`}
              className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
            >
              <CouponsIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {t("actions.viewCoupon")}
            </Link>
          )}

          <Link
            href={`/dashboard/products`}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            <ProductsIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {t("actions.viewProducts")}
          </Link>

          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => triggerMockAction("email", "Send Email")}
            disabled={actionLoading !== null}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            {actionLoading === "email" ? (
              <SpinnerIcon className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <MailIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            Send Email to Customer
          </Button> */}
          {/* order status */}
          <p className="w-full mb-0 rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground">
            <ProductsIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {t("orderStatus")} :{" "}
          </p>
          <div className="flex items-center gap-2">
            {isUpdating ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                {t("updating")}
              </div>
            ) : (
              <select
                value={order.status}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={cn(
                  "flex items-center gap-2 w-full px-4 py-1  outline-0 text-xs text-start font-medium text-foreground hover:bg-muted/60 disabled:opacity-50 transition-colors border rounded-lg",
                  "focus:border-primary",
                )}
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {t(status.label)}
                  </option>
                ))}
              </select>
            )}
          </div>
          {/* payment status */}
          <p className="w-full mb-0 rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground">
            <ProductsIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {t("paymentStatusLabel")} :
          </p>
          <div className=" flex items-center gap-2">
            {isUpdating ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                {t("updating")}
              </div>
            ) : (
              <select
                value={order.paymentStatus}
                disabled={isUpdating}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                className={cn(
                  "flex items-center gap-2 w-full px-4 py-1  outline-0 text-xs text-start font-medium text-foreground hover:bg-muted/60 disabled:opacity-50 transition-colors border rounded-lg",
                  "focus:border-primary",
                )}
              >
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value.toUpperCase()}>
                    {t(status.label)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="h-px bg-border/40 my-1.5" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(order._id, order?.user?.name || "")}
            disabled={isConfirmLoading}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-red-500/10 text-red-600 transition-colors"
          >
            <XIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
            {t("actions.cancelOrder")}
          </Button>
        </CardContent>
      </Card>

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
