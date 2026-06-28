'use client';

import { useState } from 'react';
import { Order } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { CopyIcon, CheckIcon, PencilIcon } from 'lucide-react';
import { useTrans } from '@/shared/hooks/useTrans';

interface OrderShippingCardProps {
  order: Order;
  onEdit?: () => void;
}

export default function OrderShippingCard({ order, onEdit }: OrderShippingCardProps) {
  const getTrans = useTrans();
  const address = order.shippingAddress;
  const fullName = `${address?.firstName || ''} ${address?.lastName || ''}`.trim() || 'Guest Customer';
  
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trackingNumber = 'RX123456789SA';

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-sm font-bold text-foreground">Shipping Information</CardTitle>
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
              <span className="text-muted-foreground font-semibold">Full Name</span>
              <span className="text-foreground font-bold text-right">{fullName}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Phone</span>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-bold">{address?.phone || '88888888888'}</span>
                <button
                  onClick={() => copyToClipboard(address?.phone || '88888888888', setCopiedPhone)}
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {copiedPhone ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Country</span>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span className="text-sm shrink-0">🇸🇦</span>
                <span>{getTrans(address?.country?.name) || 'Saudi Arabia'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">City</span>
              <span className="text-foreground font-bold">{getTrans(address?.city?.name) || 'Al Bahla'}</span>
            </div>

            <div className="flex items-start justify-between text-xs font-medium border-b border-border/10 pb-2 gap-4">
              <span className="text-muted-foreground font-semibold shrink-0">Address</span>
              <span className="text-foreground font-bold text-right leading-normal">
                {address?.building ? `${address.building}, ` : ''}{address?.street || 'Al Bahla, Oman Road, Al Bahla District'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Postal Code</span>
              <span className="text-foreground font-bold">{address?.postalCode || '12345'}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Shipping Provider</span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded font-black tracking-wider border-none scale-90">ARAMEX</span>
                <span className="text-foreground font-bold">Aramex</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Shipping Method</span>
              <span className="text-foreground font-bold">Express Delivery</span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Tracking Number</span>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-bold font-mono text-[11px]">{trackingNumber}</span>
                <button
                  onClick={() => copyToClipboard(trackingNumber, setCopiedTracking)}
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {copiedTracking ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-b border-border/10 pb-2">
              <span className="text-muted-foreground font-semibold">Shipping Cost</span>
              <span className="text-foreground font-bold tabular-nums">
                {order.shippingAmount ? order.shippingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '915.00'} <span className="text-[9px] text-muted-foreground">{order.currency || 'SAR'}</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
