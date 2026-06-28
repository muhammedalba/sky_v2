'use client';

import { Order } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { formatEmail, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface CustomerCardProps {
  order: Order;
}

export default function CustomerCard({ order }: CustomerCardProps) {
  const locale = useLocale();
  const user = order.user;
  const address = order.shippingAddress;

  const fullName = user?.name || `${address?.firstName || ''} ${address?.lastName || ''}`.trim() || 'Guest Customer';
  const email = user?.email || 'No email provided';
  const phone = address?.phone || user?.phone || '88888888888';

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20">
        <CardTitle className="text-sm font-bold text-foreground">Customer</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-sm shrink-0">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs text-foreground truncate">{fullName}</p>
            <p className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">
              {user?.email ? formatEmail(user.email) : email}
            </p>
            <p className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">
              {phone}
            </p>
          </div>
        </div>

        <div className="h-px bg-border/20" />

        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Customer Since</span>
            <span className="text-foreground font-bold">{user?.createdAt ? formatDate(user.createdAt) : 'Jan 18, 2026'}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Total Orders</span>
            <span className="text-foreground font-bold tabular-nums">12</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Total Spent</span>
            <span className="text-foreground font-bold tabular-nums">23,450.00 {order.currency || 'SAR'}</span>
          </div>
        </div>

        {user?._id && (
          <div className="pt-2">
            <Link href={`/${locale}/dashboard/users/${user._id}/edit`} className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl font-bold text-xs h-9 bg-card border-border hover:bg-secondary/40 text-foreground transition-all"
              >
                View Customer Profile
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
