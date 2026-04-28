export const WEIGHT_UNITS = [
  { value: '', label: 'Any' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
] as const;

export const VOLUME_UNITS = [
  { value: '', label: 'Any' },
  { value: 'l', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'gal', label: 'gal' },
] as const;




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
export type WeightUnit = (typeof WEIGHT_UNITS)[number]['value'];
export type VolumeUnit = (typeof VOLUME_UNITS)[number]['value'];
