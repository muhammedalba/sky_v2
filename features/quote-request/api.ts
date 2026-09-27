import { apiClient } from "@/lib/api/client";
import { env } from "@/lib/env";
import { recaptchaHeaders } from "@/lib/recaptcha";
import { ApiResponse } from "@/types";

const ENDPOINTS = env.ENDPOINTS.QUOTE_REQUESTS;

export type CustomerType = "individual" | "company";
export type PreferredContactMethod = "phone" | "email";

export interface QuoteRequestPayload {
  customerType: CustomerType;
  name: string;
  phone: string;
  emails: string[];
  preferredContactMethod: PreferredContactMethod;
  orderDetails: string;
  deliveryAddress: string;
  commercialRegistrationNumber?: string;
  taxNumber?: string;
  nationalAddress?: string;
}

export const quoteRequestApi = {
  send: async (data: QuoteRequestPayload) =>
    apiClient.post(
      ENDPOINTS.BASE,
      data,
      await recaptchaHeaders("quote_request"),
    ) as unknown as Promise<
      ApiResponse<{ status: string; message: string }>
    >,
};
