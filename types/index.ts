export type LocalizedString = string | { en: string; ar: string };

export * from '@/features/users/types';
export * from '@/features/products/types';
export * from '@/features/categories/types';
export * from '@/features/orders/types';
export * from '@/features/dashboard/types';
export * from '@/features/brands/types';
export * from '@/features/suppliers/types';
export * from '@/features/marketing/types';

export interface PaginationMeta {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  totalResults: number;
  nextPage?: number;
  prevPage?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
  errors?: string[];
  timestamp?: string;
  path?: string;
  access_token?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
}
