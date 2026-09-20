import { apiClient } from "@/lib/api/client";
import { env } from "@/lib/env";
import { ApiResponse } from "@/types";

const ENDPOINTS = env.ENDPOINTS.CONTACT;

export type ContactInquiryType = "general" | "product" | "service_quote" | "complaint";

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  inquiryType: ContactInquiryType;
  message: string;
}

export const contactApi = {
  send: (data: ContactPayload) =>
    apiClient.post(ENDPOINTS.BASE, data) as unknown as Promise<
      ApiResponse<{ status: string; message: string }>
    >,
};
