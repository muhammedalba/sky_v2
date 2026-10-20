import React from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useAttributeLabel } from "@/shared/hooks/useAttributeLabel";
import type { VariantComponent } from "@/features/products/types";
import {
  formatAttributeValue,
  formatVariantComponents,
} from "@/shared/utils/variant-format.util";
import { ScrollReveal } from "./ScrollReveal";

export interface VariantAttributesProps {
  attributes?: Record<string, unknown> | null;
  /** Kit components (A+B products), rendered as one extra badge. */
  components?: VariantComponent[] | null;
  className?: string;
  badgeClassName?: string;
  /** Overrides the default label, which is localized to the current locale. */
  getLabel?: (key: string) => string;
}

/**
 * Shared component to render product/order variant attributes as badges.
 */
export function VariantAttributes({
  attributes,
  components,
  className,
  badgeClassName,
  getLabel,
}: VariantAttributesProps) {
  const isAr = useLocale() === "ar";
  const defaultGetLabel = useAttributeLabel();
  const resolveLabel = getLabel ?? defaultGetLabel;

  const entries: [string, string][] = [];
  if (attributes && typeof attributes === "object") {
    for (const [key, val] of Object.entries(attributes)) {
      const valStr = formatAttributeValue(val, isAr);
      if (valStr) entries.push([key, valStr]);
    }
  }
  const componentsStr = formatVariantComponents(components);
  if (componentsStr) entries.push(["components_kit", componentsStr]);

  if (entries.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {entries.map(([key, valStr], index) => (
        <ScrollReveal animation="fade" delay={index * 50}
          key={`${key}-${index}`}
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-secondary/80 text-secondary-foreground border border-border/30 capitalize whitespace-nowrap",
            badgeClassName
          )}
        >
          {resolveLabel(key)}: {valStr}
        </ScrollReveal>
      ))}
    </div>
  );
}

export default VariantAttributes;
