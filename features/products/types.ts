import { LocalizedString } from '@/types';
import { Category, SubCategory } from '@/features/categories/types';
import { Brand } from '@/features/brands/types';
import { Supplier } from '@/features/suppliers/types';
import { FileAsset } from '@/shared/types/file-asset';

export interface ProductAttributeValue {
  value: string | number;
  unit?: string;
}

export type PackageType = 'box' | 'bag' | 'pallet' | 'roll' | 'envelope' | 'drum' | 'gallon' | 'board' | 'piece' | 'custom';

export interface ShippingDimensions {
  /** Length in millimeters */
  lengthMm?: number;
  /** Width in millimeters */
  widthMm?: number;
  /** Height in millimeters */
  heightMm?: number;
}

export interface ShippingProfile {
  /** Weight of one sellable unit in grams (canonical unit). E.g. 20000 = 20 kg. */
  weightGrams: number;
  dimensions?: ShippingDimensions;
  packageType: PackageType;
  /** Number of sellable units that fit in one shipping package */
  quantityPerPackage: number;
}

export interface ProductVariant {
  _id: string;
  productId: string | Product;
  sku: string;
  barcode?: string;
  price: number;
  priceAfterDiscount?: number;
  stock: number;
  sold?: number;
  attributes: Record<string, ProductAttributeValue>;
  /** Dedicated logistics/shipping metadata, separate from customer-facing attributes */
  shippingProfile?: ShippingProfile;
  components?: Record<string, unknown>[];
  label?: string;
  image?: FileAsset | string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  id?: string;
  title: LocalizedString;
  slug?: string;
  sku?: string;
  description: LocalizedString;
  uses?: {
    en: string[];
    ar: string[];
  };
  stockSummary?: number;
  variantCount: number;
  priceRange?: {
    min: number;
    max: number;
  };
  allowedAttributes?: {
    name: string;
    type: 'string' | 'number';
    required?: boolean;
    allowedUnits?: string[];
    allowedValues?: string[];
  }[];
  variants?: ProductVariant[];
  imageCover?: FileAsset | string;
  images?: (FileAsset | string)[];
  category: Category | string;
  SubCategories?: SubCategory[];
  brand?: Brand | string;
  supplier?: Supplier | string;
  isUnlimitedStock?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  comparePrice?: number;
  // manual?: string;
  infoProductPdf?: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  totalSold?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface ProductWithVariants {
  product: Product;
  variants: ProductVariant[];
}