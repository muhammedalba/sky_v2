"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AxiosError } from "axios";
import {
  Order,
  ReturnReasonType,
  ReturnRequest,
} from "@/features/orders/types";
import {
  useApproveReturnRequest,
  useCreateCreditNote,
  useCreditNoteSummary,
  usePreviewCreditNote,
} from "@/features/orders/hooks/useOrders";
import { resolveOrderItem } from "@/features/orders/utils/orderItemUtils";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useToast } from "@/shared/hooks/useToast";
import { useTrans } from "@/shared/hooks/useTrans";
import Modal from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Checkbox } from "@/shared/ui/Checkbox";

interface OrderReturnDialogProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  /**
   * A customer's pending request being approved: its lines and reason are
   * filled in, and confirming approves it (the admin may change the
   * quantities).
   */
  request?: ReturnRequest;
}

const PAID = ["PAID", "PARTIALLY_REFUNDED"];
/** Before shipping, a full Moyasar refund cancels the order (server rule). */
const NOT_SHIPPED = ["pending_payment", "pending", "processing"];
export const REASON_TYPES: ReturnReasonType[] = ["defect", "other"];

/**
 * Returns items from the dashboard: the admin sets the returned quantities
 * and the reason (a defect: the store pays the shipping; other reasons: the
 * customer does), the server computes the credit note (its amounts and VAT
 * from the invoice, the shipping by weight), refunds it (Moyasar) or records
 * it (COD/transfer), issues the tax credit note, restocks and emails it to
 * the customer.
 */
export default function OrderReturnDialog({
  order,
  isOpen,
  onClose,
  request,
}: OrderReturnDialogProps) {
  const t = useTranslations("orders.returnDialog");
  const toast = useToast();
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const { data: summary, isLoading } = useCreditNoteSummary(order._id, isOpen);
  const preview = usePreviewCreditNote();
  const { mutate: create, isPending: isCreating } = useCreateCreditNote();
  const { mutate: approve, isPending: isApproving } = useApproveReturnRequest();
  const isPending = isCreating || isApproving;

  // A customer's request starts from its lines and reason, as asked (the
  // card remounts the dialog per request)
  const [mode, setMode] = useState<"items" | "full">("items");
  const [quantities, setQuantities] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      (request?.lines ?? []).map((l) => [l.itemIndex, String(l.quantity)]),
    ),
  );
  const [reasonType, setReasonType] = useState<ReturnReasonType | null>(
    request?.reasonType ?? null,
  );
  const [reason, setReason] = useState("");
  const [restock, setRestock] = useState(true);

  // "Whole order": every line's remaining quantity (shipping and fees follow)
  const lines = useMemo(() => {
    if (mode === "full") {
      return (summary?.remaining ?? [])
        .map((quantity, itemIndex) => ({ itemIndex, quantity }))
        .filter((line) => line.quantity > 0);
    }
    return Object.entries(quantities)
      .map(([index, value]) => ({
        itemIndex: Number(index),
        quantity: Number(value),
      }))
      .filter((line) => Number.isInteger(line.quantity) && line.quantity > 0);
  }, [mode, quantities, summary]);
  const invalid = lines.some(
    (line) => line.quantity > (summary?.remaining[line.itemIndex] ?? 0),
  );

  // The server computes the amounts: refresh them as quantities change
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
  const uncredited = summary?.uncreditedRefund ?? 0;
  // The money that goes back: less the return shipping and earlier refunds
  const toRefund = preview.data
    ? Math.max(
        0,
        // Amounts already rounded: 3 decimals keep a KWD fils
        Math.round((preview.data.refundAmount - uncredited) * 1000) / 1000,
      )
    : 0;
  const paid = PAID.includes(order.paymentStatus ?? "");
  const refundNote = !amounts
    ? null
    : toRefund === 0
      ? t("refundCovered")
      : !paid
        ? t("refundNone")
        : order.paymentMethodCode === "moyasar"
          ? t("refundMoyasar", { amount: formatCurrency(toRefund) })
          : t("refundManual", { amount: formatCurrency(toRefund) });

  const nothingLeft = !!summary && summary.remaining.every((n) => n === 0);
  // Everything left comes back: a paid Moyasar order not shipped yet is
  // cancelled by the full refund, and its coupon returned
  const returnsAll =
    !!summary &&
    lines.length > 0 &&
    summary.remaining.every(
      (left, i) =>
        left === (lines.find((l) => l.itemIndex === i)?.quantity ?? 0),
    );
  const cancelsOrder =
    returnsAll &&
    paid &&
    order.paymentMethodCode === "moyasar" &&
    NOT_SHIPPED.includes(order.status);
  const canSubmit =
    !isPending &&
    !!amounts &&
    !invalid &&
    lines.length > 0 &&
    !!reasonType &&
    (!!request || reason.trim() !== "") &&
    !!summary?.invoiceIssued;

  // Closes and clears the form; not while a return is being issued
  const close = () => {
    if (isPending) return;
    setMode("items");
    setQuantities({});
    setReasonType(null);
    setReason("");
    setRestock(true);
    resetPreview();
    onClose();
  };

  const onIssued = (note?: { displayNumber?: string }) => {
    toast.success(t("success", { number: note?.displayNumber ?? "" }));
    close();
  };
  const onFailed = (error: unknown) => {
    const message = (error as AxiosError<{ message?: unknown }>).response?.data
      ?.message;
    toast.error(typeof message === "string" ? message : t("error"));
  };

  // Issues the return: the server refunds, numbers, restocks and emails it
  const submit = () => {
    if (!reasonType) return;
    if (request) {
      approve(
        { id: order._id, requestId: request._id, lines, restock },
        { onSuccess: onIssued, onError: onFailed },
      );
      return;
    }
    create(
      { id: order._id, lines, reason: reason.trim(), reasonType, restock },
      { onSuccess: onIssued, onError: onFailed },
    );
  };

  const summaryRows = amounts
    ? ([
        ["products", amounts.products],
        ["discount", amounts.discount],
        ...(amounts.shipping ? [["shipping", amounts.shipping] as const] : []),
        ...(amounts.paymentFees
          ? [["paymentFees", amounts.paymentFees] as const]
          : []),
        ["taxable", amounts.taxable],
        ["tax", amounts.tax],
      ] as const)
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={request ? t("requestTitle") : t("title")}
      description={t("description")}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={close} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={submit} disabled={!canSubmit}>
            {isPending
              ? t("submitting")
              : request
                ? t("approve")
                : t("confirm")}
          </Button>
        </div>
      }
    >
      {isLoading || !summary ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : !summary.invoiceIssued ? (
        <p className="text-sm text-destructive">{t("noInvoice")}</p>
      ) : nothingLeft ? (
        <p className="text-sm text-muted-foreground">{t("nothingLeft")}</p>
      ) : (
        <div className="space-y-5">
          {request && (
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm">
              <p className="text-xs font-semibold text-muted-foreground">
                {t("requestNote")}
              </p>
              <p className="whitespace-pre-line text-foreground">
                {request.note}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {(["items", "full"] as const).map((option) => (
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
                {t(option === "full" ? "fullOption" : "itemsOption")}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 text-start">{t("product")}</th>
                  <th className="p-2 w-16">{t("sold")}</th>
                  <th className="p-2 w-16">{t("left")}</th>
                  <th className="p-2 w-24">{t("returnQty")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {order.items.map((item, index) => {
                  const left = summary.remaining[index] ?? 0;
                  const value =
                    mode === "full" ? String(left) : (quantities[index] ?? "");
                  const over = Number(value) > left;
                  return (
                    <tr key={index}>
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
                      <td className="p-2 text-center tabular-nums">{left}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={left}
                          step={1}
                          disabled={left === 0 || isPending || mode === "full"}
                          value={value}
                          onChange={(e) =>
                            setQuantities((q) => ({
                              ...q,
                              [index]: e.target.value,
                            }))
                          }
                          className={over ? "border-destructive" : undefined}
                        />
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
            {!reasonType && lines.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {t("chooseReason")}
              </p>
            )}
          </div>

          {amounts && (
            <div className="rounded-xl border border-border/60 p-3 space-y-1.5 text-sm">
              {summaryRows.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t(`summary.${key}`)}
                  </span>
                  <span className="tabular-nums">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border/50 pt-1.5 font-bold">
                <span>{t("summary.total")}</span>
                <span className="tabular-nums">
                  {formatCurrency(amounts.total)}
                </span>
              </div>
              {returnShipping > 0 && (
                <>
                  <div className="flex justify-between text-destructive">
                    <span>{t("summary.returnShipping")}</span>
                    <span className="tabular-nums">
                      − {formatCurrency(returnShipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{t("summary.netRefund")}</span>
                    <span className="tabular-nums">
                      {formatCurrency(preview.data?.refundAmount ?? 0)}
                    </span>
                  </div>
                </>
              )}
              {preview.data?.includesCharges && (
                <p className="text-xs text-muted-foreground">
                  {t("includesCharges")}
                </p>
              )}
            </div>
          )}

          {summary.discountEstimated && (
            <p className="text-xs text-warning">{t("discountEstimated")}</p>
          )}

          {uncredited > 0 && (
            <p className="text-xs text-warning">
              {t("uncredited", { amount: formatCurrency(uncredited) })}
            </p>
          )}

          {!request && (
            <Textarea
              label={t("reasonLabel")}
              placeholder={t("reasonPlaceholder")}
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
            />
          )}

          <Checkbox
            label={t("restock")}
            checked={restock}
            onChange={(e) => setRestock(e.target.checked)}
            disabled={isPending}
          />

          {refundNote && (
            <p className="text-xs font-medium text-foreground">{refundNote}</p>
          )}
          {cancelsOrder && (
            <p className="text-xs font-medium text-warning">
              {t("cancelsOrder")}
            </p>
          )}
          <p className="text-xs text-destructive">{t("warning")}</p>
        </div>
      )}
    </Modal>
  );
}
