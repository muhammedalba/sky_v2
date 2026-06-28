'use client';

import { use, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Card } from '@/shared/ui/Card';
import { TicketIcon, ShoppingBagIcon } from 'lucide-react';

// Sub-components
import OrderHeader from '@/features/orders/components/OrderHeader';
import OrderTimeline from '@/features/orders/components/OrderTimeline';
import OrderProductsTable from '@/features/orders/components/OrderProductsTable';
import OrderShippingCard from '@/features/orders/components/OrderShippingCard';
import OrderPaymentCard from '@/features/orders/components/OrderPaymentCard';
import OrderSummaryCard from '@/features/orders/components/OrderSummaryCard';
import CustomerCard from '@/features/orders/components/CustomerCard';
import StatusManagementCard from '@/features/orders/components/StatusManagementCard';
import InvoicePreview from '@/features/orders/components/InvoicePreview';
import OrderNotes from '@/features/orders/components/OrderNotes';
import OrderActions from '@/features/orders/components/OrderActions';
import InvoicePreviewDialog from '@/features/orders/components/InvoicePreviewDialog';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading, refetch } = useOrder(id);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order-stats'] });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-6 max-w-7xl mx-auto">
        <div className="space-y-3">
          <Skeleton className="h-10 w-1/3 rounded-2xl" />
          <Skeleton className="h-5 w-1/4 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[250px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
            <Skeleton className="h-[200px] rounded-3xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[300px] rounded-3xl" />
            <Skeleton className="h-[220px] rounded-3xl" />
            <Skeleton className="h-[280px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="p-4 bg-secondary/20 rounded-full text-muted-foreground animate-bounce">
          <ShoppingBagIcon className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Order not found</h2>
        <p className="text-sm text-muted-foreground">
          The requested transaction ID might be invalid or deleted.
        </p>
        <Button variant="outline" className="rounded-xl px-6" onClick={() => router.back()}>
          Go back to orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      {/* 1. Header */}
      <OrderHeader
        order={order}
        onRefresh={handleRefresh}
      />

      {/* 2. Responsive 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Main details & operations) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Lifecycle Timeline */}
          <OrderTimeline order={order} />

          {/* Purchased Products Table */}
          <OrderProductsTable order={order} />

          {/* Recipient Shipping Address Card */}
          <OrderShippingCard order={order} />

          {/* Billing Payment Info Card */}
          <OrderPaymentCard order={order} />

          {/* Internal Operations Notes */}
          <OrderNotes order={order} />

          {/* HTML / PDF Invoice Embed Widget */}
          <InvoicePreview
            order={order}
            onPreviewInvoice={() => setIsInvoiceOpen(true)}
            onDownloadInvoice={() => {
              if (order.InvoicePdf) {
                window.open(order.InvoicePdf, '_blank');
              } else {
                setIsInvoiceOpen(true);
              }
            }}
          />
        </div>

        {/* Right Sticky Sidebar Column */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Order Totals Summary Card */}
          <OrderSummaryCard order={order} />

          {/* Customer Metadata Profile Card */}
          <CustomerCard order={order} />

          {/* Coupon Code Summary Widget */}
          <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                    <TicketIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-foreground">
                        {order.couponCode || 'SAVE20'}
                      </span>
                      <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border-none">
                        Applied
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-foreground font-bold tabular-nums">
                    {(order.discountAmount || 121.00).toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency || 'SAR'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Type</span>
                  <span className="text-foreground font-bold">Fixed Amount</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Expires On</span>
                  <span className="text-foreground font-bold">Jul 23, 2026</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border/20 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl font-bold text-xs h-9 bg-card border-border hover:bg-secondary/40 text-foreground transition-all"
                >
                  View Coupon Details
                </Button>
              </div>
            </div>
          </Card>

          {/* Status & Payment Interactive Controls */}
          <StatusManagementCard order={order} />

          {/* Quick Operations Admin Buttons */}
          <OrderActions order={order} />
        </div>
      </div>

      {/* Invoice HTML Preview Dialog Modal */}
      <InvoicePreviewDialog
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
}
