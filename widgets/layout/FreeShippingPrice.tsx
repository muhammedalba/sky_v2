"use client";

import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";

/**
 * The one genuinely client-dependent piece of StoreFooter: currency
 * formatting honors a manual toggle override (useCurrencyStore) that can
 * change live without a page reload, so it can't be resolved server-side.
 */
export default function FreeShippingPrice({ amount }: { amount: number }) {
  const formatCurrency = useFormatCurrency();
  return <>{formatCurrency(amount)}</>;
}
