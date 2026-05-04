'use client';

import { use, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQueryState } from '@/shared/hooks/useQueryState';

import { useCoupons, useDeleteCoupon, useUpdateCoupon } from '@/features/marketing/hooks/useCoupons';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';

import { Coupon } from '@/types';
import { Switch } from '@/shared/ui/Switch';
import { useToast } from '@/shared/hooks/useToast';
import { Tooltip } from '@/shared/ui/Tooltip';


type ViewTab = 'active' | 'notActive';

const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, string>> = {
  active: { active: 'true' },
  notActive: { active: 'false' },
};


export default function CouponsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { getQueryParam, setQueryParams } = useQueryState();
  const locale = useLocale();
  const t = useTranslations('coupons');
  const tButtons = useTranslations('common.buttons');
  const router = useRouter();

  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const viewTab = (getQueryParam('tab', 'active') as ViewTab);

  // create query params
  const queryParams = useMemo(() => ({
    page, limit: 10, keywords: search, ...TAB_FILTER_PARAMS[viewTab]
  }), [page, search, viewTab]);

  const { data, isLoading, refetch } = useCoupons(queryParams);

  const { mutateAsync: deleteCouponAsync, isPending: deleteCouponPending } = useDeleteCoupon();
  const { mutateAsync: updateCouponAsync, isPending: updateCouponPending } = useUpdateCoupon();
  const confirmDialog = useConfirmDialog();
  const toast = useToast();

  const handlePageChange = useCallback((val: number) => {
    setQueryParams({ page: val });
  }, [setQueryParams]);

  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);

  const handleTabChange = useCallback((tabValue: string) => {
    setQueryParams({ tab: tabValue, page: 1 });
  }, [setQueryParams]);

  const handleStatusChange = useCallback(async (coupon: Coupon, newStatus: boolean) => {
    if (newStatus === undefined) return;
    try {
      await updateCouponAsync({
        id: coupon._id,
        data: { active: newStatus }
      });
      toast.success(t('messages.updateSuccess'));
      refetch()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('messages.updateError');
      toast.error(errorMessage);
    }
  }, [updateCouponAsync, toast, t, refetch]);



  const handleDelete = useCallback((id: string, name: string) => {
    confirmDialog.openDialog({
      title: t('messages.deleteConfirm'),
      message: t('messages.deleteConfirmWithName', { name }),
      onConfirm: async () => {
        await deleteCouponAsync(id);
        refetch();
      },
    });
  }, [confirmDialog, deleteCouponAsync, refetch, t]);

  const tabs = useMemo(() => [
    { key: 'active' as ViewTab, label: t('fields.active'), activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { key: 'notActive' as ViewTab, label: t('fields.inactive'), activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
  ], [t]);

  const columns = useMemo(() => [
    {
      header: t('fields.name'),
      className: "pl-6",
      render: (coupon: Coupon) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="font-bold text-base text-foreground font-mono group-hover:text-primary transition-colors">
            {coupon.name}
          </div>
          {coupon.slug && (
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">
              {coupon.slug}
            </span>
          )}
        </div>
      )
    },
    {
      header: t('fields.discount'),
      render: (coupon: Coupon) => (
        <div className="flex flex-col">
          <span className="font-black text-primary text-base">
            {coupon.type === 'percentage' ? `${coupon.discount}%` : formatCurrency(coupon.discount, locale)}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest opacity-70">
            {t(`fields.${coupon.type}`)}
          </span>
        </div>
      )
    },
    {
      header: t('fields.usage'),
      render: (coupon: Coupon) => (
        <div className="flex flex-col gap-1.5">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icons.Users className="w-4 h-4 opacity-40" />
            <span className="text-foreground font-bold">{coupon.usageCount || 0}</span>
            <span className="opacity-30">/</span>
            <span className="opacity-60 font-bold">{coupon.maxUsage || '∞'}</span>
          </div>
          {coupon.maxUsage && (
            <div className="w-28 h-1.5 bg-muted/50 rounded-full overflow-hidden ring-1 ring-border/5">
              <div
                className={cn(
                  "h-full transition-all duration-700 ease-out",
                  ((coupon.usageCount || 0) / coupon.maxUsage) > 0.8 ? "bg-orange-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(((coupon.usageCount || 0) / coupon.maxUsage) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      )
    },
    {
      header: t('fields.expires'),
      render: (coupon: Coupon) => {
        const isExpired = new Date(coupon.expires) < new Date();
        return (
          <div className={cn(
            "text-sm font-bold flex items-center gap-2 px-3 py-1 rounded-lg w-fit",
            isExpired ? "text-destructive bg-destructive/5" : "text-foreground/80 bg-muted/30"
          )}>
            <Icons.Calendar className="w-4 h-4 opacity-70" />
            {formatDate(coupon.expires)}
          </div>
        );
      }
    },
    {
      header: t('fields.status'),
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={coupon.active}
            onChange={(e) => handleStatusChange(coupon, e.target.checked)}
          />
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider",
            coupon.active !== false ? "text-success" : "text-muted-foreground"
          )}>
            {coupon.active !== false ? t('fields.active') : t('fields.inactive')}
          </span>
        </div>
      )
    },
    {
      header: tButtons('actions'),
      className: "ps-6 text-center",
      render: (coupon: Coupon) => (
        <div className="flex justify-center gap-2 transition-all duration-300">
          <Tooltip content={tButtons('edit')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-primary rounded-xl bg-background/50 border-border/40 hover:bg-primary/10 hover:text-primary/70 hover:border-primary/20 transition-all"
              onClick={() => router.push(`/${locale}/dashboard/coupons/${coupon._id}/edit`)}
              disabled={updateCouponPending || isLoading || deleteCouponPending}                   >
              <Icons.Edit className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content={tButtons('delete')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl bg-background/50 border-border/40 hover:bg-destructive/10 text-destructive hover:text-destructive/70 hover:border-destructive/20 transition-all"
              onClick={() => handleDelete(coupon._id, coupon.name)}
              isLoading={deleteCouponPending}
              disabled={deleteCouponPending || isLoading || updateCouponPending}
            >
              <Icons.Trash className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [t, tButtons, locale, router, handleDelete, deleteCouponPending, updateCouponPending]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createCoupon'),
          icon: <Icons.Plus className="w-4 h-4" />,
          onClick: () => router.push(`/${locale}/dashboard/coupons/create`),
          disabled: updateCouponPending || isLoading || deleteCouponPending
        }}
      />

      <div className="flex flex-col gap-4">
        <EntitySearchBar
          defaultValue={search}
          onSearch={handleSearch}
          placeholder={t('searchPlaceholder')}
        />

        <div className="border-b border-border/40 pb-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${viewTab === tab.key ? tab.activeClass : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <EntityDataTable<Coupon>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('emptyState.title'),
          description: t('emptyState.description'),
          createLink: () => router.push(`/${locale}/dashboard/coupons/create`),
          createLabel: t('createCoupon')
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={tButtons('delete')}
        cancelText={tButtons('cancel')}
        isDangerous={confirmDialog.isDangerous}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
