"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useCurrencyStore, type CurrencyOverride } from "@/store/currency-store";
import { CheckIcon, CoinsIcon } from "@/shared/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Floating button (mid-left of the viewport) letting the shopper override
 * the storefront's automatic language-based currency display.
 */
export default function CurrencyToggleButton() {
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
    <div
      ref={containerRef}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t("label")}
        aria-expanded={isOpen}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-background border border-border/60 shadow-lg text-primary hover:scale-105 active:scale-95 transition-transform"
      >
        <CoinsIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 min-w-50 rounded-2xl border border-border/60 bg-background shadow-xl overflow-hidden py-1">
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
