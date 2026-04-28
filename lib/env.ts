/**
 * Centralized environment variable configuration.
 * Next.js requires static references (process.env.VARIABLE_NAME) for NEXT_PUBLIC_ 
 * variables to be correctly inlined into client-side bundles.
 */

const isServer = typeof window === 'undefined';

// --- Required Variables Validation ---
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Critical endpoints
const LOGIN_EP = process.env.NEXT_PUBLIC_ENDPOINT_AUTH_LOGIN;
const REGISTER_EP = process.env.NEXT_PUBLIC_ENDPOINT_AUTH_REGISTER;
const ME_EP = process.env.NEXT_PUBLIC_ENDPOINT_AUTH_ME;
const LOGOUT_EP = process.env.NEXT_PUBLIC_ENDPOINT_AUTH_LOGOUT;

// Server-only variables (Not prefixed with NEXT_PUBLIC_)
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// 1. Validate Public Variables (Required in both environments)
if (!API_URL || !APP_URL || !LOGIN_EP || !REGISTER_EP || !ME_EP || !LOGOUT_EP) {
  const missing = [
    !API_URL && 'NEXT_PUBLIC_API_URL',
    !APP_URL && 'NEXT_PUBLIC_APP_URL',
    !LOGIN_EP && 'NEXT_PUBLIC_ENDPOINT_AUTH_LOGIN',
    !REGISTER_EP && 'NEXT_PUBLIC_ENDPOINT_AUTH_REGISTER',
    !ME_EP && 'NEXT_PUBLIC_ENDPOINT_AUTH_ME',
    !LOGOUT_EP && 'NEXT_PUBLIC_ENDPOINT_AUTH_LOGOUT',
  ].filter(Boolean);
  
  throw new Error(`❌ Missing required public environment variables: ${missing.join(', ')}`);
}

// 2. Validate Server-only Variables (Only on the server)
if (isServer && !NEXTAUTH_SECRET) {
  throw new Error(`❌ Missing required server-side environment variable: NEXTAUTH_SECRET`);
}

export const env = {
  // API Configuration
  API_URL: API_URL,

  // App Configuration
  APP_URL: APP_URL,
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Sky Galaxy',
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || '',

  // Internationalization
  DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'ar',

  // Authentication (NextAuth) - Secret is only available on server
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || APP_URL,
  NEXTAUTH_SECRET: NEXTAUTH_SECRET || '',

  // SEO & Social Presence
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || APP_URL,
  SITE_KEYWORDS: process.env.NEXT_PUBLIC_SITE_KEYWORDS || '',
  FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  TWITTER_URL: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',

  // Contact Information
  SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '',
  SUPPORT_PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '',
  COMPANY_ADDRESS: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '',

  // App Settings
  DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD',
  PAGINATION_LIMIT: parseInt(process.env.NEXT_PUBLIC_PAGINATION_LIMIT || '10', 10),
  MAX_UPLOAD_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '5242880', 10),

  // Analytics
  GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',

  // API Endpoints - Auth
  ENDPOINTS: {
    AUTH: {
      LOGIN: LOGIN_EP,
      REGISTER: REGISTER_EP,
      REFRESH: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_REFRESH || '/auth/refresh-token',
      FORGOT_PASSWORD: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_FORGOT_PASSWORD || '/auth/forgot-password',
      VERIFY_CODE: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_VERIFY_CODE || '/auth/verify-Pass-Reset-Code',
      RESET_PASSWORD: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_RESET_PASSWORD || '/auth/reset-password',
      ME: ME_EP,
      LOGOUT: LOGOUT_EP,
      UPDATE_ME: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_UPDATE_ME || '/auth/updateMe',
      CHANGE_PASSWORD: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_CHANGE_PASSWORD || '/auth/changeMyPassword',
      GOOGLE: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_GOOGLE || '/auth/google',
      FACEBOOK: process.env.NEXT_PUBLIC_ENDPOINT_AUTH_FACEBOOK || '/auth/facebook',
    },
    PRODUCTS: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_PRODUCTS || '/products',
      STATS: process.env.NEXT_PUBLIC_ENDPOINT_PRODUCTS_STATS || '/products/statistics',
    },
    CATEGORIES: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_CATEGORIES || '/categories',
      STATS: process.env.NEXT_PUBLIC_ENDPOINT_CATEGORIES_STATS || '/categories/statistics',
    },
    ORDERS: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS || '/order',
      STATS: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS_STATS || '/order/statistics',
      COUPON: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS_COUPON || '/order/applyCoupon',
      BANK_TRANSFER: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS_BANK_TRANSFER || '/order/PaymentByBankTransfer',
    },
    USERS: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_USERS || '/users',
      CREATE: process.env.NEXT_PUBLIC_ENDPOINT_USERS_CREATE || '/users/create-user',
      STATS: process.env.NEXT_PUBLIC_ENDPOINT_USERS_STATS || '/users/statistics',
    },
    BRANDS: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_BRANDS || '/brands',
      STATS: process.env.NEXT_PUBLIC_ENDPOINT_BRANDS_STATS || '/brands/statistics',
    },
    SUPPLIERS: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_SUPPLIERS || '/supplier',
      STATS: process.env.NEXT_PUBLIC_ENDPOINT_SUPPLIERS_STATS || '/supplier/statistics',
    },
    COUPONS: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_COUPONS || '/coupons',
    },
    CAROUSEL: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_CAROUSEL || '/carousel',
    },
    SUP_CATEGORIES: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_SUP_CATEGORIES || '/sub-category',
      STATS: process.env.NEXT_PUBLIC_ENDPOINT_SUP_CATEGORIES_STATS || '/sub-category/statistics',
    },
    PROMO_BANNER: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_PROMO_BANNER || '/promo-banner',
      ACTIVE: process.env.NEXT_PUBLIC_ENDPOINT_PROMO_BANNER_ACTIVE || '/promo-banner/active',
    },
    CART: {
      BASE: process.env.NEXT_PUBLIC_ENDPOINT_CART || '/cart',
      ADD: process.env.NEXT_PUBLIC_ENDPOINT_CART_ADD || '/cart/add',
      CLEAR: process.env.NEXT_PUBLIC_ENDPOINT_CART_CLEAR || '/cart/clear',
      REMOVE: process.env.NEXT_PUBLIC_ENDPOINT_CART_REMOVE || '/cart/remove',
    },
  },
} as const;
