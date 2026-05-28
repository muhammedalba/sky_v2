export const WEIGHT_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
] as const;

export const VOLUME_UNITS = [
  { value: 'l', label: 'L' },
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

export const ATTRIBUTE_CONFIG = {
  weight: { type: 'number', units: WEIGHT_UNITS },
  volume: { type: 'number', units: VOLUME_UNITS },
  thickness: { type: 'number', units: THICKNESS_UNITS },
  length: { type: 'number', units: LENGTH_UNITS },
  color: { type: 'string', units: [] },
  packaging_type: { type: 'string', units: [] },
  dimensions: { type: 'string', units: [] },
  components_kit: { type: 'string', units: [] },
} as const;

export const ADVANCED_FILTER_KEYS = [
  'skuSearch', 'color', 'category', 'brand', 'SubCategories',
  'pricerange[min]', 'pricerange[max]', 'weight_min', 'weight_max',
  'weight_unit', 'volume_min', 'volume_max', 'volume_unit', 'sold_min', 'sold_max'
] as const;

// استخراج نوع (Type) للأسماء المسموحة لزيادة الحماية (اختياري ولكن مفيد)

// VariantComponent enum
// export enum MeasurementUnit {
//   KG = 'kg',
//   LTR = 'ltr',
//   ML = 'ml',
//   MM = 'mm',
//   CM = 'cm',
//   M = 'm',
//   PCS = 'pcs',
//   BAG = 'bag',
//   ROLL = 'roll',
// }
// 2. استخراج الأسماء تلقائياً (لا داعي لتكرارها يدوياً)
export const ATTRIBUTE_NAME_OPTIONS = Object.keys(ATTRIBUTE_CONFIG) as (keyof typeof ATTRIBUTE_CONFIG)[];
export type AllowedAttributeName = keyof typeof ATTRIBUTE_CONFIG;
export type WeightUnit = (typeof WEIGHT_UNITS)[number]['value'];
export type VolumeUnit = (typeof VOLUME_UNITS)[number]['value'];

export const attributeTranslations: Record<string, { ar: string; en: string }> = {
  weight: { ar: "الوزن", en: "Weight" },
  الوزن: { ar: "الوزن", en: "Weight" },
  
  volume: { ar: "الحجم", en: "Volume" },
  الحجم: { ar: "الحجم", en: "Volume" },
  السعة: { ar: "الحجم", en: "Volume" },

  thickness: { ar: "السمك", en: "Thickness" },
  السمك: { ar: "السمك", en: "Thickness" },

  length: { ar: "الطول", en: "Length" },
  الطول: { ar: "الطول", en: "Length" },

  color: { ar: "اللون", en: "Color" },
  اللون: { ar: "اللون", en: "Color" },

  packaging_type: { ar: "نوع التغليف", en: "Packaging Type" },
  "نوع التغليف": { ar: "نوع التغليف", en: "Packaging Type" },

  dimensions: { ar: "الأبعاد", en: "Dimensions" },
  الأبعاد: { ar: "الأبعاد", en: "Dimensions" },

  components_kit: { ar: "مكونات الطقم", en: "Components Kit" },
  "مكونات الطقم": { ar: "مكونات الطقم", en: "Components Kit" },
};

export const getAttributeLabel = (key: string, isAr: boolean) => {
  const normKey = key.trim().toLowerCase();
  const entry = attributeTranslations[normKey];
  if (entry) return isAr ? entry.ar : entry.en;
  return isAr ? key : key.charAt(0).toUpperCase() + key.slice(1);
};
