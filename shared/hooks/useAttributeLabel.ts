"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { isAllowedAttributeName } from "@/shared/constants/product-constants";

/**
 * hook returning a function that localizes a variant attribute name
 * (e.g. "weight" -> "الوزن") using messages/product/*.json "attributes".
 * Unknown (custom) attribute names are shown as-is, capitalized.
 */
export function useAttributeLabel() {
  const t = useTranslations("product.attributes");

  return useCallback(
    (key: string) => {
      const normKey = key.trim().toLowerCase();
      if (isAllowedAttributeName(normKey)) return t(normKey);
      return key.charAt(0).toUpperCase() + key.slice(1);
    },
    [t],
  );
}
