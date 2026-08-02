import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function usePaymentRedirector() {
  const router = useRouter();
  const locale = useLocale();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirect = (resData: any) => {
    const orderId = resData?.orderId ;
    const methodCode = resData?.methodCode;

    if (methodCode === "moyasar") {
      sessionStorage.setItem("moyasar_order_id", orderId);
      router.push(`/${locale}/checkout/moyasar`);
    } else if (methodCode === "paypal" && resData?.approvalUrl) {
      window.location.href = resData.approvalUrl;
    } else if (methodCode === "stripe" && resData?.client_secret) {
      router.push(`/${locale}/checkout/payment?orderId=${orderId}&client_secret=${resData.client_secret}`);
    } else {
      if (orderId) {
        router.push(`/`);
        // router.push(`/${locale}/account/orders/${orderId}`);
      } else {
        router.push(`/${locale}/account`);
      }
    }
  };

  return { redirect };
}
