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
  carouselSm: string;
  carouselMd: string;
  carouselLg: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromoBanner {
  _id: string;
  text: LocalizedString;
  link?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
