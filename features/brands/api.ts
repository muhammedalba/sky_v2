import { env } from '@/lib/env';
import { Brand } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.BRANDS;

export const brandsApi = createCrudApi<Brand>(ENDPOINTS.BASE, true);

