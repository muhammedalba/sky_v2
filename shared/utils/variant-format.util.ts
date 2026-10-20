import type { VariantComponent } from "@/features/products/types";

/**
 * Formats individual attribute value into human-readable string.
 * Supports:
 * - primitives (string, number, boolean)
 * - objects with `{ value, unit }` (e.g. `{ value: 100, unit: "ml" }` -> "100 ml")
 * - localized objects (e.g. `{ ar: "أحمر", en: "Red" }`)
 * - fallback JSON stringification
 */
export function formatAttributeValue(val: unknown, isAr: boolean): string {
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
    return (isAr ? obj.ar || obj.en : obj.en || obj.ar) as string;
  }

  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/**
 * Formats kit components into a single string, e.g. "A 10.5 kg + B 3.5 kg".
 */
export function formatVariantComponents(
  components: VariantComponent[] | null | undefined,
): string {
  if (!components?.length) return "";
  return components
    .map((c) => [c.name, c.value, c.unit].filter((p) => p !== "" && p != null).join(" "))
    .join(" + ");
}

/**
 * Formats the entire attributes object into a single text string with localized labels.
 * Useful for tooltips, logs, exports, or plain-text representations.
 */
export function formatVariantAttributesText(
  attributes: Record<string, unknown> | null | undefined,
  isAr: boolean,
  getLabel: (key: string) => string,
  separator = ", ",
  components?: VariantComponent[] | null,
): string {
  const parts =
    attributes && typeof attributes === "object"
      ? Object.entries(attributes).map(([k, v]) => {
          const formatted = formatAttributeValue(v, isAr);
          return formatted ? `${getLabel(k)}: ${formatted}` : "";
        })
      : [];

  const componentsStr = formatVariantComponents(components);
  if (componentsStr) parts.push(`${getLabel("components_kit")}: ${componentsStr}`);

  return parts.filter(Boolean).join(separator);
}
