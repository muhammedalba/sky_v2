import { LocalizedString } from '@/types';

export interface Coupon {
  _id: string;
  name: string;
  type: 'percentage' | 'fixed';
  discount: number;
  expires: string;
  active: boolean;
  limit?: number;
  used?: number;
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
