'use client';

import { use, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrder, useUpdateOrderStatus } from '@/hooks/api/useOrders';
import { orderStatusSchema, type OrderStatusInput } from '@/lib/validations/schemas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDateTime, getStatusColor, cn } from '@/lib/utils';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('orders');
  const tCommon = useTranslations('buttons');
  const tErrors = useTranslations('errors');
  const router = useRouter();

  const { data: order, isLoading } = useOrder(id);
  const updateStatusMutation = useUpdateOrderStatus();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderStatusInput>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: '',
    },
  });

  const currentStatus = watch('status');

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
           <Skeleton className="lg:col-span-2 h-[500px] rounded-[2rem]" />
           <Skeleton className="h-[400px] rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
         <div className="p-6 bg-secondary/20 rounded-full mb-4">
            <Icons.Orders className="w-12 h-12 text-muted-foreground" />
         </div>
         <h2 className="text-2xl font-black">Order not found</h2>
         <Button variant="link" onClick={() => router.back()}>Go back to orders</Button>
      </div>
    );
  }

  const statusOptions = [
    { value: 'pending', label: t('status.pending') || 'Pending' },
    { value: 'processing', label: t('status.processing') || 'Processing' },
    { value: 'shipped', label: t('status.shipped') || 'Shipped' },
    { value: 'delivered', label: t('status.delivered') || 'Delivered' },
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
             <Icons.Menu className="w-5 h-5 rotate-180" />
           </Button>
           <div>
             <div className="flex items-center gap-3">
               <h1 className="text-3xl font-black tracking-tight uppercase">Order #{order._id?.slice(-8)}</h1>
               <Badge className={cn("rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest border-none", getStatusColor(order.status))}>
                  {order.status || 'Unknown'}
               </Badge>
             </div>
             <p className="text-muted-foreground font-medium mt-1"> Placed on {formatDateTime(order.createdAt)}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl px-6 font-bold flex items-center gap-2">
              <Icons.Menu className="w-4 h-4" /> {/* Print icon replacement */}
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
                       {order.cartItems?.map((item: any, i: number) => (
                         <TableRow key={i} className="border-b last:border-0">
                           <TableCell>
                             <div className="flex items-center gap-4 py-2">
                                <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                                   {item.product?.imageCover ? (
                                      <img src={item.product.imageCover} alt={item.product.title} className="w-full h-full object-cover" />
                                   ) : (
                                      <Icons.Products className="w-6 h-6 m-3 text-muted-foreground" />
                                   )}
                                </div>
                                <div>
                                   <p className="font-bold text-sm">{item.product?.title || 'Unknown Product'}</p>
                                   <p className="text-xs text-muted-foreground font-medium capitalize">{item.color || 'Default Color'}</p>
                                </div>
                             </div>
                           </TableCell>
                           <TableCell className="text-center font-bold">x{item.count || 1}</TableCell>
                           <TableCell className="text-right text-muted-foreground font-medium">{formatCurrency(item.price)}</TableCell>
                           <TableCell className="text-right font-black">{formatCurrency(item.price * (item.count || 1))}</TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </div>
              <div className="p-8 bg-secondary/20 flex flex-col items-end space-y-3">
                 <div className="flex justify-between w-64 text-sm font-medium text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">{formatCurrency(order.totalOrderPrice || 0)}</span>
                 </div>
                 <div className="flex justify-between w-64 text-sm font-medium text-muted-foreground">
                    <span>Shipping Fee</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2">Free</Badge>
                 </div>
                 <div className="w-64 h-px bg-border my-2" />
                 <div className="flex justify-between w-64 text-xl font-black">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(order.totalOrderPrice || 0)}</span>
                 </div>
              </div>
           </Card>

           {/* Timeline / Additional Notes */}
           <Card className="border-none shadow-sm ring-1 ring-border/50">
             <CardHeader>
                <CardTitle className="text-lg font-bold">Notes from Customer</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="p-4 rounded-2xl bg-secondary/30 italic text-muted-foreground text-sm">
                   "No special instructions provided by the customer for this order."
                </div>
             </CardContent>
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
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
                      {order.user?.name?.charAt(0) || 'U'}
                   </div>
                   <div>
                      <p className="font-black text-foreground">{order.user?.name || 'Guest User'}</p>
                      <p className="text-xs text-muted-foreground font-medium">{order.user?.email || 'No email provided'}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-sm font-medium">
                      <div className="p-2 rounded-lg bg-secondary text-muted-foreground"><Icons.Users className="w-4 h-4" /></div>
                      <span className="text-foreground">{order.user?.phone || 'No phone number'}</span>
                   </div>
                   <div className="flex items-start gap-3 text-sm font-medium leading-relaxed">
                      <div className="p-2 rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary transition-colors mt-0.5 whitespace-nowrap"><Icons.Menu className="w-4 h-4" /></div> {/* Map pin icon replacement */}
                      <span className="text-foreground">
                         {order.shippingAddress?.details}, {order.shippingAddress?.city} <br />
                         {order.shippingAddress?.phone}
                      </span>
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                 <CardTitle className="text-lg font-bold">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/50">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                          <Icons.Menu className="w-4 h-4" /> {/* Checkmark replacement */}
                       </div>
                       <span className="text-green-700 dark:text-green-400 font-black text-sm uppercase tracking-wider">{order.paymentMethodType || 'CARD'}</span>
                    </div>
                    <Badge variant="outline" className="bg-white dark:bg-background border-green-200 text-green-600 font-bold uppercase text-[10px]">
                       {order.isPaid ? 'Success' : 'Pending'}
                    </Badge>
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
                   {errors.status && <div className="text-red-500 text-xs mt-1">{tErrors('required')}</div>}
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
