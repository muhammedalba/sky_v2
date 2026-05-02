import { AttributeDefinition } from '../AttributeBuilder';

/**
 * Generates all combinations (cartesian product) of attribute values.
 * Supports string attributes (e.g. color) and number attributes (e.g. weight with unit).
 */
export function cartesian(attrs: AttributeDefinition[]): Record<string, any>[] {
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

  return validAttrs.reduce<Record<string, any>[]>((acc, attr) => {
    let options: any[] = [];

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
 
/** Generates a stable string key for a variant combo (supports object values like {value, unit}). */
export const getVariantKey = (attrs: Record<string, any> = {}): string =>
  Object.entries(attrs || {})
    .sort()
    .map(([k, val]) => {
      if (typeof val === 'object' && val !== null && 'value' in val && 'unit' in val) {
        return `${k}:${val.value}(${val.unit})`;
      }
      return `${k}:${val}`; 
    })
    .join('|');
