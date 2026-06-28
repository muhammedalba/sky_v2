'use client';

import { Order } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';

interface OrderSummaryCardProps {
  order: Order;
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const subtotal = order.totalPrice || 0;
  const shipping = order.shippingAmount || 0;
  const discount = order.discountAmount || 0;
  const tax = order.taxAmount || 0;
  const paymentFees = order.paymentFees || 0;
  const grandTotal = order.grandTotal || subtotal;

  const totalQuantity = order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
  const totalItems = order.items?.length || 0;

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20">
        <CardTitle className="text-sm font-bold text-foreground">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground tabular-nums">
              {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency || 'SAR'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Shipping</span>
            <span className="text-foreground tabular-nums">
              {shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency || 'SAR'}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-xs font-bold text-red-500">
              <span>Discount</span>
              <span className="tabular-nums">
                -{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency || 'SAR'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Tax</span>
            <span className="text-foreground tabular-nums">
              {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency || 'SAR'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Payment Fees</span>
            <span className="text-foreground tabular-nums">
              {paymentFees.toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency || 'SAR'}
            </span>
          </div>
        </div>

        <div className="h-px bg-border/40 my-1" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-foreground">Grand Total</span>
          <span className="text-lg font-black text-primary tabular-nums">
            {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency || 'SAR'}
          </span>
        </div>

        <div className="h-px bg-border/40 my-1" />

        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Total Quantity</span>
            <span className="text-foreground font-bold tabular-nums">{totalQuantity}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Total Items</span>
            <span className="text-foreground font-bold tabular-nums">{totalItems}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
