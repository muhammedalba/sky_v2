import { User } from '@/features/users/types';
import { Product } from '@/features/products/types';

export interface Address {
  firstName?: string;
  lastName?: string;
  phone?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  country?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  city?: any;
  street?: string;
  building?: string;
  postalCode?: string;
  additionalInfo?: string;
  addressType?: string;
}

export interface OrderItem {
  productId?: Product;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variantId?: any;
  quantity: number;
  totalPrice: number;
  price: number;
  weight?: number;
  brand?: string | Record<string, unknown>;
  category?: string | Record<string, unknown>;
  sku?: string;
  attributes?: Record<string, unknown>;
}

export interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  shippingAddress?: Address;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shippingProviderId?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shippingRateId?: any;
  paymentMethodCode?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingAmount?: number;
  taxAmount?: number;
  paymentFees?: number;
  grandTotal?: number;
  totalPrice?: number;
  totalQuantity?: number;
  discountAmount?: number;
  currency?: string;
  couponId?: string | Record<string, unknown>;
  couponCode?: string;
  paymentStatus?: string;
  status: string;
  isCheckedOut?: boolean;
  notes?: string;
  InvoicePdf?: string;
  DeliveryReceiptImage?: string;
  deliveryDate?: string;
  deliveryName?: string;
  // Timeline timestamps
  checkedOutAt?: string;
  processingAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Statistics Types (from GET /order/statistics) ─────────────────────────────

export interface OrderStatsOverview {
  totalOrdersSystemWide: number;
  currentPeriodOrders: number;
  validOrdersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface DailyOrder {
  date: string;
  count: number;
  revenue: number;
}

export interface TopProduct {
  productId: string;
  totalQuantity: number;
  productName: string;
}

export interface TopCustomer {
  userId: string;
  totalOrders: number;
  totalSpent: number;
  userName: string;
}

export interface OrderStatsResponse {
  overview: OrderStatsOverview;
  statusBreakdown: Record<string, number>;
  dailyOrders: DailyOrder[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  dateRange: { start: string; end: string };
}

// ─── Filter & Sort Types ───────────────────────────────────────────────────────

export type OrderStatusType =
  | 'pending_payment'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type PaymentStatusType =
  | 'INITIATED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
}

export type SortField = 'createdAt' | 'grandTotal' | 'totalQuantity' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface OrderSort {
  field: SortField;
  direction: SortDirection;
}
