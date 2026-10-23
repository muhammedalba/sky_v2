"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AxiosError } from "axios";
import { Order, ReturnReasonType } from "@/features/orders/types";
import {
  useCreateReturnRequest,
  usePreviewMyReturn,
} from "@/features/orders/hooks/useOrders";
import { resolveOrderItem } from "@/features/orders/utils/orderItemUtils";
import { returnedQuantities } from "@/features/orders/utils/returnUtils";
import { REASON_TYPES } from "@/features/orders/components/OrderReturnDialog";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useToast } from "@/shared/hooks/useToast";
import { useTrans } from "@/shared/hooks/useTrans";
import Modal from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";

interface CustomerReturnDialogProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The customer asks for a return: which items and how many, why (a defect,
 * or other reasons such as a change of mind) and a description. The server
 * shows what would come back (a defect: products, VAT and their shipping;
 * other reasons: products and VAT less the return shipping); the team
 * reviews the request before any refund.
 */
export default function CustomerReturnDialog({
  order,
  isOpen,
  onClose,
}: CustomerReturnDialogProps) {
  const t = useTranslations("orders.returnRequests");
  const td = useTranslations("orders.returnDialog");
  const toast = useToast();
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const preview = usePreviewMyReturn();
  const { mutate: send, isPending } = useCreateReturnRequest();

  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [reasonType, setReasonType] = useState<ReturnReasonType | null>(null);
  const [note, setNote] = useState("");

  // Per line, what is left to return (from the server), and so what came back
  const remaining = order.returnPolicy?.remaining ?? [];
  const returned = useMemo(() => returnedQuantities(order), [order]);
  const returnedTotal = returned.reduce((sum, n) => sum + n, 0);
  const lines = useMemo(
    () =>
      Object.entries(quantities)
        .map(([index, value]) => ({
          itemIndex: Number(index),
          quantity: Number(value),
        }))
        .filter((l) => Number.isInteger(l.quantity) && l.quantity > 0),
    [quantities],
  );
  const invalid = lines.some((l) => l.quantity > (remaining[l.itemIndex] ?? 0));

  // The expected refund, from the server, as the choices change
  const { mutate: runPreview, reset: resetPreview } = preview;
  useEffect(() => {
    if (!isOpen || lines.length === 0 || invalid || !reasonType) {
      resetPreview();
      return;
    }
    const timer = setTimeout(
      () => runPreview({ id: order._id, lines, reasonType }),
      300,
    );
    return () => clearTimeout(timer);
  }, [isOpen, lines, invalid, reasonType, order._id, runPreview, resetPreview]);

  const amounts = preview.data?.amounts;
  const returnShipping = preview.data?.deductions?.returnShipping?.total ?? 0;
  const canSubmit =
    !isPending &&
    lines.length > 0 &&
    !invalid &&
    !!reasonType &&
    note.trim() !== "";

  // Closes and clears the form; not while it is being sent
  const close = () => {
    if (isPending) return;
    setQuantities({});
    setReasonType(null);
    setNote("");
    resetPreview();
    onClose();
  };

  const submit = () => {
    if (!reasonType) return;
    send(
      { id: order._id, lines, reasonType, note: note.trim() },
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
      description={t("description")}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={close} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {returnedTotal > 0 && (
          <p className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            {t("alreadyReturned", { count: returnedTotal })}
          </p>
        )}
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="p-2 text-start">{td("product")}</th>
                <th className="p-2 w-16">{t("purchased")}</th>
                <th className="p-2 w-16">{t("returned")}</th>
                <th className="p-2 w-16">{t("available")}</th>
                <th className="p-2 w-24">{td("returnQty")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {order.items.map((item, index) => {
                const left = remaining[index] ?? 0;
                const value = quantities[index] ?? "";
                const fullyReturned = left === 0 && returned[index] > 0;
                return (
                  <tr
                    key={index}
                    className={left === 0 ? "opacity-60" : undefined}
                  >
                    <td className="p-2">
                      <p className="font-medium text-foreground">
                        {getTrans(resolveOrderItem(item).title)}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(item.price)}
                      </p>
                    </td>
                    <td className="p-2 text-center tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="p-2 text-center tabular-nums">
                      {returned[index] > 0 ? (
                        <span className="font-semibold text-destructive">
                          {returned[index]}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2 text-center tabular-nums font-semibold">
                      {left}
                    </td>
                    <td className="p-2">
                      {fullyReturned ? (
                        <span className="block text-center text-[11px] font-semibold text-muted-foreground">
                          {t("fullyReturned")}
                        </span>
                      ) : (
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={left}
                          step={1}
                          disabled={left === 0 || isPending}
                          value={value}
                          onChange={(e) =>
                            setQuantities((q) => ({
                              ...q,
                              [index]: e.target.value,
                            }))
                          }
                          className={
                            Number(value) > left
                              ? "border-destructive"
                              : undefined
                          }
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {t("reasonType")}
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            role="radiogroup"
          >
            {REASON_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={reasonType === type}
                onClick={() => setReasonType(type)}
                disabled={isPending}
                className={`rounded-xl border px-3 py-2.5 text-start transition-colors ${
                  reasonType === type
                    ? "border-primary bg-primary/10"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <span
                  className={`block text-sm font-semibold ${
                    reasonType === type ? "text-primary" : "text-foreground"
                  }`}
                >
                  {t(`reasonTypes.${type}`)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t(`reasonHints.${type}`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label={t("noteLabel")}
          placeholder={t("notePlaceholder")}
          value={note}
          maxLength={1000}
          onChange={(e) => setNote(e.target.value)}
          disabled={isPending}
        />

        {amounts && preview.data && (
          <div className="rounded-xl border border-border/60 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {td("summary.products")}
              </span>
              <span className="tabular-nums">
                {formatCurrency(amounts.products)}
              </span>
            </div>
            {amounts.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {td("summary.discount")}
                </span>
                <span className="tabular-nums">
                  − {formatCurrency(amounts.discount)}
                </span>
              </div>
            )}
            {amounts.shipping > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {td("summary.shipping")}
                </span>
                <span className="tabular-nums">
                  {formatCurrency(amounts.shipping)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{td("summary.tax")}</span>
              <span className="tabular-nums">
                {formatCurrency(amounts.tax)}
              </span>
            </div>
            {returnShipping > 0 && (
              <div className="flex justify-between text-destructive">
                <span>{td("summary.returnShipping")}</span>
                <span className="tabular-nums">
                  − {formatCurrency(returnShipping)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/50 pt-1.5 font-bold">
              <span>{t("expected")}</span>
              <span className="tabular-nums">
                {formatCurrency(preview.data.refundAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t("expectedNote")}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
