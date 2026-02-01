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
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  id?: string;
  title: LocalizedString;
  name?: LocalizedString; // Fallback alias
  sku?: string;
  description: LocalizedString;
  quantity: number;
  sold?: number;
  price: number;
  priceAfterDiscount?: number;
  colors?: string[];
  imageCover?: string;
  images?: string[];
  category: Category | string;
  subcategories?: (Category | string)[];
  brand?: Brand | string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
  comparePrice?: number; // Added to match frontend usage if API returns it
}

export interface Category {
  _id: string;
  id?: string;
  name: LocalizedString;
  description?: string;
  slug?: string;
  image?: string;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
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
}

export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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
}

export interface ApiResponse<T> {
  results?: number;
  metadata?: PaginationMeta;
  data: T;
  status?: string;
  message?: string;
  access_token?: string;
}

export interface ApiError {
  status?: string;
  message: string;
  error?: unknown;
  stack?: string;
}

export interface SubCategory {
  _id: string;
  name: LocalizedString;
  category: Category | string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}
