import { FileAsset } from '@/shared/types/file-asset';
import { LocalizedString } from '@/types';

export interface Coupon {
  _id: string;
  name: string;
  slug?: string;
  type: 'percentage' | 'fixed';
  discount: number;
  expires: string;
  active: boolean;
  applyTo?: 'all' | 'products' | 'categories' | 'brands';
  applyItems?: string[];
  usageCount?: number;
  maxUsage?: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Carousel {
  _id: string;
  description: LocalizedString;
  carouselSm:FileAsset | string;
  carouselMd:FileAsset | string;
  carouselLg:FileAsset | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromoBanner {
  _id: string;
  text: LocalizedString | string;
  link?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
