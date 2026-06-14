import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function usePaymentRedirector() {
  const router = useRouter();
  const locale = useLocale();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirect = (resData: any) => {
    const orderId = resData?.orderId ;
    const methodCode = resData?.methodCode;

    if ((methodCode === "paypal" || methodCode === "moyasar") && resData?.approvalUrl) {
      window.location.href = resData.approvalUrl;
    } else if (methodCode === "stripe" && resData?.client_secret) {
      router.push(`/${locale}/checkout/payment?orderId=${orderId}&client_secret=${resData.client_secret}`);
    } else {
      if (orderId) {
        router.push(`/${locale}/account/orders/${orderId}`);
      } else {
        router.push(`/${locale}/account/orders`);
      }
    }
  };

  return { redirect };
}
