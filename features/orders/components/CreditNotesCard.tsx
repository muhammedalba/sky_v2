"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Order, OrderCreditNote } from "@/features/orders/types";
import { useRegenerateCreditNote } from "@/features/orders/hooks/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import { DownloadIcon, EyeIcon, RefreshCwIcon } from "@/shared/ui/Icons";
import { useDownloadFile } from "@/shared/hooks/useDownloadFile";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useToast } from "@/shared/hooks/useToast";
import { getFileUrl } from "@/shared/utils/image.util";
import { formatDate } from "@/lib/utils";
import { Can } from "@/components/auth/Can";
import { Permissions } from "@/features/roles/types";

interface CreditNotesCardProps {
  order: Order;
  /** Dashboard: refund details, reason and PDF regeneration. */
  admin?: boolean;
}

/**
 * The order's tax credit notes (مرتجعات ضريبية): each one can be viewed and
 * downloaded, like the invoice. Renders nothing while there is none.
 */
export default function CreditNotesCard({
  order,
  admin,
}: CreditNotesCardProps) {
  const t = useTranslations("orders.creditNotes");
  const locale = useLocale();
  const formatCurrency = useFormatCurrency();
  const toast = useToast();
  const { downloadFile, isDownloading } = useDownloadFile();
  const { mutate: regenerate, isPending: isRegenerating } =
    useRegenerateCreditNote();
  const [viewing, setViewing] = useState<OrderCreditNote | null>(null);

  const notes = order.creditNotes ?? [];
  if (notes.length === 0) return null;

  const viewingUrl = getFileUrl(viewing?.file);

  return (
    <>
      <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/20 bg-muted/70">
          <CardTitle className="text-sm font-bold title-gradient">
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/30">
          {notes.map((note) => {
            const url = getFileUrl(note.file);
            const total = note.total ?? note.amounts?.total ?? 0;
            // Other reasons: the return shipping kept back from the refund
            const kept =
              note.returnShipping ??
              note.deductions?.returnShipping?.total ??
              0;
            return (
              <div
                key={note._id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="space-y-1 min-w-0">
                  <p className="font-mono text-sm font-bold text-foreground">
                    {note.displayNumber ?? t("awaitingRefund")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {note.issuedAt ? formatDate(note.issuedAt, locale) : "-"} ·{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatCurrency(total)}
                    </span>
                    {note.reasonType &&
                      ` · ${t(`reasonTypes.${note.reasonType}`)}`}
                  </p>
                  {kept > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {t("returnShipping", { amount: formatCurrency(kept) })} ·{" "}
                      {t("netRefund", {
                        amount: formatCurrency(
                          // Amounts already rounded: 3 decimals keep a KWD fils
                          Math.round((total - kept) * 1000) / 1000,
                        ),
                      })}
                    </p>
                  )}
                  {admin && (
                    <p className="text-[11px] text-muted-foreground">
                      {note.source === "full_refund"
                        ? t("fullRefund")
                        : note.reason && `${t("reason")}: ${note.reason}`}
                      {note.refund && ` · ${t(`refundVia.${note.refund.via}`)}`}
                      {note.restocked && ` · ${t("restocked")}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {url ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewing(note)}
                        className="rounded-xl text-xs h-8 gap-1.5"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        {t("view")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isDownloading}
                        onClick={() =>
                          downloadFile(url, {
                            fileName: `${note.displayNumber ?? "credit-note"}.pdf`,
                          })
                        }
                        className="rounded-xl text-xs h-8 gap-1.5"
                      >
                        <DownloadIcon className="w-3.5 h-3.5" />
                        {t("download")}
                      </Button>
                    </>
                  ) : note.state === "issued" ? (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {note.status === "failed"
                          ? t("pdfFailed")
                          : t("pdfPending")}
                      </span>
                      {admin && note.status === "failed" && (
                        <Can permission={Permissions.REFUND_ORDER}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isRegenerating}
                            onClick={() =>
                              regenerate(
                                { id: order._id, noteId: note._id },
                                {
                                  onSuccess: () =>
                                    toast.success(t("regenerated")),
                                },
                              )
                            }
                            className="rounded-xl text-xs h-8 gap-1.5"
                          >
                            <RefreshCwIcon className="w-3.5 h-3.5" />
                            {t("regenerate")}
                          </Button>
                        </Can>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {viewingUrl && (
        <Modal
          isOpen={!!viewing}
          onClose={() => setViewing(null)}
          title={viewing?.displayNumber}
          size="xl"
        >
          <iframe
            src={`${viewingUrl}#toolbar=0&navpanes=0`}
            className="w-full h-[75vh] border-none"
            title={viewing?.displayNumber ?? t("title")}
          />
        </Modal>
      )}
    </>
  );
}
