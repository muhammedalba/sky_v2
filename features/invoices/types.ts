import { FileAsset } from "@/shared/types/file-asset";
import { ReturnReasonType } from "@/features/orders/types";

/** Search, issue-date range and paging (both lists and the export). */
export interface DocumentQuery {
  /** Number, customer name, order number, customer email or phone. */
  search?: string;
  /** ISO date-times, inclusive. */
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceQuery extends DocumentQuery {
  /** `generated`: issued; `failed`: not issued (to retry). */
  status?: "generated" | "failed";
}

export interface CreditNoteQuery extends DocumentQuery {
  reasonType?: ReturnReasonType;
  state?: "issued" | "awaiting_refund";
}

/** An invoice row of the dashboard list. */
export interface InvoiceListItem {
  _id: string;
  displayNumber: string;
  invoiceNumber?: number;
  issuedAt: string;
  order: string;
  status: "pending" | "generating" | "generated" | "failed";
  file?: FileAsset;
  lastError?: string;
  /** What the mail server did with the customer email. */
  customerEmail?: string;
  customer?: { name?: string; vatNo?: string };
  amounts?: { taxableSubtotal?: number; tax?: number; grandTotal?: number };
  /** Its issued credit notes. */
  credited: { count: number; total: number };
}

/** A credit note row of the dashboard list. */
export interface CreditNoteListItem {
  _id: string;
  displayNumber?: string;
  issuedAt?: string;
  order: string;
  state: "awaiting_refund" | "issued";
  status?: "pending" | "generating" | "generated" | "failed";
  file?: FileAsset;
  reason?: string;
  /** Absent on credit notes from before the return policy (defect). */
  reasonType?: ReturnReasonType;
  source?: "admin" | "full_refund";
  amounts: { taxable: number; tax: number; total: number };
  deductions?: {
    returnShipping?: { amount: number; tax: number; total: number };
  };
  refund?: {
    via: "moyasar" | "manual" | "already_refunded" | "none";
    amount: number;
  };
  customerEmail?: string;
  invoice?: { _id: string; displayNumber: string; issuedAt?: string };
  customer?: { name?: string; vatNo?: string };
}

interface Totals {
  count: number;
  total: number;
  tax: number;
}

/** The period's totals. */
export interface InvoiceStats {
  invoices: Totals;
  creditNotes: Totals;
  /** Invoices less credit notes. */
  net: { total: number; tax: number };
  /** Not issued, to retry. */
  failed: { invoices: number; creditNotes: number };
}
