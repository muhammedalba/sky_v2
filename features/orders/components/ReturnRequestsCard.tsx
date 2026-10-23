"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AxiosError } from "axios";
import {
  Order,
  ReturnRequest,
  ReturnRequestStatus,
} from "@/features/orders/types";
import {
  useCancelReturnRequest,
  useRejectReturnRequest,
} from "@/features/orders/hooks/useOrders";
import OrderReturnDialog from "@/features/orders/components/OrderReturnDialog";
import CustomerReturnDialog from "@/features/orders/components/CustomerReturnDialog";
import { resolveOrderItem } from "@/features/orders/utils/orderItemUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Textarea } from "@/shared/ui/Textarea";
import Modal from "@/shared/ui/Modal";
import { useToast } from "@/shared/hooks/useToast";
import { useTrans } from "@/shared/hooks/useTrans";
import { formatDate } from "@/lib/utils";
import { Can } from "@/components/auth/Can";
import { Permissions } from "@/features/roles/types";

interface ReturnRequestsCardProps {
  order: Order;
  /** Dashboard: approve or reject; else the customer's view. */
  admin?: boolean;
}

export const RETURN_STATUS_STYLES: Record<ReturnRequestStatus, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

/** The error message the server sent, else a fallback. */
const serverMessage = (error: unknown, fallback: string) => {
  const message = (error as AxiosError<{ message?: unknown }>).response?.data
    ?.message;
  return typeof message === "string" ? message : fallback;
};

/**
 * The order's return requests. The customer can ask for a return while the
 * return window is open (the setting returnWindowDays, after delivery) and withdraw a
 * pending one; the dashboard approves (which issues the credit note and
 * refunds) or rejects them. Renders nothing when there is nothing to show.
 */
export default function ReturnRequestsCard({
  order,
  admin,
}: ReturnRequestsCardProps) {
  const t = useTranslations("orders.returnRequests");
  const locale = useLocale();
  const toast = useToast();
  const getTrans = useTrans();
  const { mutate: cancel, isPending: isCancelling } = useCancelReturnRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectReturnRequest();

  const [asking, setAsking] = useState(false);
  const [approving, setApproving] = useState<ReturnRequest | null>(null);
  const [rejecting, setRejecting] = useState<ReturnRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const requests = order.returnRequests ?? [];
  const policy = order.returnPolicy;
  const hasPending = requests.some((r) => r.status === "pending");
  const anythingLeft = (policy?.remaining ?? []).some((n) => n > 0);
  const canAsk = !admin && !!policy?.open && anythingLeft && !hasPending;
  // The customer sees the window once the order is delivered
  const windowNote =
    !admin && policy?.endsAt
      ? policy.open
        ? t("windowEnds", { date: formatDate(policy.endsAt, locale) })
        : t("windowClosed", { days: policy.windowDays })
      : null;

  if (requests.length === 0 && !canAsk && !windowNote) return null;

  const closeReject = () => {
    if (isRejecting) return;
    setRejecting(null);
    setRejectionReason("");
  };

  const confirmReject = () => {
    if (!rejecting) return;
    reject(
      {
        id: order._id,
        requestId: rejecting._id,
        reason: rejectionReason.trim(),
      },
      {
        onSuccess: () => {
          toast.success(t("rejected"));
          setRejecting(null);
          setRejectionReason("");
        },
        onError: (error) => toast.error(serverMessage(error, t("error"))),
      },
    );
  };

  return (
    <>
      <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/20 bg-muted/70 flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-sm font-bold title-gradient">
            {t("statusTitle")}
          </CardTitle>
          {canAsk && (
            <Button
              size="sm"
              className="rounded-xl text-xs h-8"
              onClick={() => setAsking(true)}
            >
              {t("button")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/30">
          {windowNote && (
            <p className="p-4 text-xs text-muted-foreground">{windowNote}</p>
          )}
          {requests.map((request) => (
            <div key={request._id} className="space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${RETURN_STATUS_STYLES[request.status]}`}
                  >
                    {t(`status.${request.status}`)}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {t(`reasonTypes.${request.reasonType}`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(request.createdAt, locale)}
                  </span>
                </div>

                {request.status === "pending" &&
                  (admin ? (
                    <Can permission={Permissions.REFUND_ORDER}>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="rounded-xl text-xs h-8"
                          onClick={() => setApproving(request)}
                        >
                          {t("approve")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs h-8"
                          onClick={() => setRejecting(request)}
                        >
                          {t("reject")}
                        </Button>
                      </div>
                    </Can>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs h-8"
                      disabled={isCancelling}
                      onClick={() =>
                        cancel(
                          { id: order._id, requestId: request._id },
                          {
                            onSuccess: () => toast.success(t("withdrawn")),
                            onError: (error) =>
                              toast.error(serverMessage(error, t("error"))),
                          },
                        )
                      }
                    >
                      {t("withdraw")}
                    </Button>
                  ))}
              </div>

              <ul className="text-xs text-muted-foreground space-y-0.5">
                {request.lines.map((line) => {
                  const item = order.items[line.itemIndex];
                  return (
                    <li key={line.itemIndex}>
                      {item ? getTrans(resolveOrderItem(item).title) : "-"} ×{" "}
                      <span className="tabular-nums">{line.quantity}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="whitespace-pre-line text-xs text-foreground">
                {request.note}
              </p>
              {request.status === "rejected" && request.rejectionReason && (
                <p className="text-xs text-destructive">
                  {t("rejectionReason")}: {request.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {!admin && (
        <CustomerReturnDialog
          order={order}
          isOpen={asking}
          onClose={() => setAsking(false)}
        />
      )}

      {admin && (
        <OrderReturnDialog
          key={approving?._id ?? "none"}
          order={order}
          isOpen={!!approving}
          onClose={() => setApproving(null)}
          request={approving ?? undefined}
        />
      )}

      {admin && (
        <Modal
          isOpen={!!rejecting}
          onClose={closeReject}
          title={t("rejectTitle")}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={closeReject}
                disabled={isRejecting}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReject}
                disabled={isRejecting || rejectionReason.trim() === ""}
              >
                {t("reject")}
              </Button>
            </div>
          }
        >
          <Textarea
            label={t("rejectReasonLabel")}
            value={rejectionReason}
            maxLength={500}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={isRejecting}
          />
        </Modal>
      )}
    </>
  );
}
