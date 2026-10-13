export enum Permissions {
  // ---- Dashboard Access ----
  ACCESS_DASHBOARD = "access_dashboard",
  VIEW_DASHBOARD_STATS = "view_dashboard_stats",

  // ---- Settings ----
  VIEW_SETTINGS = "view_settings",
  UPDATE_SETTINGS = "update_settings",
  UPDATE_MAINTENANCE = "update_maintenance",
  UPDATE_DEBUG = "update_debug",

  // Locations
  VIEW_LOCATIONS = "view_locations",
  CREATE_LOCATION = "create_location",
  UPDATE_LOCATION = "update_location",
  DELETE_LOCATION = "delete_location",

  VIEW_EXTERNAL_PLATFORMS = "view_external-platforms",

  // ---- Roles & Permissions ----
  VIEW_ROLES = "view_roles",
  CREATE_ROLE = "create_role",
  UPDATE_ROLE = "update_role",
  DELETE_ROLE = "delete_role",

  // ---- Users & Suppliers ----
  VIEW_USERS = "view_users",
  CREATE_USER = "create_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",

  VIEW_SUPPLIERS = "view_suppliers",
  CREATE_SUPPLIER = "create_supplier",
  UPDATE_SUPPLIER = "update_supplier",
  DELETE_SUPPLIER = "delete_supplier",

  // ---- Products ----
  VIEW_PRODUCTS = "view_products",
  CREATE_PRODUCT = "create_product",
  UPDATE_PRODUCT = "update_product",
  DELETE_PRODUCT = "delete_product",
  VIEW_PRODUCTS_STATS = "view_products_stats",

  // ---- Orders ----
  VIEW_ORDERS = "view_orders",
  UPDATE_ORDER_STATUS = "update_order_status",
  DELETE_ORDER = "delete_order",
  REFUND_ORDER = "refund_order",

  // ---- Categories ----
  VIEW_CATEGORIES = "view_categories",
  CREATE_CATEGORY = "create_category",
  UPDATE_CATEGORY = "update_category",
  DELETE_CATEGORY = "delete_category",

  // ---- Sub Categories ----
  VIEW_SUB_CATEGORIES = "view_sub_categories",
  CREATE_SUB_CATEGORY = "create_sub_category",
  UPDATE_SUB_CATEGORY = "update_sub_category",
  DELETE_SUB_CATEGORY = "delete_sub_category",

  // ---- Brands ----
  VIEW_BRANDS = "view_brands",
  CREATE_BRAND = "create_brand",
  UPDATE_BRAND = "update_brand",
  DELETE_BRAND = "delete_brand",

  // ---- Carousels ----
  VIEW_CAROUSEL = "view_carousels",
  CREATE_CAROUSEL = "create_carousel",
  UPDATE_CAROUSEL = "update_carousel",
  DELETE_CAROUSEL = "delete_carousel",

  // ---- Coupons & Promo ----
  VIEW_COUPONS = "view_coupons",
  CREATE_COUPON = "create_coupon",
  UPDATE_COUPON = "update_coupon",
  DELETE_COUPON = "delete_coupon",

  VIEW_PROMO_BANNERS = "view_promo_banners",
  CREATE_PROMO_BANNER = "create_promo_banner",
  UPDATE_PROMO_BANNER = "update_promo_banner",
  DELETE_PROMO_BANNER = "delete_promo_banner",

  // ---- Shipping & Taxes ----
  VIEW_SHIPPING = "view_shipping",
  CREATE_SHIPPING = "create_shipping",
  UPDATE_SHIPPING = "update_shipping",
  DELETE_SHIPPING = "delete_shipping",
  VIEW_SHIPPING_RATES = "view_shipping_rates",
  // TAXES
  VIEW_TAXES = "view_taxes",
  CREATE_TAX = "create_tax",
  UPDATE_TAX = "update_tax",
  DELETE_TAX = "delete_tax",
  // PAYMENT METHODS
  VIEW_PAYMENT_METHODS = "view_payment_methods",
  CREATE_PAYMENT_METHOD = "create_payment_method",
  UPDATE_PAYMENT_METHOD = "update_payment_method",
  DELETE_PAYMENT_METHOD = "delete_payment_method",

  // ---- Notifications ----
  VIEW_NOTIFICATIONS = "view_notifications",
  SEND_NOTIFICATION = "send_notification",
  DELETE_NOTIFICATION = "delete_notification",

  // ---- Reviews ----
  VIEW_REVIEWS = "view_reviews",
  MANAGE_REVIEWS = "manage_reviews",
  DELETE_REVIEW = "delete_review",

  // ---- Database backups ----
  VIEW_BACKUPS = "view_backups",
  MANAGE_BACKUP_SETTINGS = "manage_backup_settings",
  RUN_BACKUP = "run_backup",
  VERIFY_BACKUP = "verify_backup",
  RESTORE_BACKUP_TEST = "restore_backup_test",
  RESTORE_BACKUP_FILES = "restore_backup_files",
  DOWNLOAD_BACKUP = "download_backup",
  UPLOAD_BACKUP = "upload_backup",
}

const BACKUP_PERMISSIONS: string[] = [
  Permissions.VIEW_BACKUPS,
  Permissions.MANAGE_BACKUP_SETTINGS,
  Permissions.RUN_BACKUP,
  Permissions.VERIFY_BACKUP,
  Permissions.RESTORE_BACKUP_TEST,
  Permissions.RESTORE_BACKUP_FILES,
  Permissions.DOWNLOAD_BACKUP,
  Permissions.UPLOAD_BACKUP,
];

/**
 * Stored permissions plus the ones they imply — mirrors the server's
 * `expandPermissions` (UPDATE_SETTINGS ⇒ VIEW_SETTINGS, any backup
 * permission ⇒ VIEW_BACKUPS). The server enforces; this only keeps the UI in step.
 */
export function expandPermissions(permissions: readonly string[]): string[] {
  const set = new Set(permissions);
  if (set.has(Permissions.UPDATE_SETTINGS)) set.add(Permissions.VIEW_SETTINGS);
  if (BACKUP_PERMISSIONS.some((p) => set.has(p))) set.add(Permissions.VIEW_BACKUPS);
  return [...set];
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
