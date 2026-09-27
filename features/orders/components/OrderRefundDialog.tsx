"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AxiosError } from "axios";
import { Order } from "@/features/orders/types";
import { useRefundOrder } from "@/features/orders/hooks/useOrders";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useToast } from "@/shared/hooks/useToast";
import Modal from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";

/** Statuses in which a full refund cancels the order and returns its stock (server rule). */
const NOT_SHIPPED = ["pending_payment", "pending", "processing"];

interface OrderRefundDialogProps {
  order: Order;
  /** Paid amount not refunded yet, in major units. */
  remaining: number;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Refunds a Moyasar-paid order from the dashboard: all that is left, or part of
 * it, with a mandatory reason (kept in the audit log). The server then updates
 * the order, stock, coupon and emails the customer, like a Moyasar-dashboard refund.
 */
export default function OrderRefundDialog({
  order,
  remaining,
  isOpen,
  onClose,
}: OrderRefundDialogProps) {
  const t = useTranslations("orders.refund");
  const toast = useToast();
  const formatCurrency = useFormatCurrency();
  const { mutate: refund, isPending } = useRefundOrder();

  const [mode, setMode] = useState<"full" | "partial">("full");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const partialAmount = Number(amount);
  const partialValid =
    amount !== "" && partialAmount > 0 && partialAmount <= remaining;
  const isFull = mode === "full" || (partialValid && partialAmount >= remaining);
  const canSubmit =
    !isPending && reason.trim() !== "" && (mode === "full" || partialValid);

  const warning = !isFull
    ? t("warningPartial")
    : NOT_SHIPPED.includes(order.status)
      ? t("warningCancel")
      : t("warningShipped");

  const close = () => {
    if (isPending) return;
    setMode("full");
    setAmount("");
    setReason("");
    onClose();
  };

  const submit = () => {
    refund(
      {
        id: order._id,
        amount: mode === "partial" ? partialAmount : undefined,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success(t("success"));
          close();
        },
        onError: (error) => {
          const message = (error as AxiosError<{ message?: unknown }>).response
            ?.data?.message;
          toast.error(typeof message === "string" ? message : t("error"));
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={t("title")}
      description={t("remaining", { amount: formatCurrency(remaining) })}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={close} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={submit} disabled={!canSubmit}>
            {isPending ? t("submitting") : t("confirm")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {(["full", "partial"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={mode === option}
              onClick={() => setMode(option)}
              disabled={isPending}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                mode === option
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(option === "full" ? "fullOption" : "partialOption")}
            </button>
          ))}
        </div>

        {mode === "partial" && (
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={remaining}
            step="0.01"
            label={t("amountLabel", { currency: order.currency || "SAR" })}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={
              amount !== "" && !partialValid
                ? t("amountInvalid", { max: formatCurrency(remaining) })
                : undefined
            }
            disabled={isPending}
          />
        )}

        <Textarea
          label={t("reasonLabel")}
          placeholder={t("reasonPlaceholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          disabled={isPending}
        />

        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-medium text-amber-700 dark:text-amber-400">
          {warning}
        </p>
      </div>
    </Modal>
  );
}
