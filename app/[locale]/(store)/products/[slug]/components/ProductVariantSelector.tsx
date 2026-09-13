"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon, ChevronDownIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export interface AttributeOption {
  value: string;
  unit?: string;
  isAvailable: boolean;
}

export interface AttributeGroup {
  name: string;
  label: string;
  options: AttributeOption[];
}

export interface ProductVariantSelectorProps {
  attributeGroups: AttributeGroup[];
  activeAttributes: Record<string, string>;
  onSelectAttribute: (name: string, value: string) => void;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  unitText: string;
  isUnlimitedStock?: boolean;
  currentStock: number;
}

export default function ProductVariantSelector({
  attributeGroups,
  activeAttributes,
  onSelectAttribute,
  quantity,
  onQuantityChange,
  unitText,
  isUnlimitedStock,
  currentStock,
}: ProductVariantSelectorProps) {
  const t = useTranslations("product");

  return (
    <div className="lg:col-span-8 sm:p-6 space-y-6">
      <div className="flex justify-between flex-col h-full">
        {/* Step 1: Attribute Specifications */}
        {attributeGroups.length > 0 && (
          <div className="space-y-5">
            <h3 className="flex items-center gap-2 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center shrink-0">
                1
              </span>
              {t("order.chooseSpecs")}
            </h3>
            <div className="space-y-4 ps-7">
              {attributeGroups.map((group) => (
                <div key={group.name} className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </p>
                  <ScrollReveal
                    className="flex flex-wrap gap-2"
                    animation="fade"
                  >
                    {group.options.map((opt, i) => {
                      const isSelected =
                        activeAttributes[group.name] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={!opt.isAvailable}
                          onClick={() =>
                            onSelectAttribute(group.name, opt.value)
                          }
                          className={cn(
                            "h-9 px-4 rounded-sm text-xs font-semibold border transition-all cursor-pointer",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 text-foreground/80 hover:border-primary/40",
                            !opt.isAvailable &&
                              "opacity-40 cursor-not-allowed line-through",
                          )}
                        >
                          <ScrollReveal
                            animation="fade"
                            delay={i * 300}
                            duration={i * 400}
                          >
                            {opt.value}
                            {opt.unit ? ` ${opt.unit}` : ""}
                          </ScrollReveal>
                        </button>
                      );
                    })}
                  </ScrollReveal>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Quantity Selection */}
        <ScrollReveal
          animation="fade"
          delay={attributeGroups.length > 0 ? 100 : 0}
          duration={attributeGroups.length > 0 ? 500 : 0}
          className={cn(
            "space-y-3",
            attributeGroups.length > 0 && "pt-4 border-t border-border/40",
          )}
        >
          <h3 className="flex items-center gap-2 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center shrink-0">
              {attributeGroups.length > 0 ? 2 : 1}
            </span>
            {t("order.quantity")}
          </h3>
          <div className="flex items-center gap-3 ps-7">
            <div className="flex items-center border border-border/60 rounded-lg h-10 bg-accent/30">
              <button
                type="button"
                onClick={() => onQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-9 h-full flex items-center justify-center bg-background/50 hover:bg-muted rounded-s-lg transition-colors disabled:opacity-30 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="w-3.5 h-3.5" />
              </button>
              <div className="w-10 h-full flex items-center justify-center font-bold text-sm tabular-nums bg-background">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => onQuantityChange(1)}
                disabled={!isUnlimitedStock && quantity >= currentStock}
                className="w-9 h-full flex items-center justify-center bg-background/50 hover:bg-muted rounded-e-lg transition-colors disabled:opacity-30 cursor-pointer"
                aria-label="Increase quantity"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-border/60 bg-background text-xs font-semibold text-foreground/80">
              {unitText}
              <ChevronDownIcon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
