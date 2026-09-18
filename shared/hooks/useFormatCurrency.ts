"use client";

import { useSettings } from "@/app/providers/SettingsProvider";
import { formatCurrency } from "@/lib/currency";
import { useEffectiveCurrencyLocale } from "./useCurrencyParts";

/**
 * hook to format currency using settings
 *
 * Currency normally follows the active language (Arabic -> base currency,
 * other locales -> USD). A manual override from the currency toggle button
 * takes precedence over that language-based default.
 */
export function useFormatCurrency() {
  const settings = useSettings();
  const effectiveLocale = useEffectiveCurrencyLocale();

  /**
   * format currency using settings
   * @param amount
   * @returns
   */
  return (amount: number = 0): string => {
    return formatCurrency(
      amount,
      effectiveLocale,
      settings.exchangeRate,
      settings.currencyCode,
    );
  };
}
