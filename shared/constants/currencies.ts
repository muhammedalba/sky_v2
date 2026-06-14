export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'SAR', symbol: 'ر.س', label: 'Saudi Riyal (ر.س)' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham (د.إ)' },
  { code: 'KWD', symbol: 'د.ك', label: 'Kuwaiti Dinar (د.ك)' },
  { code: 'QAR', symbol: 'ر.ق', label: 'Qatari Rial (ر.ق)' },
  { code: 'BHD', symbol: '.د.ب', label: 'Bahraini Dinar (.د.ب)' },
  { code: 'OMR', symbol: 'ر.ع.', label: 'Omani Rial (ر.ع.)' },
  { code: 'EGP', symbol: 'ج.م', label: 'Egyptian Pound (ج.م)' },
  { code: 'JOD', symbol: 'د.أ', label: 'Jordanian Dinar (د.أ)' },
  { code: 'IQD', symbol: 'ع.د', label: 'Iraqi Dinar (ع.د)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'TRY', symbol: '₺', label: 'Turkish Lira (₺)' },
  { code: 'MAD', symbol: 'د.م.', label: 'Moroccan Dirham (د.م.)' },
  { code: 'DZD', symbol: 'د.ج', label: 'Algerian Dinar (د.ج)' },
  { code: 'TND', symbol: 'د.ت', label: 'Tunisian Dinar (د.ت)' },
  { code: 'LYD', symbol: 'ل.د', label: 'Libyan Dinar (ل.د)' },
  { code: 'YER', symbol: 'ر.ي', label: 'Yemeni Rial (ر.ي)' },
  { code: 'LBP', symbol: 'ل.ل', label: 'Lebanese Pound (ل.ل)' },
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
