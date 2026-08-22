import { LocalizedString } from '@/types';
import { FileAsset } from '@/shared/types/file-asset';

export interface Category {
  _id: string;
  id?: string;
  name: LocalizedString;
  slug?: string;
  image?: FileAsset | string;
  productsCount?: number;
  subCategoriesCount?: number;
  SubCategories?: SubCategory[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SubCategory {
  _id: string;
  name: LocalizedString;
  category: Category;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
