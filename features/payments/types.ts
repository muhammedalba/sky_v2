export interface PaymentMethodRow {
  _id: string;
  name: string;
  code: string;
  type?: "card" | "wallet" | "bank_transfer" | "cash_on_delivery" | "bnpl";
  fixedFee?: number;
  percentageFee?: number;
  isActive: boolean;
  [key: string]: unknown;
  provider: string;
  description: string;
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
