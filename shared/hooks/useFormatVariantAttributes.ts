"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { formatVariantAttributesText } from "@/shared/ui/VariantAttributes";

/**
 * hook to format variant attributes as text in the active language
 *
 * Use `formatVariantAttributesText` directly outside components or when
 * the text must be in a fixed language regardless of the UI.
 */
export function useFormatVariantAttributes() {
  const isAr = useLocale() === "ar";

  return useCallback(
    (attributes?: Record<string, unknown> | null, separator?: string) =>
      formatVariantAttributesText(attributes, isAr, separator),
    [isAr],
  );
}
