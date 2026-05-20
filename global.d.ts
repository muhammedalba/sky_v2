import common from './messages/common/en.json';
import dashboard from './messages/dashboard/en.json';
import products from './messages/products/en.json';
import categories from './messages/categories/en.json';
import orders from './messages/orders/en.json';
import users from './messages/users/en.json';
import profile from './messages/profile/en.json';
import home from './messages/home/en.json';
import contact from './messages/contact/en.json';
import store from './messages/store/en.json';
import brands from './messages/brands/en.json';
import carousel from './messages/carousel/en.json';
import subCategories from './messages/subCategories/en.json';
import promoBanners from './messages/promoBanners/en.json';
import suppliers from './messages/suppliers/en.json';
import coupons from './messages/coupons/en.json';
import settings from './messages/settings/en.json';
import quote from './messages/quote/en.json';
import cart from './messages/cart/en.json';
import maintenance from './messages/maintenance/en.json';
import locations from './messages/locations/en.json';
import roles from './messages/roles/en.json';
import notifications from './messages/notifications/en.json';

type Messages = {
  common: typeof common;
  auth: typeof common.auth;
  buttons: typeof common.buttons;
  errors: typeof common.errors;
  navigation: typeof common.navigation;
  messages: typeof common.messages;
  shipping: typeof common.shipping;
  shippingRates: typeof common.shippingRates;
  taxes: typeof common.taxes;
  dashboard: typeof dashboard;
  products: typeof products;
  categories: typeof categories;
  orders: typeof orders;
  users: typeof users;
  profile: typeof profile;
  home: typeof home;
  contact: typeof contact;
  store: typeof store;
  brands: typeof brands;
  carousel: typeof carousel;
  subCategories: typeof subCategories;
  promoBanners: typeof promoBanners;
  suppliers: typeof suppliers;
  coupons: typeof coupons;
  settings: typeof settings;
  quote: typeof quote;
  cart: typeof cart;
  maintenance: typeof maintenance;
  locations: typeof locations;
  roles: typeof roles;
  notifications: typeof notifications;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}
