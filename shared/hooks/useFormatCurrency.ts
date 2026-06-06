"use client";

import { useSettings } from "@/app/providers/SettingsProvider";
import { useLocale } from "next-intl";
import { formatCurrency } from "@/lib/utils";

/**
 * hook to format currency using settings
 */
export function useFormatCurrency() {
  const settings = useSettings();
  const locale = useLocale();

  /**
   * format currency using settings
   * @param amount
   * @returns
   */
  return (amount: number = 0): string => {
    return formatCurrency(
      amount,
      locale,
      settings.exchangeRate,
      settings.currencyCode,
    );
  };
}
