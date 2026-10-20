export const WEIGHT_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
] as const;

export const VOLUME_UNITS = [
  { value: 'ltr', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'gal', label: 'gal' },
] as const;
export const THICKNESS_UNITS = [
  { value: 'mm', label: 'mm' },
  { value: 'cm', label: 'cm' },
] as const;
export const LENGTH_UNITS = [
  { value: 'm', label: 'm' },
  { value: 'cm', label: 'cm' },
  { value: 'mm', label: 'mm' },
] as const;
export const DENSITY_UNITS = [{ value: 'kg/m3', label: 'kg/m³' }] as const;
export const SIZE_UNITS = [{ value: 'inch', label: 'inch' }] as const;
export const GSM_UNITS = [{ value: 'gsm', label: 'g/m²' }] as const;

interface AttributeDefinition {
  type: 'string' | 'number';
  units: readonly { value: string; label: string }[];
  label: { ar: string; en: string };
}

// Single source of truth for variant attributes: the dashboard picker,
// units and display labels all derive from here.
// Keep in sync with ALLOWED_ATTRIBUTE_NAMES on the server.
export const ATTRIBUTE_CONFIG = {
  weight: { type: 'number', units: WEIGHT_UNITS, label: { ar: 'الوزن', en: 'Weight' } },
  volume: { type: 'number', units: VOLUME_UNITS, label: { ar: 'الحجم', en: 'Volume' } },
  thickness: { type: 'number', units: THICKNESS_UNITS, label: { ar: 'السماكة', en: 'Thickness' } },
  length: { type: 'number', units: LENGTH_UNITS, label: { ar: 'الطول', en: 'Length' } },
  diameter: { type: 'number', units: THICKNESS_UNITS, label: { ar: 'القطر', en: 'Diameter' } },
  density: { type: 'number', units: DENSITY_UNITS, label: { ar: 'الكثافة', en: 'Density' } },
  size: { type: 'number', units: SIZE_UNITS, label: { ar: 'المقاس', en: 'Size' } },
  gsm: { type: 'number', units: GSM_UNITS, label: { ar: 'وزن المتر المربع', en: 'GSM' } },
  color: { type: 'string', units: [], label: { ar: 'اللون', en: 'Color' } },
  type: { type: 'string', units: [], label: { ar: 'النوع', en: 'Type' } },
  packaging_type: { type: 'string', units: [], label: { ar: 'نوع التعبئة', en: 'Packaging Type' } },
  dimensions: { type: 'string', units: [], label: { ar: 'الأبعاد', en: 'Dimensions' } },
  components_kit: { type: 'string', units: [], label: { ar: 'مكونات الطقم', en: 'Components Kit' } },
} as const satisfies Record<string, AttributeDefinition>;

export const ADVANCED_FILTER_KEYS = [
  'skuSearch', 'color', 'category', 'brand', 'SubCategories',
  'pricerange[min]', 'pricerange[max]', 'weight_min', 'weight_max',
  'weight_unit', 'volume_min', 'volume_max', 'volume_unit', 'sold_min', 'sold_max'
] as const;

export interface ColorSwatch {
  value: string;
  swatchClass: string;
  light?: boolean;
}

export const COLOR_SWATCHES: readonly ColorSwatch[] = [
  { value: 'Black', swatchClass: 'bg-black' },
  { value: 'Blue', swatchClass: 'bg-blue-600' },
  { value: 'Grey', swatchClass: 'bg-gray-200', light: true },
  { value: 'Red', swatchClass: 'bg-red-500' },
  { value: 'Green', swatchClass: 'bg-emerald-700' },
  { value: 'Yellow', swatchClass: 'bg-yellow-300', light: true },
] as const;


// 2. Automatically extract names (no need to enter them manually)
export const ATTRIBUTE_NAME_OPTIONS = Object.keys(ATTRIBUTE_CONFIG) as (keyof typeof ATTRIBUTE_CONFIG)[];
export type AllowedAttributeName = keyof typeof ATTRIBUTE_CONFIG;
export type WeightUnit = (typeof WEIGHT_UNITS)[number]['value'];
export type VolumeUnit = (typeof VOLUME_UNITS)[number]['value'];

export const getAttributeLabel = (key: string, isAr: boolean) => {
  const normKey = key.trim().toLowerCase();
  const entry = ATTRIBUTE_CONFIG[normKey as AllowedAttributeName];
  if (entry) return isAr ? entry.label.ar : entry.label.en;
  return isAr ? key : key.charAt(0).toUpperCase() + key.slice(1);
};
