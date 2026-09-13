"use client";

import React, { useMemo } from "react";
import { useLocale } from "next-intl";
import { useSettings } from "@/app/providers/SettingsProvider";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ScrollReveal";

export interface PriceProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "prefix"> {
  /** القيمة المالية بالعملة الأساسية (الريال) */
  amount: number | string | null | undefined;
  /** كود العملة المخصص (افتراضياً SAR في العربية، USD في الإنجليزية) */
  currencyCode?: string;
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
}

/**
 * مكون السعر الاحترافي (Price Component)
 * يفصل الرقم عن رمز العملة تلقائياً ليظهر الرقم كبيراً وبارزاً بينما تظهر العملة بحجم أصغر وأنيق.
 */
export function Price({
  amount,
  currencyCode,
  showDecimals = true,
  className,
  numberClassName,
  currencyClassName,
  prefix,
  suffix,
  ...props
}: PriceProps) {
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");
  const settings = useSettings();

  // 1. معالجة المبلغ وتحويل العملة عند الحاجة
  const finalAmount = useMemo(() => {
    const num = Number(amount) || 0;
    if (!isArabic && settings?.exchangeRate && settings.exchangeRate > 0) {
      return num / settings.exchangeRate;
    }
    return num;
  }, [amount, isArabic, settings?.exchangeRate]);

  // 2. حساب وتنسيق الكسور
  const formattedNumber = useMemo(() => {
    const isInteger = Number.isInteger(finalAmount);
    let minDigits = 0;
    if (showDecimals === true) {
      minDigits = 2;
    } else if (showDecimals === false) {
      minDigits = 0;
    } else {
      // auto: إذا كان رقماً صحيحاً 0، وإذا كان به كسور 2
      minDigits = isInteger ? 0 : 2;
    }

    return new Intl.NumberFormat(isArabic ? "ar-SA-u-nu-latn" : "en-US", {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: 2,
    }).format(finalAmount);
  }, [finalAmount, isArabic, showDecimals]);

  // 3. تحديد رمز العملة الأنيق
  const symbol = useMemo(() => {
    if (isArabic) {
      const code = currencyCode || settings?.currencyCode || "SAR";
      return code === "SAR" ? "ر.س" : code;
    }
    return currencyCode || "USD";
  }, [isArabic, currencyCode, settings?.currencyCode]);

  return (
    <ScrollReveal animation="slide-up"
      className={cn("inline-flex items-baseline gap-1 font-bold", className)}
      {...props}
    >
      {prefix && (
        <span className="font-normal text-muted-foreground text-[0.85em] me-0.5">
          {prefix}
        </span>
      )}
      <span className={cn("tracking-tight", numberClassName)}>
        {formattedNumber}
      </span>
      <span
        className={cn(
          "text-[0.65em] font-semibold text-muted-foreground leading-none select-none",
          currencyClassName
        )}
      >
        {symbol}
      </span>
      {suffix && (
        <span className="font-normal text-muted-foreground text-[0.85em] ms-0.5">
          {suffix}
        </span>
      )}
    </ScrollReveal>
  );
}

export default Price;
