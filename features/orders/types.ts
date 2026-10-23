import { User } from '@/features/users/types';
import {
  Product,
  ProductVariant,
  VariantComponent,
} from '@/features/products/types';
import { Coupon, LocalizedString } from '@/types';
import { FileAsset } from '@/shared/types/file-asset';
import { ShippingProvider, ShippingRate } from '../shipping/types';
import { City, Country, Region } from '../locations/types';

export interface Address {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: Country;
  city?: City;
  region?: Region;
  street?: string;
  building?: string;
  postalCode?: string;
  additionalInfo?: string;
  addressType?: string;
  companyName?: string;
  vendorVatNo?: string;
  commercialRegNo?: string;
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
  // Snapshot taken at order time (missing on older orders — use resolveOrderItem)
  sku?: string;
  attributes?: Record<string, unknown>;
  components?: VariantComponent[];
  label?: string;
  title?: LocalizedString;
  image?: FileAsset | string;
  /** Shipping profile at order time; its packageType is the line's unit. */
  shippingSnapshot?: { packageType?: string };
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
  /** Full VAT (invoice only — includes VAT inside tax-inclusive prices). */
  taxAmount?: number;
  /** Tax charged on top of the total, calculated by the backend; shown on order screens. */
  chargedTaxAmount?: number;
  /** Products amount after coupon, excluding / including VAT (calculated by the backend). */
  productsAmountBeforeTax?: number;
  productsAmountAfterTax?: number;
  /** Tax rules snapshot at purchase time. */
  taxPercentage?: number;
  taxesIncluded?: boolean;
  applyTaxOnCharges?: boolean;
  paymentFees?: number;
  grandTotal?: number;
  totalPrice?: number;
  totalQuantity?: number;
  discountAmount?: number;
  currency?: string;
  couponId?: Coupon;
  couponCode?: string;
  paymentStatus?: string;
  /** Total refunded through Moyasar, in major units. */
  refundedAmount?: number;
  refundedAt?: string;
  status: string;
  isCheckedOut?: boolean;
  notes?: string;
  transferReceiptImg?: FileAsset;
  InvoicePdf?: FileAsset;
  /** Tax credit notes (مرتجع ضريبي); the customer only gets issued ones. */
  creditNotes?: OrderCreditNote[];
  /** The customer's return requests, newest first. */
  returnRequests?: ReturnRequest[];
  /** Whether the customer may still ask for a return. */
  returnPolicy?: ReturnPolicy;
  DeliveryReceiptImage?: FileAsset;
  deliveryReceiptNumber?: string;
  deliveryDate?: string;
  deliveryName?: string;
  customerServiceContact?: string;
  DeliveryVerificationCode?: string;
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
  | 'PARTIALLY_REFUNDED'
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

/** A credit note's amounts, in the store currency (all positive). */
export interface CreditNoteAmounts {
  products: number;
  discount: number;
  productsBeforeTax: number;
  productsAfterTax: number;
  shipping: number;
  paymentFees: number;
  /** VAT on shipping and payment fees; older credit notes: none. */
  chargesTax?: number;
  taxable: number;
  tax: number;
  total: number;
}

/**
 * Why the items come back: `defect` (defect or store error: the store pays
 * the shipping) or `other` (e.g. a change of mind: the customer pays it).
 */
export type ReturnReasonType = "defect" | "other";

/** Kept back from the refund (not from the credit note). */
export interface CreditNoteDeductions {
  returnShipping?: { amount: number; tax: number; total: number };
}

/**
 * A tax credit note on an order. The customer gets number, date, total and
 * file; the dashboard gets the rest too.
 */
export interface OrderCreditNote {
  _id: string;
  displayNumber?: string;
  issuedAt?: string;
  file?: FileAsset;
  /** Customer view: the credit note total. */
  total?: number;
  /** Customer view: the return shipping kept back from the refund. */
  returnShipping?: number;
  state?: "awaiting_refund" | "issued" | "void";
  amounts?: CreditNoteAmounts;
  /** Absent on credit notes from before the return policy (defect). */
  reasonType?: ReturnReasonType;
  deductions?: CreditNoteDeductions;
  returnRequest?: string;
  lines?: { itemIndex: number; quantity: number }[];
  reason?: string;
  source?: "admin" | "full_refund";
  refund?: {
    via: "moyasar" | "manual" | "already_refunded" | "none";
    amount: number;
  };
  restocked?: boolean;
  /** PDF state: "failed" can be regenerated. */
  status?: "pending" | "generating" | "generated" | "failed";
}

/** What the return dialog needs before offering a return. */
export interface CreditNoteSummary {
  invoiceIssued: boolean;
  /** Per order line: how many can still be returned. */
  remaining: number[];
  /** Refunded already without a credit note (used before refunding more). */
  uncreditedRefund: number;
  /**
   * An older order with a coupon on some items: its lines' discount is
   * estimated from the coupon's current rules, so the amount needs a check.
   */
  discountEstimated: boolean;
}

export interface CreditNotePreview {
  amounts: CreditNoteAmounts;
  includesCharges: boolean;
  uncreditedRefund: number;
  deductions: CreditNoteDeductions;
  /** What the customer gets: the total less the deductions. */
  refundAmount: number;
}

/** The customer's preview of a return request. */
export type ReturnRequestPreview = Omit<CreditNotePreview, "uncreditedRefund">;

export type ReturnRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

/** A customer's request to return items, decided in the dashboard. */
export interface ReturnRequest {
  _id: string;
  lines: CreditNoteLineInput[];
  reasonType: ReturnReasonType;
  note: string;
  status: ReturnRequestStatus;
  rejectionReason?: string;
  /** The credit note that settled it (approved). */
  creditNote?: string;
  createdAt: string;
  decidedAt?: string;
}

/** A request in the dashboard's list, with its order and customer. */
export interface ReturnRequestListItem extends Omit<ReturnRequest, "never"> {
  order?: {
    _id: string;
    invoiceNumber?: number;
    grandTotal?: number;
    currency?: string;
    status?: string;
    paymentMethodCode?: string;
  };
  user?: { _id: string; name?: string; email?: string; phone?: string };
}

/** The return window: the store setting returnWindowDays, after delivery. */
export interface ReturnPolicy {
  windowDays: number;
  /** Delivery + the window; null before delivery. */
  endsAt: string | null;
  open: boolean;
  /** Customer view: per order line, how many can still be returned. */
  remaining?: number[];
}

export interface CreditNoteLineInput {
  itemIndex: number;
  quantity: number;
}
