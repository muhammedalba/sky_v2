
import {
  BanknoteIcon as Banknote,
  WalletIcon as Wallet,
  PayPalIcon,
  VisaIcon,
  MastercardIcon,
  CreditCardIcon,
} from "@/shared/ui/Icons";

/**
 * دالة جلب الأيقونة المناسبة بناءً على كود طريقة الدفع
 * @param {string} code - كود بوابة الدفع
 * @returns {JSX.Element} - المكون البصري للأيقونة
 */
export function getPaymentIcon(code: string) {
  switch (code) {
    case "stripe":
      return (
        <div className="flex gap-2 items-center">
          <MastercardIcon className="h-5 w-auto border-e pe-2 border-primary/50" />
          <VisaIcon className="h-5 w-auto" />
        </div>
      );
    case "paypal":
      return <PayPalIcon className="h-5 w-auto" />;
    case "moyasar":
      return (
        <div className="flex gap-2 items-center">
          <MastercardIcon className="h-5 w-auto border-e pe-2 border-primary/50" />
          <VisaIcon className="h-5 w-auto" />
        </div>
      );
    case "visa":
      return <VisaIcon className="h-5 w-auto" />;
    case "mastercard":
      return <MastercardIcon className="h-5 w-auto" />;
    case "creditcard":
    case "card":
      return <CreditCardIcon className="h-5 w-auto" />;
    case "banktransfer":
      return <Banknote className="w-5 h-5 text-amber-600" />;
    case "cod":
      return <Wallet className="w-5 h-5 text-green-600" />;
    default:
      return <Banknote className="w-5 h-5 text-primary" />;
  }
}

/**
 * دالة جلب تنسيقات شارة (Badge) طريقة الدفع
 * @param {string} code - كود بوابة الدفع
 * @returns {string} - أصناف Tailwind CSS
 */
export function getGatewayBadgeStyle(code: string) {
  switch (code) {
    case "stripe":
      return " text-primary bg-primary/10";
    case "paypal":
      return "text-primary bg-primary/10";
    case "moyasar":
      return "text-primary bg-primary/10";
    case "visa":
      return "text-primary bg-primary/10";
    case "mastercard":
      return "text-primary bg-primary/10";
    case "banktransfer":
      return "text-primary bg-primary/10";
    case "cod":
      return "text-primary bg-primary/10";
    default:
      return "bg-muted text-muted-foreground";
  }
}
