export interface PaymentMethodRow {
  _id: string;
  name: { ar: string; en: string } | string;
  code: string;
  type?: "card" | "wallet" | "bank_transfer" | "cash_on_delivery" | "bnpl";
  feeType: 'fixed' | 'percentage';
  fixedFee?: number;
  percentageFee?: number;
  isActive: boolean;
  provider: string;
  description: { ar: string; en: string } | string;
  config: object;
  isDefault: boolean;
  requiresOnlineConfirmation: boolean;
  passFeesToCustomer: boolean;
  displayOrder: number;
  supportedCurrencies: string[];
  supportedCountries: string[];
  requiresAdditionalInfo: boolean;
  icon: string;
}
