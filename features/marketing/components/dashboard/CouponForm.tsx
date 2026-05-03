'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { SearchableMultiSelect } from '@/shared/ui/form/SearchableMultiSelect';
import { SearchOption } from '@/shared/ui/form/SearchableSelect';

import { useCreateCoupon, useUpdateCoupon } from '@/features/marketing/hooks/useCoupons';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useProducts } from '@/features/products/hooks/useProducts';

import { Coupon } from '@/types';
import { CouponFormValues, couponSchema } from '@/features/marketing/marketing.schema';
import { cn } from '@/lib/utils';

interface CouponFormProps {
  initialData?: Coupon;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CouponForm({ initialData, onSuccess, onCancel }: CouponFormProps) {
  const { locale } = useParams();
  const t = useTranslations('coupons');
  const tButtons = useTranslations('common.buttons');

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<SearchOption[]>([]);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      name: initialData?.name || '',
      discount: initialData?.discount || 0,
      type: initialData?.type || 'percentage',
      maxUsage: initialData?.maxUsage ?? undefined,
      expires: initialData?.expires ? new Date(initialData.expires).toISOString().split('T')[0] : '',
      active: initialData?.active ?? true,
      minOrderAmount: initialData?.minOrderAmount || 0,
      maxOrderAmount: initialData?.maxOrderAmount || undefined,
      applyTo: initialData?.applyTo || 'all',
      applyItems: initialData?.applyItems || [],
    },
  });

  const applyTo = form.watch('applyTo');

  // Fetching data for SearchableMultiSelect based on applyTo
  const { data: brandsData, isLoading: isLoadingBrands } = useBrands(
    { keywords: searchTerm, limit: 20, fields: '_id,name' },
    { enabled: applyTo === 'brands' }
  );
  console.log(brandsData);

  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories(
    { keywords: searchTerm, limit: 20, fields: '_id,name' },
    { enabled: applyTo === 'categories' }
  );
  console.log(categoriesData);

  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    keywords: searchTerm,
    limit: 20,
    fields: '_id,title',
    enabled: applyTo === 'products'
  });
  console.log(productsData);

  const options = applyTo === 'brands'
    ? (brandsData?.data as SearchOption[])
    : applyTo === 'categories'
      ? (categoriesData?.data as SearchOption[])
      : applyTo === 'products'
        ? (productsData?.data?.map((p: any) => ({ ...p, name: p.title })) as SearchOption[])
        : [];

  const getDisplayValue = (opt: SearchOption) => {
    if (typeof opt.name === 'string') return opt.name;
    const localizedName = opt.name as { en?: string; ar?: string };
    return localizedName?.[locale as 'en' | 'ar'] || localizedName?.en || localizedName?.ar || '';
  };

  const onSubmit = async (data: CouponFormValues) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      // Error handled by mutation hook toasts
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Basic Information Section */}
      <div className="bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-border/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icons.Coupons className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {t('fields.basicInfo')}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
              <Icons.Tag className="w-3.5 h-3.5 text-primary" />
              {t('fields.name')}
            </label>
            <Input
              {...form.register('name')}
              placeholder="e.g. SUMMER50"
              className="h-12 bg-background/50 border-border/40 focus:bg-background transition-all uppercase font-mono font-bold"
              error={form.formState.errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
              <Icons.Edit className="w-3.5 h-3.5 text-primary" />
              {t('fields.type')}
            </label>
            <Select
              {...form.register('type')}
              options={[
                { value: 'percentage', label: t('fields.percentage') },
                { value: 'fixed', label: t('fields.fixed') },
              ]}
              className="h-12 bg-background/50 border-border/40 focus:bg-background transition-all"
              error={form.formState.errors.type?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
              <Icons.AiSpark className="w-3.5 h-3.5 text-primary" />
              {t('fields.discount')}
            </label>
            <div className="relative">
              <Input
                {...form.register('discount', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                className="h-12 bg-background/50 border-border/40 focus:bg-background transition-all pr-12 font-bold"
                error={form.formState.errors.discount?.message}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                {form.watch('type') === 'percentage' ? '%' : '$'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
              <Icons.Calendar className="w-3.5 h-3.5 text-primary" />
              {t('fields.expires')}
            </label>
            <Input
              {...form.register('expires')}
              type="date"
              className="h-12 bg-background/50 border-border/40 focus:bg-background transition-all"
              error={form.formState.errors.expires?.message}
            />
          </div>
        </div>
      </div>

      {/* Target Audience / Application Section */}
      <div className="relative z-20 bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-border/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Icons.Plus className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {t('fields.applyTo')}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Define which products or categories this coupon applies to
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
              <Icons.Check className="w-3.5 h-3.5 text-purple-500" />
              {t('fields.applyTo')}
            </label>
            <Select
              {...form.register('applyTo')}
              options={[
                { value: 'all', label: t('fields.options.all') },
                { value: 'products', label: t('fields.options.products') },
                { value: 'categories', label: t('fields.options.categories') },
                { value: 'brands', label: t('fields.options.brands') },
              ]}
              className="h-12 bg-background/50 border-border/40 focus:bg-background transition-all"
              onChange={(e) => {
                form.setValue('applyTo', e.target.value as any);
                form.setValue('applyItems', []);
                setSelectedItems([]);
              }}
            />
          </div>

          {applyTo !== 'all' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
                <Icons.Search className="w-3.5 h-3.5 text-purple-500" />
                {t('fields.applyItems')}
              </label>
              <SearchableMultiSelect
                label=""
                placeholder={t(`fields.options.${applyTo}`)}
                selectedOptions={selectedItems}
                onSelect={(opt) => {
                  const current = form.getValues('applyItems') || [];
                  if (!current.includes(opt._id)) {
                    const next = [...current, opt._id];
                    form.setValue('applyItems', next);
                    setSelectedItems([...selectedItems, opt]);
                  }
                }}
                onRemove={(id) => {
                  const current = form.getValues('applyItems') || [];
                  const next = current.filter(item => item !== id);
                  form.setValue('applyItems', next);
                  setSelectedItems(selectedItems.filter(item => item._id !== id));
                }}
                options={options}
                isLoading={isLoadingBrands || isLoadingCategories || isLoadingProducts}
                onSearch={setSearchTerm}
                getDisplayValue={getDisplayValue}
                error={form.formState.errors.applyItems?.message}
                icon={Icons.Search}
              />
            </div>
          )}
        </div>
      </div>

      {/* Conditions & Limits Section */}
      <div className="relative z-10 bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-border/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Icons.Shield className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {t('fields.conditions')}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Configure usage rules and restrictions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
              <Icons.Users className="w-3.5 h-3.5 text-orange-500" />
              {t('fields.maxUsage')}
            </label>
            <Input
              {...form.register('maxUsage', { valueAsNumber: true })}
              type="number"
              placeholder="Unlimited"
              className="h-12 bg-background/50 border-border/40 focus:bg-background transition-all"
              error={form.formState.errors.maxUsage?.message}
            />
          </div>

          {initialData && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
                <Icons.Check className="w-3.5 h-3.5 text-orange-500" />
                {t('fields.usageCount')}
              </label>
              <div className="h-12 bg-muted/20 border border-border/40 rounded-xl flex items-center px-4 font-bold text-primary">
                {initialData.usageCount || 0}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
              <Icons.Orders className="w-3.5 h-3.5 text-orange-500" />
              {t('fields.minOrderAmount')}
            </label>
            <Input
              {...form.register('minOrderAmount', { valueAsNumber: true })}
              type="number"
              placeholder="0"
              className="h-12 bg-background/50 border-border/40 focus:bg-background transition-all font-bold"
              error={form.formState.errors.minOrderAmount?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
              <Icons.Orders className="w-3.5 h-3.5 text-orange-500" />
              {t('fields.maxOrderAmount')}
            </label>
            <Input
              {...form.register('maxOrderAmount', { valueAsNumber: true })}
              type="number"
              placeholder="Unlimited"
              className="h-12 bg-background/50 border-border/40 focus:bg-background transition-all font-bold"
              error={form.formState.errors.maxOrderAmount?.message}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/10 md:col-span-2 ring-1 ring-border/5">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-foreground">
                {t('fields.active')}
              </label>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                Enable or disable this coupon immediately
              </p>
            </div>
            <Switch
              checked={form.watch('active')}
              onChange={(e) => form.setValue('active', e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto h-12 px-8 font-bold rounded-xl border-border/60 hover:bg-muted/50 transition-all active:scale-95"
        >
          {tButtons('cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={createMutation.isPending || updateMutation.isPending}
          className="w-full sm:w-auto h-12 px-10 font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 gap-2"
        >
          <Icons.Check className="w-5 h-5" />
          {initialData ? tButtons('save') : tButtons('create')}
        </Button>
      </div>
    </form>
  );
}
