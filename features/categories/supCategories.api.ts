import { env } from '@/lib/env';
import { SubCategory } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.SUP_CATEGORIES;

export const supCategoriesApi = createCrudApi<SubCategory>(ENDPOINTS.BASE, true);

