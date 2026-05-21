import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

// Static map of loaders to ensure full Turbopack/Webpack compatibility and parallel performance
const loaders: Record<string, (locale: string) => Promise<unknown>> = {
  common: (locale) => import(`./messages/common/${locale}.json`).then(m => m.default),
  dashboard: (locale) => import(`./messages/dashboard/${locale}.json`).then(m => m.default),
  products: (locale) => import(`./messages/products/${locale}.json`).then(m => m.default),
  categories: (locale) => import(`./messages/categories/${locale}.json`).then(m => m.default),
  orders: (locale) => import(`./messages/orders/${locale}.json`).then(m => m.default),
  users: (locale) => import(`./messages/users/${locale}.json`).then(m => m.default),
  profile: (locale) => import(`./messages/profile/${locale}.json`).then(m => m.default),
  home: (locale) => import(`./messages/home/${locale}.json`).then(m => m.default),
  contact: (locale) => import(`./messages/contact/${locale}.json`).then(m => m.default),
  store: (locale) => import(`./messages/store/${locale}.json`).then(m => m.default),
  brands: (locale) => import(`./messages/brands/${locale}.json`).then(m => m.default),
  carousel: (locale) => import(`./messages/carousel/${locale}.json`).then(m => m.default),
  subCategories: (locale) => import(`./messages/subCategories/${locale}.json`).then(m => m.default),
  promoBanners: (locale) => import(`./messages/promoBanners/${locale}.json`).then(m => m.default),
  suppliers: (locale) => import(`./messages/suppliers/${locale}.json`).then(m => m.default),
  coupons: (locale) => import(`./messages/coupons/${locale}.json`).then(m => m.default),
  settings: (locale) => import(`./messages/settings/${locale}.json`).then(m => m.default),
  quote: (locale) => import(`./messages/quote/${locale}.json`).then(m => m.default),
  cart: (locale) => import(`./messages/cart/${locale}.json`).then(m => m.default),
  maintenance: (locale) => import(`./messages/maintenance/${locale}.json`).then(m => m.default),
  locations: (locale) => import(`./messages/locations/${locale}.json`).then(m => m.default),
  roles: (locale) => import(`./messages/roles/${locale}.json`).then(m => m.default),
  notifications: (locale) => import(`./messages/notifications/${locale}.json`).then(m => m.default),
};

// ─── Module-level cache: messages are loaded once per locale per server process ───
// This is the key optimization: locale switching triggers a Server Component
// re-render, which would re-call loadLocaleMessages on every switch.
// By caching at module level, the 2nd+ switch for the same locale is instant (~0ms).
const messagesCache = new Map<string, Record<string, unknown>>();

async function loadLocaleMessages(locale: string) {
  // Return from cache if already loaded for this locale
  if (messagesCache.has(locale)) {
    return messagesCache.get(locale)!;
  }

  try {
    const keys = Object.keys(loaders);
    const results = await Promise.all(keys.map(key => loaders[key](locale)));

    const messages: Record<string, unknown> = {};
    keys.forEach((key, index) => {
      messages[key] = results[index];
    });

    const common = (messages.common || {}) as Record<string, unknown>;

    const finalMessages = {
      common,
      auth: common.auth,
      buttons: common.buttons,
      errors: common.errors,
      navigation: common.navigation,
      messages: common.messages,
      shipping: common.shipping,
      shippingRates: common.shippingRates,
      taxes: common.taxes,
      ...messages
    };

    // Store in cache for this locale
    messagesCache.set(locale, finalMessages);
    return finalMessages;
  } catch (error) {
    console.error(`[i18n] Error loading translation files for ${locale}:`, error);
    return {};
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  // In next-intl v4, the parameter is requestLocale and it's a Promise
  const locale = await requestLocale;
  const currentLocale = locale || 'en';

  const messages = await loadLocaleMessages(currentLocale);

  return {
    locale: currentLocale,
    messages,
    timeZone: 'UTC',
    now: new Date(),
  };
});
