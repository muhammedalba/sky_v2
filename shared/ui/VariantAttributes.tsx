import React from "react";
import { cn } from "@/lib/utils";

/**
 * Formats individual attribute value into human-readable string.
 * Supports:
 * - primitives (string, number, boolean)
 * - objects with `{ value, unit }` (e.g. `{ value: 100, unit: "ml" }` -> "100 ml")
 * - localized objects (e.g. `{ ar: "أحمر", en: "Red" }`)
 * - fallback JSON stringification
 */
export function formatAttributeValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val !== "object") return String(val);

  const obj = val as Record<string, unknown>;
  const parts: string[] = [];

  if (obj.value !== undefined && obj.value !== null && obj.value !== "") {
    parts.push(String(obj.value));
  }
  if (obj.unit !== undefined && obj.unit !== null && obj.unit !== "") {
    parts.push(String(obj.unit));
  }

  if (parts.length > 0) {
    return parts.join(" ");
  }

  // Handle localized objects e.g. { ar: "أحمر", en: "Red" }
  if (typeof obj.ar === "string" || typeof obj.en === "string") {
    return (obj.ar || obj.en) as string;
  }

  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/**
 * Formats the entire attributes object into a single comma-separated text string.
 * Useful for tooltips, logs, exports, or plain-text representations.
 */
export function formatVariantAttributesText(
  attributes?: Record<string, unknown> | null
): string {
  if (!attributes || typeof attributes !== "object") return "";

  return Object.entries(attributes)
    .map(([k, v]) => {
      const formatted = formatAttributeValue(v);
      return formatted ? `${k}: ${formatted}` : "";
    })
    .filter(Boolean)
    .join(", ");
}

export interface VariantAttributesProps {
  attributes?: Record<string, unknown> | null;
  className?: string;
  badgeClassName?: string;
}

/**
 * Shared component to render product/order variant attributes as badges.
 */
export function VariantAttributes({
  attributes,
  className,
  badgeClassName,
}: VariantAttributesProps) {
  if (
    !attributes ||
    typeof attributes !== "object" ||
    Object.keys(attributes).length === 0
  ) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {Object.entries(attributes).map(([key, val]) => {
        const valStr = formatAttributeValue(val);
        if (!valStr) return null;

        return (
          <span
            key={key}
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-secondary/80 text-secondary-foreground border border-border/30 capitalize whitespace-nowrap",
              badgeClassName
            )}
          >
            {key}: {valStr}
          </span>
        );
      })}
    </div>
  );
}

export default VariantAttributes;
