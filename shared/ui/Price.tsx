"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useCurrencyParts } from "@/shared/hooks/useCurrencyParts";
import { ScrollReveal } from "./ScrollReveal";

export interface PriceProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "prefix"> {
  /** القيمة المالية بالعملة الأساسية (الريال) */
  amount: number | string | null | undefined;
  /** التحكم في إظهار الكسور: auto (تلقائي إن وُجدت كسور)، true (دائماً خانتان)، false (بدون كسور) */
  showDecimals?: boolean | "auto";
  /** فئات مخصصة للرقم فقط */
  numberClassName?: string;
  /** فئات مخصصة لرمز العملة فقط */
  currencyClassName?: string;
  /** نص أو عنصر يسبق السعر (مثل: "ابتداءً من ") */
  prefix?: React.ReactNode;
  /** نص أو عنصر يلي السعر (مثل: "/ شهرياً") */
  suffix?: React.ReactNode;
  /** تعطيل حركة الظهور (ScrollReveal) — مفيد داخل قوائم كثيفة (سلة، ملخص الطلب) */
  animate?: boolean;
}

/**
 * مكون السعر الاحترافي (Price Component)
 * يفصل الرقم عن رمز العملة تلقائياً ليظهر الرقم كبيراً وبارزاً بينما تظهر العملة بحجم أصغر وأنيق.
 * يعتمد على useCurrencyParts، نفس مصدر البيانات المستخدم في useFormatCurrency، فيستجيب
 * تلقائياً لزر تبديل العملة اليدوي (CurrencyToggleButton) بالإضافة للغة الواجهة.
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
        "text-[0.65em] font-semibold text-muted-foreground leading-none select-none",
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
