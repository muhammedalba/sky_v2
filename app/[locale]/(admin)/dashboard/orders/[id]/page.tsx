'use client';

import { use, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrder, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { orderStatusSchema, type OrderStatusInput } from '@/features/orders/order.schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import { MenuIcon, OrdersIcon, ProductsIcon, UsersIcon } from "@/shared/ui/Icons";
import { Badge } from '@/shared/ui/Badge';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { formatCurrency, getStatusColor, cn, formatEmail, formatRelativeTime } from '@/lib/utils';
import { OrderItem } from '@/types';
import { useTrans } from '@/shared/hooks/useTrans';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('orders');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const getTrans = useTrans();
  const locale = useLocale();

  const { data: order, isLoading } = useOrder(id);
  const updateStatusMutation = useUpdateOrderStatus();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrderStatusInput>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: '',
    },
  });

  const currentStatus = useWatch({ control, name: 'status' });

  useEffect(() => {
    if (order?.status) {
      setValue('status', order.status);
    }
  }, [order, setValue]);

  const onSubmit = async (data: OrderStatusInput) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: data.status });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-12 w-1/4 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Skeleton className="lg:col-span-2 h-[500px] rounded-4xl" />
           <Skeleton className="h-[400px] rounded-4xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
         <div className="p-6 bg-secondary/20 rounded-full mb-4">
            <OrdersIcon className="w-12 h-12 text-muted-foreground" />
         </div>
         <h2 className="text-2xl font-black">Order not found</h2>
         <Button variant="link" onClick={() => router.back()}>Go back to orders</Button>
      </div>
    );
  }

  const statusOptions = [
    { value: 'pending_payment', label: t('status.pending_payment') || 'Pending Payment' },
    { value: 'pending', label: t('status.pending') || 'Pending' },
    { value: 'processing', label: t('status.processing') || 'Processing' },
    { value: 'shipped', label: t('status.shipped') || 'Shipped' },
    { value: 'delivered', label: t('status.delivered') || 'Delivered' },
    { value: 'completed', label: t('status.completed') || 'Completed' },
    { value: 'cancelled', label: t('status.cancelled') || 'Cancelled' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full hover:bg-secondary"
          >
             <MenuIcon className="w-5 h-5 rotate-180" />
           </Button>
           <div>
             <div className="flex items-center gap-3">
               <h1 className="text-3xl font-black tracking-tight uppercase">Order #{order._id?.slice(-8)}</h1>
               <Badge className={cn("rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest border-none", getStatusColor(order.status))}>
                  {order.status || 'Unknown'}
               </Badge>
             </div>
             <p className="text-muted-foreground font-medium mt-1"> Placed {formatRelativeTime(order.createdAt, locale)}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl px-6 font-bold flex items-center gap-2">
              <MenuIcon className="w-4 h-4" />
              Invoice
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Order Items */}
           <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
              <CardHeader className="bg-secondary/10 pb-6">
                 <CardTitle className="text-xl font-bold">Order Selection</CardTitle>
                 <CardDescription>Items purchased by the user</CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                       <TableRow className="bg-transparent border-b">
                         <TableHead className="font-bold">Item Description</TableHead>
                         <TableHead className="text-center font-bold">Qty</TableHead>
                         <TableHead className="text-right font-bold">Price</TableHead>
                         <TableHead className="text-right font-bold">Total</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {order.items?.map((item: OrderItem, i: number) => (
                         <TableRow key={i} className="border-b last:border-0">
                           <TableCell>
                             <div className="flex items-center gap-4 py-2">
                                <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden shrink-0">
                                   {item.productId?.imageCover ? (
                                      <div className="relative w-full h-full">
                                        <ImageWithFallback 
                                          src={item.productId.imageCover} 
                                          alt={getTrans(item.productId.title) || 'Product Image'} 
                                          fill
                                          className="object-cover" 
                                        />
                                      </div>
                                   ) : (
                                      <ProductsIcon className="w-6 h-6 m-3 text-muted-foreground" />
                                   )}
                                </div>
                                <div>
                                   <p className="font-bold text-sm line-clamp-1">{getTrans(item.productId?.title) || 'Unknown Product'}</p>
                                   {item.weight && <p className="text-xs text-muted-foreground font-medium mt-0.5">Weight: {item.weight}g</p>}
                                </div>
                             </div>
                           </TableCell>
                           <TableCell className="text-center font-bold">x{item.quantity || 1}</TableCell>
                           <TableCell className="text-right text-muted-foreground font-medium">{formatCurrency(item.price)}</TableCell>
                           <TableCell className="text-right font-black">{formatCurrency(item.totalPrice)}</TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </div>
              <div className="p-8 bg-secondary/20 flex flex-col items-end space-y-3">
                 <div className="flex justify-between w-64 text-sm font-medium text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">{formatCurrency(order.totalPrice || 0)}</span>
                 </div>
                 
                 {order.shippingAmount !== undefined && (
                   <div className="flex justify-between w-64 text-sm font-medium text-muted-foreground">
                      <span>Shipping Fee</span>
                      <span className="text-foreground">{order.shippingAmount === 0 ? <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20 border-none px-2">Free</Badge> : formatCurrency(order.shippingAmount)}</span>
                   </div>
                 )}

                 {!!order.taxAmount && order.taxAmount > 0 && (
                   <div className="flex justify-between w-64 text-sm font-medium text-muted-foreground">
                      <span>Taxes</span>
                      <span className="text-foreground">{formatCurrency(order.taxAmount)}</span>
                   </div>
                 )}

                 {!!order.paymentFees && order.paymentFees > 0 && (
                   <div className="flex justify-between w-64 text-sm font-medium text-muted-foreground">
                      <span>Payment Fees</span>
                      <span className="text-foreground">{formatCurrency(order.paymentFees)}</span>
                   </div>
                 )}

                 {!!order.discountAmount && order.discountAmount > 0 && (
                   <div className="flex justify-between w-64 text-sm font-medium text-success">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                   </div>
                 )}

                 <div className="w-64 h-px bg-border my-2" />
                 <div className="flex justify-between w-64 text-xl font-black">
                    <span>Grand Total</span>
                    <span className="text-primary">{formatCurrency(order.grandTotal || order.totalPrice || 0)}</span>
                 </div>
              </div>
           </Card>
        </div>

        {/* Sidebar: Customer & Logistics */}
        <div className="space-y-8">
           <Card className="border-none shadow-sm ring-1 ring-border/50">
             <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">Customer Details</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
                      {order.user?.name?.charAt(0) || order.shippingAddress?.firstName?.charAt(0) || 'G'}
                   </div>
                   <div>
                      <p className="font-black text-foreground">{order.user?.name || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Guest User'}</p>
                      <p className="text-xs text-muted-foreground font-medium">{order.user?.email ? formatEmail(order.user.email) : 'No email provided'}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-sm font-medium">
                      <div className="p-2 rounded-lg bg-secondary text-muted-foreground"><UsersIcon className="w-4 h-4" /></div>
                      <span className="text-foreground">{order.shippingAddress?.phone || order.user?.phone || 'No phone number'}</span>
                   </div>
                   <div className="flex items-start gap-3 text-sm font-medium leading-relaxed">
                      <div className="p-2 rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary transition-colors mt-0.5 whitespace-nowrap"><MenuIcon className="w-4 h-4" /></div>
                      <span className="text-foreground">
                         {order.shippingAddress?.building && `${order.shippingAddress.building}, `}
                         {order.shippingAddress?.street} <br />
                         {getTrans(order.shippingAddress?.city?.name) || (typeof order.shippingAddress?.city === 'string' ? order.shippingAddress.city : '')}, {getTrans(order.shippingAddress?.country?.name) || (typeof order.shippingAddress?.country === 'string' ? order.shippingAddress.country : '')} <br />
                         {order.shippingAddress?.postalCode}
                      </span>
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                 <CardTitle className="text-lg font-bold">Payment & Logistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex flex-col gap-1 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Method</span>
                    <div className="flex items-center justify-between">
                       <span className="font-black text-sm uppercase">{order.paymentMethodCode || 'N/A'}</span>
                       <Badge variant="outline" className={cn("font-bold uppercase text-[10px]", order.paymentStatus === 'paid' ? "border-success/30 text-success bg-success/5" : "border-warning/30 text-warning bg-warning/5")}>
                          {order.paymentStatus || 'Pending'}
                       </Badge>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-1 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Shipping Provider</span>
                    <div className="flex items-center justify-between">
                       <span className="font-black text-sm uppercase">Standard Delivery</span>
                       <Badge variant="secondary" className="font-bold text-[10px]">
                          {order.shippingProviderId ? 'Assigned' : 'Unassigned'}
                       </Badge>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                 <CardTitle className="text-lg font-bold">Update Logistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <form onSubmit={handleSubmit(onSubmit)}>
                   <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                         <Select
                            options={statusOptions}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-12 rounded-xl bg-secondary/30 border-none font-bold focus:ring-primary/20"
                         />
                      )}
                   />
                   {errors.status && <div className="text-destructive text-xs mt-1">{tErrors('required')}</div>}
                   <Button
                      type="submit"
                      className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/10 mt-4"
                      isLoading={updateStatusMutation.isPending}
                      disabled={currentStatus === order.status}
                   >
                      Apply New Status
                   </Button>
                 </form>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
