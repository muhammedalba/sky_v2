"use client";

import { useLocale } from "next-intl";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useCurrencyStore } from "@/store/currency-store";
import { getCurrencyParts, type CurrencyParts } from "@/lib/currency";

/**
 * Resolves the locale to format with, honoring a manual currency-toggle
 * override over the active UI language. Shared by `useFormatCurrency` and
 * `useCurrencyParts` so both stay in sync with the same override logic.
 */
export function useEffectiveCurrencyLocale(): string {
  const locale = useLocale();
  const override = useCurrencyStore((state) => state.override);
  return override === "usd" ? "en" : override === "base" ? "ar" : locale;
}

/**
 * Structured currency parts (number, symbol, symbol position) for an amount
 * in the store's base currency — override-aware, used by `<Price>` to render
 * the number and symbol as separate, independently styled elements.
 */
export function useCurrencyParts(
  amount: number = 0,
  showDecimals: boolean | "auto" = "auto",
): CurrencyParts {
  const settings = useSettings();
  const effectiveLocale = useEffectiveCurrencyLocale();

  return getCurrencyParts(
    amount,
    effectiveLocale,
    settings.exchangeRate,
    settings.currencyCode,
    showDecimals,
  );
}
