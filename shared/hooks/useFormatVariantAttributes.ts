"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { formatVariantAttributesText } from "@/shared/utils/variant-format.util";
import type { VariantComponent } from "@/features/products/types";
import { useAttributeLabel } from "./useAttributeLabel";

/**
 * hook to format variant attributes as text in the active language
 *
 * Use `formatVariantAttributesText` directly outside components or when
 * the text must be in a fixed language regardless of the UI.
 */
export function useFormatVariantAttributes() {
  const isAr = useLocale() === "ar";
  const getLabel = useAttributeLabel();

  return useCallback(
    (
      attributes?: Record<string, unknown> | null,
      separator?: string,
      components?: VariantComponent[] | null,
    ) =>
      formatVariantAttributesText(
        attributes,
        isAr,
        getLabel,
        separator,
        components,
      ),
    [isAr, getLabel],
  );
}
