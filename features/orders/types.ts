import { User } from '@/features/users/types';
import { Product, ProductVariant } from '@/features/products/types';
import { Coupon } from '@/types';
import { ShippingProvider, ShippingRate } from '../shipping/types';
import { City, Country } from '../locations/types';

export interface Address {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: Country;
  city?: City;
  street?: string;
  building?: string;
  postalCode?: string;
  additionalInfo?: string;
  addressType?: string;
  companyName?: string;
  vendorVatNo?: string;
}

export interface OrderItem {
  productId?: Product;
  variantId?: ProductVariant;
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
  shippingProviderId?: ShippingProvider;

  shippingRateId?: ShippingRate;
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
  couponId?: Coupon;
  couponCode?: string;
  paymentStatus?: string;
  status: string;
  isCheckedOut?: boolean;
  notes?: string;
  transferReceiptImg?: string;
  InvoicePdf?: string;
  DeliveryReceiptImage?: string;
  deliveryReceiptNumber?: string;
  deliveryDate?: string;
  deliveryName?: string;
  invoiceNumber?: number; // رقم الفاتورة التسلسلي التلقائي
  invoiceHash?: string; // هاش الفاتورة الإلكترونية (ZATCA Hash)
  // Timeline timestamps
  checkedOutAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paidAt?: string;
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
