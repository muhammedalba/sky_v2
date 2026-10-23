import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { ApiResponse, Order } from '@/types';
import { createCrudApi } from '@/shared/api/factory';
import {
  CreditNoteLineInput,
  CreditNotePreview,
  CreditNoteSummary,
  ReturnReasonType,
  ReturnRequest,
  ReturnRequestListItem,
  ReturnRequestPreview,
  ReturnRequestStatus,
} from '@/features/orders/types';

const ENDPOINTS = env.ENDPOINTS.ORDERS;
const baseCrud = createCrudApi<Order>(ENDPOINTS.BASE);

export const ordersApi = {
  ...baseCrud,
  getMyOrders: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<Order[]>>(ENDPOINTS.MY_ORDERS, {
      params,
    }) as unknown as Promise<ApiResponse<Order[]>>,
  getMyOrder: (id: string) =>
    apiClient.get<ApiResponse<Order>>(
      `${ENDPOINTS.MY_ORDERS}/${id}`,
    ) as unknown as Promise<ApiResponse<Order>>,
  updateStatus: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<Order>>(`${ENDPOINTS.BASE}/${id}`, data),
  updateOrderDetails: (id: string, data: FormData) =>
    apiClient.patch<ApiResponse<Order>>(`${ENDPOINTS.BASE}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get(ENDPOINTS.STATS, { params }),
  applyCoupon: (data: { items: Record<string, unknown>[]; couponCode: string }) =>
    apiClient.post(ENDPOINTS.COUPON, data),
  /** What can still be returned (REFUND_ORDER). */
  creditNoteSummary: (id: string) =>
    apiClient.get(
      `${ENDPOINTS.BASE}/${id}/credit-notes/summary`,
    ) as unknown as Promise<ApiResponse<CreditNoteSummary>>,
  /** A return's amounts and VAT from the server; nothing is saved. */
  previewCreditNote: (
    id: string,
    lines: CreditNoteLineInput[],
    reasonType: ReturnReasonType,
  ) =>
    apiClient.post(`${ENDPOINTS.BASE}/${id}/credit-notes/preview`, {
      lines,
      reasonType,
    }) as unknown as Promise<ApiResponse<CreditNotePreview>>,
  /** Returns items: refund, tax credit note, restock, customer email. */
  createCreditNote: (
    id: string,
    data: {
      lines: CreditNoteLineInput[];
      reason: string;
      reasonType: ReturnReasonType;
      restock: boolean;
    },
  ) =>
    apiClient.post(`${ENDPOINTS.BASE}/${id}/credit-notes`, data) as unknown as Promise<
      ApiResponse<{ displayNumber: string }>
    >,
  /** Retries an invoice that could not be issued, same number (UPDATE_ORDER_STATUS). */
  regenerateInvoice: (id: string) =>
    apiClient.post(`${ENDPOINTS.BASE}/${id}/invoice/regenerate`),
  /** Retries a credit note PDF that could not be rendered (REFUND_ORDER). */
  regenerateCreditNote: (id: string, noteId: string) =>
    apiClient.post(`${ENDPOINTS.BASE}/${id}/credit-notes/${noteId}/regenerate`),
  /** Customer: what a return would give back; nothing is saved. */
  previewMyReturn: (
    id: string,
    data: { lines: CreditNoteLineInput[]; reasonType: ReturnReasonType },
  ) =>
    apiClient.post(
      `${ENDPOINTS.MY_ORDERS}/${id}/return-requests/preview`,
      data,
    ) as unknown as Promise<ApiResponse<ReturnRequestPreview>>,
  /** Customer: asks for a return (within the return window). */
  createReturnRequest: (
    id: string,
    data: {
      lines: CreditNoteLineInput[];
      reasonType: ReturnReasonType;
      note: string;
    },
  ) =>
    apiClient.post(
      `${ENDPOINTS.MY_ORDERS}/${id}/return-requests`,
      data,
    ) as unknown as Promise<ApiResponse<ReturnRequest>>,
  /** Customer: withdraws a pending request. */
  cancelReturnRequest: (id: string, requestId: string) =>
    apiClient.delete(
      `${ENDPOINTS.MY_ORDERS}/${id}/return-requests/${requestId}`,
    ),
  /** Dashboard: every order's return requests (REFUND_ORDER). */
  getReturnRequests: (params?: {
    status?: ReturnRequestStatus;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get(`${ENDPOINTS.BASE}/return-requests`, {
      params,
    }) as unknown as Promise<ApiResponse<ReturnRequestListItem[]>>,
  /** Dashboard: approves a request (refund, credit note, restock, email). */
  approveReturnRequest: (
    id: string,
    requestId: string,
    data: { lines?: CreditNoteLineInput[]; restock?: boolean },
  ) =>
    apiClient.post(
      `${ENDPOINTS.BASE}/${id}/return-requests/${requestId}/approve`,
      data,
    ) as unknown as Promise<ApiResponse<{ displayNumber: string }>>,
  /** Dashboard: rejects a request; the customer is emailed the reason. */
  rejectReturnRequest: (id: string, requestId: string, reason: string) =>
    apiClient.post(
      `${ENDPOINTS.BASE}/${id}/return-requests/${requestId}/reject`,
      { reason },
    ),
  createBankTransfer: (data: FormData) =>
    apiClient.post(ENDPOINTS.BANK_TRANSFER, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
