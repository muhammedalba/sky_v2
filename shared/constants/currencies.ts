export type CurrencySymbolPosition = 'before' | 'after';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)', symbolPosition: 'before' as CurrencySymbolPosition },
  { code: 'SAR', symbol: 'ر.س', label: 'Saudi Riyal (ر.س)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham (د.إ)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'KWD', symbol: 'د.ك', label: 'Kuwaiti Dinar (د.ك)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'QAR', symbol: 'ر.ق', label: 'Qatari Rial (ر.ق)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'BHD', symbol: '.د.ب', label: 'Bahraini Dinar (.د.ب)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'OMR', symbol: 'ر.ع.', label: 'Omani Rial (ر.ع.)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'EGP', symbol: 'ج.م', label: 'Egyptian Pound (ج.م)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'JOD', symbol: 'د.أ', label: 'Jordanian Dinar (د.أ)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'IQD', symbol: 'ع.د', label: 'Iraqi Dinar (ع.د)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'EUR', symbol: '€', label: 'Euro (€)', symbolPosition: 'before' as CurrencySymbolPosition },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)', symbolPosition: 'before' as CurrencySymbolPosition },
  { code: 'TRY', symbol: '₺', label: 'Turkish Lira (₺)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'MAD', symbol: 'د.م.', label: 'Moroccan Dirham (د.م.)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'DZD', symbol: 'د.ج', label: 'Algerian Dinar (د.ج)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'TND', symbol: 'د.ت', label: 'Tunisian Dinar (د.ت)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'LYD', symbol: 'ل.د', label: 'Libyan Dinar (ل.د)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'YER', symbol: 'ر.ي', label: 'Yemeni Rial (ر.ي)', symbolPosition: 'after' as CurrencySymbolPosition },
  { code: 'LBP', symbol: 'ل.ل', label: 'Lebanese Pound (ل.ل)', symbolPosition: 'after' as CurrencySymbolPosition },
];

export const CURRENCY_SELECT_OPTIONS = CURRENCIES.map((c) => ({
  value: c.code,
  label: c.label,
  symbol: c.symbol,
}));

export const CURRENCY_SEARCH_OPTIONS = CURRENCIES.map((c) => ({
  _id: c.code,
  name: c.label,
}));
