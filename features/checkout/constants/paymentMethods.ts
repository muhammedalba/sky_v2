export interface PaymentMethodPublicConfig {
  publishableKey?: string;
}

export interface ActivePaymentMethod {
  _id: string;        // same as code — sent to backend as paymentMethodId
  code: string;       // "stripe" | "paypal" | "banktransfer" | "cod"
  name: string;       // localized name
  description: string; // localized description
  provider: string;
  type: string;
  feeType: 'fixed' | 'percentage';
  fixedFee: number;
  percentageFee: number;
  fees?: number;
  /** Whitelisted public config fields safe to expose to the browser. Never contains secretKey. */
  publicConfig?: PaymentMethodPublicConfig;
}
