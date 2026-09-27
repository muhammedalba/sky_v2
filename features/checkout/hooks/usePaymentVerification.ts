import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function usePaymentVerification(invoiceId: string | null) {
  return useQuery({
    queryKey: ["payment-verification", invoiceId],
    queryFn: async () => {
      if (!invoiceId) throw new Error("No invoice ID found");
      const res = await apiClient.get(`/payments/verify/${invoiceId}`);
      return res.data;
    },
    enabled: !!invoiceId,
    // Add staleTime to prevent unnecessary fetches if component re-renders
    staleTime: 1000 * 60,
    refetchInterval: (query) => {
      // Poll every 3 seconds only while the payment is still in progress.
      // Any other status is final for this page (paid, failed, expired,
      // refunded, cancelled…), including ones added later.
      const data = query.state?.data;
      if (!data) return 3000;

      const status = data?.paymentStatus;
      const orderStatus = data?.orderStatus;
      if ((status !== "INITIATED" && status !== "PENDING") || orderStatus === "expired") {
        return false;
      }
      return 3000;
    },
    retry: 3, // Retry a few times if network fails
  });
}
