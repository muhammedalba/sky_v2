'use client';

import { useState } from 'react';
import { Order } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useDeleteOrder } from '@/features/orders/hooks/useOrders';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  RotateCcwIcon,
  CopyPlusIcon,
  ArchiveIcon,
  MailIcon,
  TagIcon,
  PrinterIcon,
  XCircleIcon,
  Loader2Icon,
  AlertTriangleIcon,
  CheckCircle2Icon
} from 'lucide-react';

interface OrderActionsProps {
  order: Order;
}

export default function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const locale = useLocale();
  const deleteOrderMutation = useDeleteOrder();

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCancelConfirm = async () => {
    try {
      await deleteOrderMutation.mutateAsync(order._id);
      setIsCancelOpen(false);
      router.push(`/${locale}/dashboard/orders`);
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const triggerMockAction = (actionName: string, label: string) => {
    setActionLoading(actionName);
    setTimeout(() => {
      setActionLoading(null);
      alert(`${label} action executed successfully!`);
    }, 1200);
  };

  return (
    <>
      <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/20">
          <CardTitle className="text-sm font-bold text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => triggerMockAction('refund', 'Refund Order')}
            disabled={actionLoading !== null}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            {actionLoading === 'refund' ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <RotateCcwIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            Refund Order
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => triggerMockAction('duplicate', 'Duplicate Order')}
            disabled={actionLoading !== null}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            {actionLoading === 'duplicate' ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <CopyPlusIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            Duplicate Order
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => triggerMockAction('archive', 'Archive Order')}
            disabled={actionLoading !== null}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            {actionLoading === 'archive' ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <ArchiveIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            Archive Order
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => triggerMockAction('email', 'Send Email')}
            disabled={actionLoading !== null}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            {actionLoading === 'email' ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <MailIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            Send Email to Customer
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => triggerMockAction('label', 'Generate Shipping Label')}
            disabled={actionLoading !== null}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            {actionLoading === 'label' ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <TagIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            Generate Shipping Label
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => triggerMockAction('packing', 'Print Packing Slip')}
            disabled={actionLoading !== null}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-secondary/40 text-foreground"
          >
            {actionLoading === 'packing' ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <PrinterIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            Print Packing Slip
          </Button>

          <div className="h-px bg-border/40 my-1.5" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCancelOpen(true)}
            disabled={actionLoading !== null}
            className="w-full rounded-xl font-bold text-xs h-9 px-3 flex items-center justify-start gap-2.5 hover:bg-red-500/10 text-red-600 transition-colors"
          >
            <XCircleIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
            Cancel Order
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                  <AlertTriangleIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Cancel Transaction</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to cancel and delete Order{' '}
                <span className="font-bold text-foreground">#{order._id?.slice(-8).toUpperCase()}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-muted/30 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCancelOpen(false)}
                className="rounded-xl font-bold px-4"
              >
                Go Back
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelConfirm}
                disabled={deleteOrderMutation.isPending}
                className="rounded-xl font-bold px-5 flex items-center gap-1.5"
              >
                {deleteOrderMutation.isPending ? (
                  <>
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                    Cancelling
                  </>
                ) : (
                  <>
                    <CheckCircle2Icon className="w-3.5 h-3.5" />
                    Confirm Cancel
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
