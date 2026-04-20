import { User } from '@/features/users/types';
import { Product } from '@/features/products/types';

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

export interface OrderItem {
  _id: string;
  product: Product;
  count: number;
  color?: string;
  price: number;
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
