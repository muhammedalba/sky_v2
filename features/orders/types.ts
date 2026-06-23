import { User } from '@/features/users/types';
import { Product } from '@/features/products/types';

export interface Address {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: any;
  city?: any;
  street?: string;
  building?: string;
  postalCode?: string;
  additionalInfo?: string;
  addressType?: string;
}

export interface OrderItem {
  productId?: Product;
  variantId?: string;
  quantity: number;
  totalPrice: number;
  price: number;
  weight?: number;
  brand?: any;
  category?: any;
}

export interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  shippingAddress?: Address;
  shippingProviderId?: string;
  shippingRateId?: string;
  paymentMethodCode?: string;
  shippingAmount?: number;
  taxAmount?: number;
  paymentFees?: number;
  grandTotal?: number;
  totalPrice?: number;
  discountAmount?: number;
  currency?: string;
  couponId?: any;
  paymentStatus?: string;
  status: string;
  isCheckedOut?: boolean;
  createdAt: string;
  updatedAt: string;
}
