import { env } from '@/lib/env';
import { Supplier } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.SUPPLIERS;

export const suppliersApi = createCrudApi<Supplier>(ENDPOINTS.BASE, true);

