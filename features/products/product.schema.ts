import * as z from 'zod';

export const attributeDefinitionSchema = z.object({
  name: z.string().min(1, 'required'),
  type: z.enum(['string', 'number']).default('string'),
  required: z.boolean().default(true),
  allowedUnits: z.array(z.string()).optional().nullish(),
  allowedValues: z.array(z.string()).default([]).nullish(),
});

// ─── Component DTO (A+B compound products) ─────────────
export const componentSchema = z.object({
  name: z.string().min(1, 'required'),
  value: z.coerce.number().positive('required'),
  unit: z.string().min(1, 'required'),
});

// measurement value schema
const MeasurementValueSchema = z.object({
  value: z.number(),
  unit: z.string(),
});

// ─── Variant schemas ─────────────────────────────────────
export const variantSchema = z.object({
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(1, 'required'),
  priceAfterDiscount: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).default(1),
  attributes: z.record(
    z.string(),
    z.union([z.string(), MeasurementValueSchema, z.any()])
  ).optional(),
  components: z.array(componentSchema).optional(),
  label: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateVariantSchema = variantSchema.extend({
  _id: z.string(),
}).partial().required({ _id: true });

// ─── Shared product base fields ─────────────────────────
const productBaseSchema = z.object({
  title: z.object({
    en: z.string().min(3, 'required').max(200, 'required'),
    ar: z.string().min(3, 'required').max(200, 'required'),
  }),
  description: z.object({
    en: z.string().min(15, 'required').max(1000, 'required'),
    ar: z.string().min(15, 'required').max(1000, 'required'),
  }),
  isUnlimitedStock: z.boolean().default(true),
  disabled: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  category: z.string(),
  SubCategories: z.array(z.string()).min(1, 'required'),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  allowedAttributes: z.array(attributeDefinitionSchema).optional(),
});

// ─── CREATE: variants as simple array ────────────────────
export const createProductSchema = productBaseSchema.extend({
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
});

// ─── EDIT: variant operations object ─────────────────────
export const editProductSchema = productBaseSchema.extend({
  variantsToCreate: z.array(variantSchema).optional().default([]),
  variantsToUpdate: z.array(updateVariantSchema).optional().default([]),
  variantsToDelete: z.array(z.string()).optional().default([]),
});

export type ProductInput = z.infer<typeof createProductSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type EditProductInput = z.infer<typeof editProductSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type ComponentInput = z.infer<typeof componentSchema>;
