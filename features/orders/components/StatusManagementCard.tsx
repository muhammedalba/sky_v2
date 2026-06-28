'use client';

import { useState } from 'react';
import { Order } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import { useTranslations } from 'next-intl';
import { useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { Loader2Icon, CheckCircle2Icon } from 'lucide-react';

interface StatusManagementCardProps {
  order: Order;
}

export default function StatusManagementCard({ order }: StatusManagementCardProps) {
  const t = useTranslations('orders');
  const updateStatusMutation = useUpdateOrderStatus();

  const [orderStatus, setOrderStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'PENDING');
  const [shippingStatus, setShippingStatus] = useState('pending');

  const orderStatusOptions = [
    { value: 'pending_payment', label: t('status.pending_payment') || 'Pending Payment' },
    { value: 'pending', label: t('status.pending') || 'Pending' },
    { value: 'processing', label: t('status.processing') || 'Processing' },
    { value: 'shipped', label: t('status.shipped') || 'Shipped' },
    { value: 'delivered', label: t('status.delivered') || 'Delivered' },
    { value: 'completed', label: t('status.completed') || 'Completed' },
    { value: 'cancelled', label: t('status.cancelled') || 'Cancelled' },
  ];

  const paymentStatusOptions = [
    { value: 'INITIATED', label: 'Initiated' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PAID', label: 'Paid' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REFUNDED', label: 'Refunded' },
  ];

  const shippingStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'returned', label: 'Returned' },
  ];

  const handleUpdate = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: order._id,
        status: orderStatus,
        paymentStatus,
      });
      alert('Status updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const isFormDirty =
    orderStatus !== order.status ||
    paymentStatus !== (order.paymentStatus || 'PENDING');

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20">
        <CardTitle className="text-sm font-bold text-foreground">Status Management</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Order Status
            </label>
            <Select
              options={orderStatusOptions}
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="h-10 rounded-xl bg-secondary/35 border-none font-bold text-xs focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Payment Status
            </label>
            <Select
              options={paymentStatusOptions}
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="h-10 rounded-xl bg-secondary/35 border-none font-bold text-xs focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Shipping Status
            </label>
            <Select
              options={shippingStatusOptions}
              value={shippingStatus}
              onChange={(e) => setShippingStatus(e.target.value)}
              className="h-10 rounded-xl bg-secondary/35 border-none font-bold text-xs focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            size="sm"
            onClick={handleUpdate}
            disabled={updateStatusMutation.isPending || !isFormDirty}
            className="w-full rounded-xl font-bold text-xs h-10 bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center gap-1.5"
          >
            {updateStatusMutation.isPending ? (
              <>
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                Updating Status
              </>
            ) : (
              <>
                <CheckCircle2Icon className="w-3.5 h-3.5" />
                Update Status
              </>
            )}
          </Button>
          <p className="text-[9px] text-muted-foreground font-semibold text-center mt-2.5">
            Status changes will be saved immediately
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
