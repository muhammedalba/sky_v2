export type LocalizedString = string | { en: string; ar: string };

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  phone?: string;
  active?: boolean;
  updatedAt?: string;
}

export interface ProductVariant {
  _id: string;
  productId: string | Product;
  sku: string;
  barcode?: string;
  price: number;
  priceAfterDiscount?: number;
  stock: number;
  sold?: number;
  attributes: Record<string, unknown>;
  components?: Record<string, unknown>[];
  label?: string;
  image?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  id?: string;
  title: LocalizedString;
  slug?: string;
  sku?: string;
  description: LocalizedString;
  stockSummary?: number;
  variantCount?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  allowedAttributes?: {
    name: string;
    type: 'string' | 'number';
    required?: boolean;
    allowedUnits?: string[];
    allowedValues?: string[];
  }[];
  variants?: ProductVariant[];
  imageCover?: string;
  images?: string[];
  category: Category | string;
  supCategories?: Category[]; 
  brand?: Brand | string;
  supplier?: Supplier | string;
  isUnlimitedStock?: boolean;
  disabled?: boolean;
  isFeatured?: boolean;
  comparePrice?: number;
  manual?: string;
  infoProductPdf?: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  id?: string;
  name: LocalizedString;
  slug?: string;
  image?: string;
  productsCount?: number;
  subCategoriesCount?: number;
  supCategories?: Category[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  user: User;
  cartItems: OrderItem[];
  shippingAddress?: Address;
  taxPrice?: number;
  shippingPrice?: number;
  totalOrderPrice: number;
  paymentMethodType: 'card' | 'cash';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  count: number;
  color?: string;
  price: number;
}

export interface Address {
  _id?: string;
  alias?: string;
  details: string;
  phone: string;
  city: string;
  state?: string;
  country?: string;
  zipCode?: string;
  postalCode?: string;
}

export interface DashboardStats {
  products: {
    totalProducts: number;
  };
  categories: {
    totalCategories: number;
  };
  users: {
    totalUsers: number;
  };
  orders: {
    totalOrders: number;
    totalRevenue: number;
  };
  recentOrders?: Order[];
  topProducts?: Product[];
}

export interface Brand {
  _id: string;
  name: LocalizedString;
  slug?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactName: string;
  website: URL;
  avatar?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Coupon {
  _id: string;
  name: string;
  type: 'percentage' | 'fixed';
  discount: number;
  expires: string;
  active: boolean;
  limit?: number;
  used?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Carousel {
  _id: string;
  description: LocalizedString;
  carouselSm: string;
  carouselMd: string;
  carouselLg: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromoBanner {
  _id: string;
  text: LocalizedString;
  link?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  prevPage?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
  errors?: string[];
  timestamp?: string;
  path?: string;
  access_token?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
}

export interface SubCategory {
  _id: string;
  name: LocalizedString;
  category: Category;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
