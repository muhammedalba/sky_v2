"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { invoicesApi } from "@/features/invoices/api";
import { CreditNoteQuery, InvoiceQuery } from "@/features/invoices/types";
import { ordersApi } from "@/features/orders/api";

export const invoiceKeys = {
  all: ["invoices"] as const,
  invoices: (params: InvoiceQuery) => ["invoices", "list", params] as const,
  creditNotes: (params: CreditNoteQuery) =>
    ["invoices", "credit-notes", params] as const,
  stats: (params: { from?: string; to?: string }) =>
    ["invoices", "stats", params] as const,
};

/** The invoices list (VIEW_INVOICES). */
export function useInvoices(params: InvoiceQuery, enabled = true) {
  return useQuery({
    queryKey: invoiceKeys.invoices(params),
    queryFn: () => invoicesApi.getInvoices(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** The credit notes list (VIEW_INVOICES). */
export function useCreditNotesList(params: CreditNoteQuery, enabled = true) {
  return useQuery({
    queryKey: invoiceKeys.creditNotes(params),
    queryFn: () => invoicesApi.getCreditNotes(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** The period's totals for the stats cards. */
export function useInvoiceStats(params: { from?: string; to?: string }) {
  return useQuery({
    queryKey: invoiceKeys.stats(params),
    queryFn: async () => (await invoicesApi.getStats(params)).data,
    placeholderData: keepPreviousData,
  });
}

/** Emails an issued invoice (by its order) or credit note again. */
export function useResendDocument() {
  return useMutation({
    mutationFn: ({
      kind,
      id,
    }: {
      kind: "invoice" | "credit-note";
      id: string;
    }) =>
      kind === "invoice"
        ? invoicesApi.resendInvoice(id)
        : invoicesApi.resendCreditNote(id),
  });
}

/**
 * Retries a failed PDF (the order routes); the lists, stats and the order
 * are refreshed.
 */
export function useRegenerateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, noteId }: { orderId: string; noteId?: string }) =>
      noteId
        ? ordersApi.regenerateCreditNote(orderId, noteId)
        : ordersApi.regenerateInvoice(orderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.orderId],
      });
    },
  });
}
