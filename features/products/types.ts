import { LocalizedString } from '@/types';
import { Category, SubCategory } from '@/features/categories/types';
import { Brand } from '@/features/brands/types';
import { Supplier } from '@/features/suppliers/types';

export interface ProductVariant {
  _id: string;
  productId: string | Product;
  sku: string;
  barcode?: string;
  price: number;
  priceAfterDiscount?: number;
  stock: number;
  sold?: number;
  attributes: Record<string, unknown>;
  components?: Record<string, unknown>[];
  label?: string;
  image?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  id?: string;
  title: LocalizedString;
  slug?: string;
  sku?: string;
  description: LocalizedString;
  stockSummary?: number;
  variantCount?: number;
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
  imageCover?: string;
  images?: string[];
  category: Category | string;
  SubCategories?: SubCategory[];
  brand?: Brand | string;
  supplier?: Supplier | string;
  isUnlimitedStock?: boolean;
  disabled?: boolean;
  isFeatured?: boolean;
  comparePrice?: number;
  manual?: string;
  infoProductPdf?: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
