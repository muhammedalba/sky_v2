export interface ActivePaymentMethod {
  _id: string;        // same as code — sent to backend as paymentMethodId
  code: string;       // "stripe" | "paypal" | "banktransfer" | "cod"
  name: string;       // English display name
  nameAr: string;     // Arabic display name
  description: string;
  descriptionAr: string;
  type: "electronic" | "offline";
  fees: number;
  color: string;      // Tailwind bg color class for the card accent
  badge?: string;     // optional badge text
}

export const ALL_METHODS: ActivePaymentMethod[] = [
  {
    _id: "stripe",
    code: "stripe",
    name: "Credit / Debit Card",
    nameAr: "الدفع الالكتروني",
    description: "select this option for international payment using visa or master card",
    descriptionAr:"اختر هذا الخيار للدفع الدولي باستخدام الفيزا او الماستر كارد",
    type: "electronic",
    fees: 0,
    color: "from-indigo-500/10 to-violet-500/10",
    badge: "Stripe",
  },
  {
    _id: "moyasar",
    code: "moyasar",
    name: "Credit Card / Apple Pay (Moyasar)",
    nameAr: "البطاقة الائتمانية / أبل باي (ميسر)",
    description: "select this option for payment in GCC countries using Mada, Visa, MasterCard, or Apple Pay",
    descriptionAr: "اختر هذا الخيار للدفع في دول الخليج باستخدام مدى او الفيزا او الماستر كارد او ابل باي",
    type: "electronic",
    fees: 0,
    color: "from-teal-500/10 to-emerald-500/10",
    badge: "Moyasar",
  },
  {
    _id: "paypal",
    code: "paypal",
    name: "PayPal",
    nameAr: "PayPal",
    description: "Pay with your PayPal account",
    descriptionAr: "ادفع عبر حسابك في PayPal",
    type: "electronic",
    fees: 0,
    color: "from-blue-500/10 to-sky-500/10",
    badge: "PayPal",
  },
  {
    _id: "banktransfer",
    code: "banktransfer",
    name: "Bank Transfer",
    nameAr: "تحويل بنكي",
    description: "Transfer to our account and upload the receipt",
    descriptionAr: "حوّل المبلغ لحسابنا البنكي وأرفق إيصال التحويل",
    type: "offline",
    fees: 0,
    color: "from-amber-500/10 to-orange-500/10",
  },
  {
    _id: "cod",
    code: "cod",
    name: "Cash on Delivery",
    nameAr: "الدفع عند الاستلام",
    description: "Pay with cash when your order arrives",
    descriptionAr: "ادفع نقداً عند استلام طلبك",
    type: "offline",
    fees: 0,
    color: "from-green-500/10 to-emerald-500/10",
  },
];
