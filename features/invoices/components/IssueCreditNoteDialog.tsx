"use client";

import { useOrder } from "@/features/orders/hooks/useOrders";
import OrderReturnDialog from "@/features/orders/components/OrderReturnDialog";

interface IssueCreditNoteDialogProps {
  /** The invoice's order; null closes the dialog. */
  orderId: string | null;
  onClose: () => void;
}

/**
 * Issues a credit note from the invoices page: loads the invoice's order,
 * then opens the order page's own return dialog (lines, reason, refund).
 */
export default function IssueCreditNoteDialog({
  orderId,
  onClose,
}: IssueCreditNoteDialogProps) {
  const { data: order } = useOrder(orderId ?? "");
  if (!orderId || !order) return null;
  return <OrderReturnDialog order={order} isOpen onClose={onClose} />;
}
