export enum Permissions {
  // Users
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Roles & Permissions
  VIEW_ROLES = 'view_roles',
  CREATE_ROLE = 'create_role',
  UPDATE_ROLE = 'update_role',
  DELETE_ROLE = 'delete_role',

  // Products
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCT = 'create_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',

  // Categories
  MANAGE_CATEGORIES = 'manage_categories',

  // Orders
  VIEW_ORDERS = 'view_orders',
  UPDATE_ORDER_STATUS = 'update_order_status',
  DELETE_ORDER = 'delete_order',

  // Settings
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_LOGS = 'view_logs',
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
