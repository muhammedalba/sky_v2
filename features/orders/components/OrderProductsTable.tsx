'use client';

import { Order, OrderItem } from '@/features/orders/types';
import { Card, CardHeader, CardTitle } from '@/shared/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/Table';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useTrans } from '@/shared/hooks/useTrans';
import { ProductsIcon } from '@/shared/ui/Icons';
import Link from 'next/link';

interface OrderProductsTableProps {
  order: Order;
}

export default function OrderProductsTable({ order }: OrderProductsTableProps) {
  const getTrans = useTrans();

  const totalItemsCount = order.items?.length || 0;

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20">
        <CardTitle className="text-sm font-bold text-foreground">
          Products ({totalItemsCount} items)
        </CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/10 border-b border-border/20">
              <TableHead className="font-bold text-xs text-muted-foreground py-3">Product</TableHead>
              <TableHead className="font-bold text-xs text-muted-foreground py-3">SKU</TableHead>
              <TableHead className="font-bold text-xs text-muted-foreground text-right py-3">Price</TableHead>
              <TableHead className="font-bold text-xs text-muted-foreground text-center py-3">Qty</TableHead>
              <TableHead className="font-bold text-xs text-muted-foreground text-right py-3">Discount</TableHead>
              <TableHead className="font-bold text-xs text-muted-foreground text-right py-3">Tax</TableHead>
              <TableHead className="font-bold text-xs text-muted-foreground text-right py-3">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items?.map((item: OrderItem, i: number) => {
              const productTitle = getTrans(item.productId?.title) || 'Unknown Product';
              const productSpecs = item.variantId?.attributes
                ? Object.entries(item.variantId.attributes)
                    .map(([k, v]) => `${k.toUpperCase()}: ${typeof v === 'object' && v !== null ? (v as { name?: string }).name || JSON.stringify(v) : v}`)
                    .join(', ')
                : '';

              const unitPrice = item.price || 0;
              const discount = (item as unknown as Record<string, number>).discountAmount || 0;
              const tax = (item as unknown as Record<string, number>).taxAmount || 0;
              const totalPrice = item.totalPrice || (unitPrice * item.quantity);

              return (
                <TableRow key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/5 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary/35 overflow-hidden shrink-0 relative border border-border/10 flex items-center justify-center">
                        {item.productId?.imageCover ? (
                          <ImageWithFallback
                            src={item.productId.imageCover}
                            alt={productTitle}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <ProductsIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate max-w-[200px]">
                          {productTitle}
                        </p>
                        {productSpecs && (
                          <p className="text-[10px] text-muted-foreground font-semibold truncate max-w-[200px] mt-0.5">
                            {productSpecs}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] font-bold text-muted-foreground py-4">
                    {item.variantId?.sku || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-foreground py-4 tabular-nums">
                    {unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] text-muted-foreground">{order.currency || 'SAR'}</span>
                  </TableCell>
                  <TableCell className="text-center text-xs font-bold text-foreground py-4 tabular-nums">
                    {item.quantity || 1}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-red-500 py-4 tabular-nums">
                    {discount > 0 ? `-${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00'} <span className="text-[9px] text-muted-foreground">{order.currency || 'SAR'}</span>
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-foreground py-4 tabular-nums">
                    {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] text-muted-foreground">{order.currency || 'SAR'}</span>
                  </TableCell>
                  <TableCell className="text-right text-xs font-black text-foreground py-4 tabular-nums">
                    {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] text-muted-foreground">{order.currency || 'SAR'}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="py-4 border-t border-border/20 text-center bg-muted/5">
        <Link
          href="/dashboard/products"
          className="text-xs font-bold text-primary hover:underline hover:text-primary/90 transition-colors"
        >
          View all products
        </Link>
      </div>
    </Card>
  );
}
