import { PackageType } from "@/types";

export const WEIGHT_UNITS = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "lb", label: "lb" },
  { value: "oz", label: "oz" },
] as const;
// Labels live in messages/product/*.json under "packageTypes" (dashboard)
// and "units" (storefront).
export const PACKAGE_TYPE_OPTIONS: readonly PackageType[] = [
  "box",
  "bag",
  "drum",
  "gallon",
  "board",
  "roll",
  "piece",
  "pallet",
  "envelope",
  "custom",
];
export const VOLUME_UNITS = [
  { value: "ltr", label: "L" },
  { value: "ml", label: "ml" },
  { value: "gal", label: "gal" },
] as const;
export const THICKNESS_UNITS = [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
] as const;
export const LENGTH_UNITS = [
  { value: "m", label: "m" },
  { value: "cm", label: "cm" },
  { value: "mm", label: "mm" },
] as const;
export const DENSITY_UNITS = [{ value: "kg/m3", label: "kg/m³" }] as const;
export const SIZE_UNITS = [{ value: "inch", label: "inch" }] as const;
export const GSM_UNITS = [{ value: "gsm", label: "g/m²" }] as const;

interface AttributeDefinition {
  type: "string" | "number";
  units: readonly { value: string; label: string }[];
}

// Single source of truth for variant attributes: the dashboard picker
// and units derive from here. Display labels live in
// messages/product/*.json under "attributes" (see useAttributeLabel).
// Keep in sync with ALLOWED_ATTRIBUTE_NAMES on the server.
export const ATTRIBUTE_CONFIG = {
  weight: { type: "number", units: WEIGHT_UNITS },
  volume: { type: "number", units: VOLUME_UNITS },
  thickness: { type: "number", units: THICKNESS_UNITS },
  length: { type: "number", units: LENGTH_UNITS },
  diameter: { type: "number", units: THICKNESS_UNITS },
  density: { type: "number", units: DENSITY_UNITS },
  size: { type: "number", units: SIZE_UNITS },
  gsm: { type: "number", units: GSM_UNITS },
  color: { type: "string", units: [] },
  type: { type: "string", units: [] },
  packaging_type: { type: "string", units: [] },
  dimensions: { type: "string", units: [] },
  components_kit: { type: "string", units: [] },
} as const satisfies Record<string, AttributeDefinition>;

export const ADVANCED_FILTER_KEYS = [
  "skuSearch",
  "color",
  "category",
  "brand",
  "SubCategories",
  "pricerange[min]",
  "pricerange[max]",
  "weight_min",
  "weight_max",
  "weight_unit",
  "volume_min",
  "volume_max",
  "volume_unit",
  "sold_min",
  "sold_max",
] as const;

export interface ColorSwatch {
  value: string;
  swatchClass: string;
  light?: boolean;
}

export const COLOR_SWATCHES: readonly ColorSwatch[] = [
  { value: "Black", swatchClass: "bg-black" },
  { value: "Blue", swatchClass: "bg-blue-600" },
  { value: "Grey", swatchClass: "bg-gray-200", light: true },
  { value: "Red", swatchClass: "bg-red-500" },
  { value: "Green", swatchClass: "bg-emerald-700" },
  { value: "Yellow", swatchClass: "bg-yellow-300", light: true },
] as const;

// 2. Automatically extract names (no need to enter them manually)
export const ATTRIBUTE_NAME_OPTIONS = Object.keys(
  ATTRIBUTE_CONFIG,
) as (keyof typeof ATTRIBUTE_CONFIG)[];
export type AllowedAttributeName = keyof typeof ATTRIBUTE_CONFIG;
export type WeightUnit = (typeof WEIGHT_UNITS)[number]["value"];
export type VolumeUnit = (typeof VOLUME_UNITS)[number]["value"];

export const isAllowedAttributeName = (
  key: string,
): key is AllowedAttributeName => Object.hasOwn(ATTRIBUTE_CONFIG, key);
