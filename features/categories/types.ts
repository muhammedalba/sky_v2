import { LocalizedString } from '@/types';

export interface Category {
  _id: string;
  id?: string;
  name: LocalizedString;
  slug?: string;
  image?: string;
  productsCount?: number;
  subCategoriesCount?: number;
  supCategories?: Category[];
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
