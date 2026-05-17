import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];


async function loadLocaleMessages(locale: string) {
  try {
    // Explicit switch for Turbopack stability
    let common, dashboard, products, categories, orders, users, profile, home, contact, store, brands, carousel, subCategories, promoBanners, suppliers, coupons, settings, quote, cart, maintenance, locations, roles;
    
    if (locale === 'ar') {
      [
        common, dashboard, products, categories, orders, users, profile, home, contact, store, brands, carousel, subCategories, promoBanners, suppliers, coupons, settings, quote, cart, maintenance, locations, roles
      ] = await Promise.all([
        import(`./messages/common/ar.json`).then(m => m.default),
        import(`./messages/dashboard/ar.json`).then(m => m.default),
        import(`./messages/products/ar.json`).then(m => m.default),
        import(`./messages/categories/ar.json`).then(m => m.default),
        import(`./messages/orders/ar.json`).then(m => m.default),
        import(`./messages/users/ar.json`).then(m => m.default),
        import(`./messages/profile/ar.json`).then(m => m.default),
        import(`./messages/home/ar.json`).then(m => m.default),
        import(`./messages/contact/ar.json`).then(m => m.default),
        import(`./messages/store/ar.json`).then(m => m.default),
        import(`./messages/brands/ar.json`).then(m => m.default),
        import(`./messages/carousel/ar.json`).then(m => m.default),
        import(`./messages/subCategories/ar.json`).then(m => m.default),
        import(`./messages/promoBanners/ar.json`).then(m => m.default),
        import(`./messages/suppliers/ar.json`).then(m => m.default),
        import(`./messages/coupons/ar.json`).then(m => m.default),
        import(`./messages/settings/ar.json`).then(m => m.default),
        import(`./messages/quote/ar.json`).then(m => m.default),
        import(`./messages/cart/ar.json`).then(m => m.default),
        import(`./messages/maintenance/ar.json`).then(m => m.default),
        import(`./messages/locations/ar.json`).then(m => m.default),
        import(`./messages/roles/ar.json`).then(m => m.default)
      ]);
    } else {
      [
        common, dashboard, products, categories, orders, users, profile, home, contact, store, brands, carousel, subCategories, promoBanners, suppliers, coupons, settings, quote, cart, maintenance, locations, roles
      ] = await Promise.all([
        import(`./messages/common/en.json`).then(m => m.default),
        import(`./messages/dashboard/en.json`).then(m => m.default),
        import(`./messages/products/en.json`).then(m => m.default),
        import(`./messages/categories/en.json`).then(m => m.default),
        import(`./messages/orders/en.json`).then(m => m.default),
        import(`./messages/users/en.json`).then(m => m.default),
        import(`./messages/profile/en.json`).then(m => m.default),
        import(`./messages/home/en.json`).then(m => m.default),
        import(`./messages/contact/en.json`).then(m => m.default),
        import(`./messages/store/en.json`).then(m => m.default),
        import(`./messages/brands/en.json`).then(m => m.default),
        import(`./messages/carousel/en.json`).then(m => m.default),
        import(`./messages/subCategories/en.json`).then(m => m.default),
        import(`./messages/promoBanners/en.json`).then(m => m.default),
        import(`./messages/suppliers/en.json`).then(m => m.default),
        import(`./messages/coupons/en.json`).then(m => m.default),
        import(`./messages/settings/en.json`).then(m => m.default),
        import(`./messages/quote/en.json`).then(m => m.default),
        import(`./messages/cart/en.json`).then(m => m.default),
        import(`./messages/maintenance/en.json`).then(m => m.default),
        import(`./messages/locations/en.json`).then(m => m.default),
        import(`./messages/roles/en.json`).then(m => m.default)
      ]);
    }

    return {
      common,
      auth: common.auth,
      buttons: common.buttons,
      errors: common.errors,
      navigation: common.navigation,
      messages: common.messages,
      shipping: common.shipping,
      shippingRates: common.shippingRates,
      taxes: common.taxes,
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
      quote,
      cart,
      maintenance,
      locations,
      roles,
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
