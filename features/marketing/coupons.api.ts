import { env } from '@/lib/env';
import { Coupon } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.COUPONS;

export const couponsApi = createCrudApi<Coupon>(ENDPOINTS.BASE, false);

