"use client";

import React from "react";
import { Link } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /** عناصر المسار التي تلي زر الرئيسية */
  items: BreadcrumbItem[];
  /** إظهار زر الرئيسية تلقائياً (الافتراضي: true) */
  showHome?: boolean;
  /** مسار رابط الرئيسية (الافتراضي: "/") */
  homeHref?: string;
  /** نص مخصص للرئيسية (اختياري، يتم جلبه تلقائياً بحسب لغة الواجهة) */
  homeLabel?: string;
  /** فاصل مخصص بين العناصر (الافتراضي: "/") */
  separator?: React.ReactNode;
  /** فئات CSS إضافية للحاوية */
  className?: string;
}

export function Breadcrumb({
  items,
  showHome = true,
  homeHref = "/",
  homeLabel,
  separator = <span className="text-muted-foreground/50 select-none shrink-0">/</span>,
  className,
}: BreadcrumbProps) {
  const locale = useLocale();
  const t = useTranslations("store.nav");

  const resolvedHomeLabel =
    homeLabel || t("home") || (locale === "ar" ? "الرئيسية" : "Home");

  const allItems: BreadcrumbItem[] = [
    ...(showHome ? [{ label: resolvedHomeLabel, href: homeHref }] : []),
    ...items,
  ];

  if (allItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap no-scrollbar",
        className
      )}
    >
      <ol className="flex items-center gap-2 m-0 p-0 list-none">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors capitalize "
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "transition-colors",
                    isLast
                      ? "text-foreground font-medium truncate max-w-50 sm:max-w-100 md:max-w-none"
                      : "hover:text-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label.split('-').join(' ').slice(0, 15) + '...'}

                </span>
              )}

              {!isLast && separator}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
