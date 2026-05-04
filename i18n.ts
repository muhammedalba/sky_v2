import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];


async function loadLocaleMessages(locale: string) {
  try {
    // Explicit switch for Turbopack stability
    let common, dashboard, products, categories, orders, users, profile, home, contact, store, brands, carousel, subCategories, promoBanners, suppliers, coupons, settings;
    
    if (locale === 'ar') {
      common = (await import(`./messages/common/ar.json`)).default;
      dashboard = (await import(`./messages/dashboard/ar.json`)).default;
      products = (await import(`./messages/products/ar.json`)).default;
      categories = (await import(`./messages/categories/ar.json`)).default;
      orders = (await import(`./messages/orders/ar.json`)).default;
      users = (await import(`./messages/users/ar.json`)).default;
      profile = (await import(`./messages/profile/ar.json`)).default;
      home = (await import(`./messages/home/ar.json`)).default;
      contact = (await import(`./messages/contact/ar.json`)).default;
      store = (await import(`./messages/store/ar.json`)).default;
      brands = (await import(`./messages/brands/ar.json`)).default;
      carousel = (await import(`./messages/carousel/ar.json`)).default;
      subCategories = (await import(`./messages/subCategories/ar.json`)).default;
      promoBanners = (await import(`./messages/promoBanners/ar.json`)).default;
      suppliers = (await import(`./messages/suppliers/ar.json`)).default;
      coupons = (await import(`./messages/coupons/ar.json`)).default;
      settings = (await import(`./messages/settings/ar.json`)).default;
    } else {
      common = (await import(`./messages/common/en.json`)).default;
      dashboard = (await import(`./messages/dashboard/en.json`)).default;
      products = (await import(`./messages/products/en.json`)).default;
      categories = (await import(`./messages/categories/en.json`)).default;
      orders = (await import(`./messages/orders/en.json`)).default;
      users = (await import(`./messages/users/en.json`)).default;
      profile = (await import(`./messages/profile/en.json`)).default;
      home = (await import(`./messages/home/en.json`)).default;
      contact = (await import(`./messages/contact/en.json`)).default;
      store = (await import(`./messages/store/en.json`)).default;
      brands = (await import(`./messages/brands/en.json`)).default;
      carousel = (await import(`./messages/carousel/en.json`)).default;
      subCategories = (await import(`./messages/subCategories/en.json`)).default;
      promoBanners = (await import(`./messages/promoBanners/en.json`)).default;
      suppliers = (await import(`./messages/suppliers/en.json`)).default;
      coupons = (await import(`./messages/coupons/en.json`)).default;
      settings = (await import(`./messages/settings/en.json`)).default;
    }

    return {
      common,
      auth: common.auth,
      buttons: common.buttons,
      errors: common.errors,
      navigation: common.navigation,
      messages: common.messages,
      dashboard,
      products,
      categories,
      orders,
      users,
      profile,
      home,
      contact,
      store,
      brands,
      carousel,
      subCategories,
      promoBanners,
      suppliers,
      coupons,
      settings,
    };
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
