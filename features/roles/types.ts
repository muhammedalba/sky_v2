export enum Permissions {
  // ---- Dashboard Access ----
  ACCESS_DASHBOARD = 'access_dashboard',
  VIEW_DASHBOARD_STATS = 'view_dashboard_stats',

  // ---- Settings ----
  VIEW_SETTINGS = 'view_settings',
  UPDATE_SETTINGS = 'update_settings',

  VIEW_LOCATIONS = 'view_locations',
  CREATE_LOCATION = 'create_location',
  UPDATE_LOCATION = 'update_location',
  DELETE_LOCATION = 'delete_location',

  VIEW_EXTERNAL_PLATFORMS = 'view_external-platforms',


  // ---- Roles & Permissions ----
  VIEW_ROLES = 'view_roles',
  CREATE_ROLE = 'create_role',
  UPDATE_ROLE = 'update_role',
  DELETE_ROLE = 'delete_role',

  // ---- Users & Suppliers ----
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  VIEW_SUPPLIERS = 'view_suppliers',
  CREATE_SUPPLIER = 'create_supplier',
  UPDATE_SUPPLIER = 'update_supplier',
  DELETE_SUPPLIER = 'delete_supplier',

  // ---- Products ----
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCT = 'create_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',
  VIEW_PRODUCTS_STATS = 'view_products_stats',

  // ---- Orders ----
  VIEW_ORDERS = 'view_orders',
  UPDATE_ORDER_STATUS = 'update_order_status',
  DELETE_ORDER = 'delete_order',
  REFUND_ORDER = 'refund_order',

  // ---- Categories ----
  VIEW_CATEGORIES = 'view_categories',
  CREATE_CATEGORY = 'create_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',

  // ---- Sub Categories ----
  VIEW_SUB_CATEGORIES = 'view_sub_categories',
  CREATE_SUB_CATEGORY = 'create_sub_category',
  UPDATE_SUB_CATEGORY = 'update_sub_category',
  DELETE_SUB_CATEGORY = 'delete_sub_category',

  // ---- Brands ----
  VIEW_BRANDS = 'view_brands',
  CREATE_BRAND = 'create_brand',
  UPDATE_BRAND = 'update_brand',
  DELETE_BRAND = 'delete_brand',

  // ---- Carousels ----
  VIEW_CAROUSEL = 'view_carousels',
  CREATE_CAROUSEL = 'create_carousel',
  UPDATE_CAROUSEL = 'update_carousel',
  DELETE_CAROUSEL = 'delete_carousel',

  // ---- Coupons & Promo ----
  VIEW_COUPONS = 'view_coupons',
  CREATE_COUPON = 'create_coupon',
  UPDATE_COUPON = 'update_coupon',
  DELETE_COUPON = 'delete_coupon',

  VIEW_PROMO_BANNERS = 'view_promo_banners',
  CREATE_PROMO_BANNER = 'create_promo_banner',
  UPDATE_PROMO_BANNER = 'update_promo_banner',
  DELETE_PROMO_BANNER = 'delete_promo_banner',

  // ---- Shipping & Taxes ----
  VIEW_SHIPPING = 'view_shipping',
  CREATE_SHIPPING = 'create_shipping',
  UPDATE_SHIPPING = 'update_shipping',
  DELETE_SHIPPING = 'delete_shipping',
  VIEW_SHIPPING_RATES = 'view_shipping_rates',

  VIEW_TAXES = 'view_taxes',
  CREATE_TAX = 'create_tax',
  UPDATE_TAX = 'update_tax',
  DELETE_TAX = 'delete_tax',
}

export interface PermissionGroup {
  group: string;
  permissions: {
    key: string;
    label: string;
    description?: string;
  }[];
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  level: number;
  permissions: string[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}
