import { apiClient } from "@/lib/api/client";
import { env } from "@/lib/env";
import { ApiResponse } from "@/types";
import {
  CreditNoteListItem,
  CreditNoteQuery,
  InvoiceListItem,
  InvoiceQuery,
  InvoiceStats,
} from "./types";

const BASE = env.ENDPOINTS.INVOICES.BASE;

/**
 * Read only: an issued invoice or credit note is never edited or deleted
 * (a credit note corrects an invoice). Retrying a failed PDF and issuing a
 * credit note use the order routes (ordersApi).
 */
export const invoicesApi = {
  getInvoices: (params?: InvoiceQuery) =>
    apiClient.get(BASE, { params }) as unknown as Promise<
      ApiResponse<InvoiceListItem[]>
    >,

  getCreditNotes: (params?: CreditNoteQuery) =>
    apiClient.get(`${BASE}/credit-notes`, { params }) as unknown as Promise<
      ApiResponse<CreditNoteListItem[]>
    >,

  getStats: (params?: { from?: string; to?: string }) =>
    apiClient.get(`${BASE}/stats`, { params }) as unknown as Promise<
      ApiResponse<InvoiceStats>
    >,

  /** The list as CSV (UTF-8 with BOM), as a Blob to save. */
  exportCsv: async (
    type: "invoices" | "credit-notes",
    params?: InvoiceQuery & CreditNoteQuery,
  ): Promise<Blob> => {
    const response = (await apiClient.get(`${BASE}/export`, {
      params: { ...params, type, page: undefined, limit: undefined },
      responseType: "blob",
    })) as unknown as { data: Blob };
    return response.data;
  },

  resendInvoice: (orderId: string) =>
    apiClient.post(`${BASE}/${orderId}/resend`),

  resendCreditNote: (noteId: string) =>
    apiClient.post(`${BASE}/credit-notes/${noteId}/resend`),
};
