"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useCurrencyStore, type CurrencyOverride } from "@/store/currency-store";
import { CheckIcon, CoinsIcon } from "@/shared/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Compact admin-topbar control for previewing prices in the store's base
 * currency vs. USD — reuses the same `useCurrencyStore` override that drives
 * the storefront's `useFormatCurrency`/`Price`, so an admin can check exactly
 * what a shopper would see without needing to also switch the dashboard's
 * own UI language.
 */
export default function CurrencyPreviewToggle() {
  const t = useTranslations("common.currencyToggle");
  const settings = useSettings();
  const override = useCurrencyStore((state) => state.override);
  const setOverride = useCurrencyStore((state) => state.setOverride);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const options: { value: CurrencyOverride; label: string }[] = [
    { value: null, label: t("automatic") },
    { value: "base", label: `${t("base")} (${settings.currencyCode})` },
    { value: "usd", label: t("usd") },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t("label")}
        aria-expanded={isOpen}
        className="p-2 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors text-foreground hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <CoinsIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 min-w-50 rounded-2xl border border-border/60 bg-background shadow-xl overflow-hidden py-1 z-50">
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                setOverride(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-start hover:bg-muted/60 transition-colors",
                override === option.value && "text-primary font-medium",
              )}
            >
              {option.label}
              {override === option.value && <CheckIcon className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
