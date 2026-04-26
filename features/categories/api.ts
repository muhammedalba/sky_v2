import { env } from '@/lib/env';
import { Category } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.CATEGORIES;

export const categoriesApi = createCrudApi<Category>(ENDPOINTS.BASE, true);

