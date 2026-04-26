import { env } from '@/lib/env';
import { Carousel } from '@/types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.CAROUSEL;

export const carouselApi = createCrudApi<Carousel>(ENDPOINTS.BASE, false);

