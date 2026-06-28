'use client';

import { useState } from 'react';
import { Order } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { CopyIcon, CheckIcon, PencilIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OrderPaymentCardProps {
  order: Order;
  onEdit?: () => void;
}

export default function OrderPaymentCard({ order, onEdit }: OrderPaymentCardProps) {
  const [copiedTx, setCopiedTx] = useState(false);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const transactionId = order._id ? `trx_${order._id}` : 'trx_6a3aee342642737b';

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-sm font-bold text-foreground">Payment Information</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="rounded-xl font-bold text-xs h-8 px-3 bg-card border-border hover:bg-secondary/40 flex items-center gap-1.5"
        >
          <PencilIcon className="w-3 h-3 text-muted-foreground" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Payment Method</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded font-black tracking-wider border-none scale-90">Moyasar</span>
                <span className="text-foreground font-bold">Moyasar</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Payment Gateway</span>
              <span className="text-foreground font-bold">Moyasar</span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Transaction ID</span>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-bold font-mono text-[11px] truncate max-w-[150px]">
                  {transactionId}
                </span>
                <button
                  onClick={() => copyToClipboard(transactionId, setCopiedTx)}
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {copiedTx ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Payment Date</span>
              <span className="text-foreground font-bold">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Payment Status</span>
              <Badge className="rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase border-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {order.paymentStatus || 'Paid'}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Currency</span>
              <span className="text-foreground font-bold uppercase">{order.currency || 'SAR'}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Payment Fees</span>
              <span className="text-foreground font-bold tabular-nums">
                {(order.paymentFees || 5).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] text-muted-foreground">{order.currency || 'SAR'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Amount Paid</span>
              <span className="text-foreground font-bold tabular-nums">
                {(order.grandTotal || order.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] text-muted-foreground">{order.currency || 'SAR'}</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
