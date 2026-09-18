import { CURRENCIES } from "@/shared/constants/currencies";
import { env } from "./env";

export interface CurrencyParts {
  formattedNumber: string;
  symbol: string;
  symbolPosition: "before" | "after";
  /** The currency code actually displayed (e.g. "USD" once converted, not the store's base code). */
  currencyCode: string;
}

function resolveCurrency(code: string): { symbol: string; symbolPosition: "before" | "after" } {
  const match = CURRENCIES.find((c) => c.code === code);
  return match
    ? { symbol: match.symbol, symbolPosition: match.symbolPosition }
    : { symbol: code, symbolPosition: "after" };
}

/**
 * Single source of truth for converting a base-currency amount and resolving
 * the currency symbol/label to display, for a given locale.
 *
 * - Arabic locale: shows the store's base currency as-is.
 * - Other locales: converts to a USD-equivalent by dividing by `exchangeRate`
 *   (when the caller has spoofed the locale via a manual override, this is
 *   how `useFormatCurrency`/`useCurrencyParts` implement that override).
 */
export function getCurrencyParts(
  amountInBaseCurrency: number,
  locale: string = env.DEFAULT_LOCALE ?? "ar",
  exchangeRate?: number,
  currencyCode?: string,
  showDecimals: boolean | "auto" = "auto",
): CurrencyParts {
  const isArabic = locale.startsWith("ar");
  const isConverted = !isArabic && !!exchangeRate && exchangeRate > 0;

  let finalAmount = Number(amountInBaseCurrency) || 0;
  if (isConverted) {
    finalAmount = finalAmount / (exchangeRate as number);
  }

  const isInteger = Number.isInteger(finalAmount);
  let minDigits = 0;
  if (showDecimals === true) {
    minDigits = 2;
  } else if (showDecimals === false) {
    minDigits = 0;
  } else {
    minDigits = isInteger ? 0 : 2;
  }

  const formattedNumber = new Intl.NumberFormat(isArabic ? "ar-SA-u-nu-latn" : "en-US", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: 2,
  }).format(finalAmount);

  const displayedCode = isConverted ? "USD" : currencyCode || "SAR";
  const { symbol, symbolPosition } = resolveCurrency(displayedCode);

  return { formattedNumber, symbol, symbolPosition, currencyCode: displayedCode };
}

/**
 * Formats a monetary amount into a localized currency string.
 * Built on {@link getCurrencyParts}, kept for the ~24 call sites that just
 * want a plain string (e.g. `formatCurrency(product.price)`).
 *
 * @returns e.g. "37.50 ر.س" or "$10.00".
 */
export function formatCurrency(
  amountInBaseCurrency: number,
  locale?: string,
  exchangeRate?: number,
  currencyCode?: string,
): string {
  const { formattedNumber, symbol, symbolPosition } = getCurrencyParts(
    amountInBaseCurrency,
    locale,
    exchangeRate,
    currencyCode,
  );
  return symbolPosition === "before" ? `${symbol}${formattedNumber}` : `${formattedNumber} ${symbol}`;
}
