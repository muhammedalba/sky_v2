import type { ProductAttributeValue } from '@/features/products/types';
import { AttributeDefinition } from '../AttributeBuilder';

export type VariantAttributeValue = string | ProductAttributeValue;
export type VariantAttributeCombo = Record<string, VariantAttributeValue>;

/**
 * Generates all combinations (cartesian product) of attribute values.
 * Supports string attributes (e.g. color) and number attributes (e.g. weight with unit).
 *
 * @example
 *  Example 1: String attributes
 * cartesian([
 *   { name: "color", type: "string", allowedValues: ["Red", "Blue"] },
 *   { name: "size", type: "string", allowedValues: ["S", "M"] }
 * ]);
 *  Result:
 *  [
 *    { color: "Red", size: "S" },
 *    { color: "Red", size: "M" },
 *    { color: "Blue", size: "S" },
 *    { color: "Blue", size: "M" }
 *  ]
 *
 * @example
 *  Example 2: Number attributes
 * cartesian([
 *   { name: "weight", type: "number", allowedValues: [10, 20], allowedUnits: ["kg"] },
 *   { name: "color", type: "string", allowedValues: ["Black", "White"] }
 * ]);
 *  Result:
 *  [
 *    { weight: { value: 10, unit: "kg" }, color: "Black" },
 *    { weight: { value: 10, unit: "kg" }, color: "White" },
 *    { weight: { value: 20, unit: "kg" }, color: "Black" },
 *    { weight: { value: 20, unit: "kg" }, color: "White" }
 *  ]
 */
export function cartesian(attrs: AttributeDefinition[]): VariantAttributeCombo[] {
  const validAttrs = attrs.filter(
    (a) =>
      a.name &&
      ((a.type === 'string' && a.allowedValues && a.allowedValues.length > 0) ||
        (a.type === 'number' &&
          a.allowedValues &&
          a.allowedValues.length > 0 &&
          a.allowedUnits &&
          a.allowedUnits.length > 0)),
  );

  if (validAttrs.length === 0) return [];

  return validAttrs.reduce<VariantAttributeCombo[]>((acc, attr) => {
    let options: VariantAttributeValue[] = [];

    if (attr.type === 'string') {
      options = attr.allowedValues || [];
    } else if (attr.type === 'number') {
      const values = attr.allowedValues || [];
      const units = attr.allowedUnits || [];
      options = values.map((v, i) => ({ value: Number(v), unit: units[i] ?? units[0] }));
    }

    if (acc.length === 0) {
      return options.map((opt) => ({ [attr.name]: opt }));
    }
    return acc.flatMap((combo) => options.map((opt) => ({ ...combo, [attr.name]: opt })));
  }, []);
}

/**
 * Generates a stable string key for a variant combo.
 * Useful for preventing duplicate variants, caching, or indexing.
 * Supports object values like { value, unit }.
 *
 * @example
 * getVariantKey({ color: "Red", size: "M" });
 *  "color:Red|size:M"
 *
 * @example
 * getVariantKey({ weight: { value: 20, unit: "kg" }, color: "Black" });
 * "color:Black|weight:20(kg)"
 */
export const getVariantKey = (attrs: Record<string, unknown> = {}): string =>
  Object.entries(attrs || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, val]) => {
      if (typeof val === 'object' && val !== null && 'value' in val) {
        const attrVal = val as { value: unknown; unit?: unknown };
        const unitStr = attrVal.unit ? `(${String(attrVal.unit)})` : '';
        return `${k}:${String(attrVal.value)}${unitStr}`;
      }
      return `${k}:${String(val)}`;
    })
    .join('|');
