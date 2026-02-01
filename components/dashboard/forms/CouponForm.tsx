'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreateCoupon, useUpdateCoupon } from '@/hooks/api/useCoupons';
import { useRouter } from 'next/navigation';
import { Coupon } from '@/types';


const couponSchema = z.object({
  name: z.string().min(3, 'Coupon code is required (min 3 characters)'),
  discount: z.number().min(1, 'Discount must be at least 1'),
  type: z.enum(['percentage', 'fixed']),
  limit: z.number().optional(),
  expires: z.string().optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
  initialData?: Coupon;
  locale: string;
}

export default function CouponForm({ initialData, locale }: CouponFormProps) {
  const router = useRouter();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      name: initialData?.name || '',
      discount: initialData?.discount || 0,
      type: initialData?.type || 'percentage',
      limit: initialData?.limit || undefined,
      expires: initialData?.expires ? new Date(initialData.expires).toISOString().split('T')[0] : '',
    },
  });

  const onSubmit = async (data: CouponFormValues) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      router.push(`/${locale}/dashboard/coupons`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Coupon Code</label>
            <Input {...form.register('name')} placeholder="SUMMER2024" className="uppercase" />
            {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Amount</label>
            <Input 
              {...form.register('discount', { valueAsNumber: true })} 
              type="number" 
              placeholder="10" 
            />
            {form.formState.errors.discount && <p className="text-red-500 text-sm">{form.formState.errors.discount.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select {...form.register('type')} className="w-full h-10 border rounded-lg px-3 bg-background">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Usage Limit</label>
            <Input 
              {...form.register('limit', { valueAsNumber: true })} 
              type="number" 
              placeholder="100 (optional)" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Expiry Date</label>
            <Input 
              {...form.register('expires')} 
              type="date" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {initialData ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
