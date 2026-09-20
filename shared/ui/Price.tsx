"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useCurrencyParts } from "@/shared/hooks/useCurrencyParts";
import { ScrollReveal } from "./ScrollReveal";

export interface PriceProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "prefix"> {
/** Monetary value in the base currency (store's currency) */
  amount: number | string | null | undefined;
/** Control fraction display: auto (automatic if fractions exist), true (always two decimal places), false (no fractions) */  
showDecimals?: boolean | "auto";

/** Custom classes for the number only */
  numberClassName?: string;
  /** Custom classes for the currency symbol only */
  currencyClassName?: string;
  /** Text or element before the price (e.g., "Starting from ") */
  prefix?: React.ReactNode;
  /** Text or element following the price (e.g., "/ month") */
  suffix?: React.ReactNode;
/** Disable ScrollReveal animations — useful within dense lists (cart, order summary) */  animate?: boolean;
}

/**
* Professional Price Component
* Automatically separates the numeric value from the currency symbol, displaying the number prominently and in a larger size,
* while the currency appears smaller and elegantly styled. 
* It relies on `useCurrencyParts`—the same data source used by `useFormatCurrency`—so it automatically
* responds to the manual currency toggle (CurrencyToggleButton) as well as the interface language. 
*/
export function Price({
  amount,
  showDecimals = true,
  className,
  numberClassName,
  currencyClassName,
  prefix,
  suffix,
  animate = true,
  ...props
}: PriceProps) {
  // Get the formatted number and currency symbol from useCurrencyPart
  const { formattedNumber, symbol, symbolPosition } = useCurrencyParts(
    Number(amount) || 0,
    showDecimals,
  );

  const numberSpan = (
    <span className={cn("tracking-tight", numberClassName)}>
      {formattedNumber}
    </span>
  );
  const symbolSpan = (
    <span
      className={cn(
        "text-[1.3em] font-semibold text-muted-foreground leading-none select-none",
        currencyClassName
      )}
    >
      {symbol}
    </span>
  );

  const content = (
    <>
      {prefix && (
        <span className="font-normal text-muted-foreground text-[0.85em] me-0.5">
          {prefix}
        </span>
      )}
      {symbolPosition === "before" ? symbolSpan : numberSpan}
      {symbolPosition === "before" ? numberSpan : symbolSpan}
      {suffix && (
        <span className="font-normal text-muted-foreground text-[0.85em] ms-0.5">
          {suffix}
        </span>
      )}
    </>
  );

  const wrapperClassName = cn(
    "inline-flex items-baseline gap-1 font-bold",
    className,
  );

  if (!animate) {
    return (
      <span className={wrapperClassName} {...props}>
        {content}
      </span>
    );
  }

  return (
    <ScrollReveal animation="slide-up" className={wrapperClassName} {...props}>
      {content}
    </ScrollReveal>
  );
}

export default Price;
