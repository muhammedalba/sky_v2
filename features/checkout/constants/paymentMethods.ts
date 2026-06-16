export interface ActivePaymentMethod {
  _id: string;        // same as code — sent to backend as paymentMethodId
  code: string;       // "stripe" | "paypal" | "banktransfer" | "cod"
  name: string;       // localized name
  description: string; // localized description
  type: string;
  feeType: 'fixed' | 'percentage';
  fixedFee: number;
  percentageFee: number;
  fees?: number;
}
