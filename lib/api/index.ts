import { authApi } from './auth';
import { productsApi } from './products';
import { categoriesApi } from './categories';
import { ordersApi } from './orders';
import { usersApi } from './users';
import { dashboardApi } from './dashboard';
import { brandsApi } from './brands';
import { suppliersApi } from './suppliers';
import { couponsApi } from './coupons';
import { carouselApi } from './carousel';
import { supCategoriesApi } from './supCategories';
import { promoBannerApi } from './promoBanner';
import { cartApi } from './cart';

export const api = {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  orders: ordersApi,
  users: usersApi,
  dashboard: dashboardApi,
  brands: brandsApi,
  suppliers: suppliersApi,
  coupons: couponsApi,
  carousel: carouselApi,
  supCategories: supCategoriesApi,
  promoBanner: promoBannerApi,
  cart: cartApi,
};

export * from './client';
