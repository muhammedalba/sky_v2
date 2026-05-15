'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/hooks/useToast';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/shared/ui/Badge';
import { ShippingRate } from '@/features/shipping/types';
import { useDeleteShippingRate, useShippingRates, useUpdateShippingRate } from '@/features/shipping/hooks/useShippingRates';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import Modal from '@/shared/ui/Modal';
import ShippingRateForm from '@/features/shipping/components/dashboard/ShippingRateForm';
import { useQueryState } from '@/shared/hooks/useQueryState';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { Switch } from '@/shared/ui/Switch';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';

type ViewTab = 'all' | 'active' | 'inactive';

const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, string>> = {
  all: {},
  active: { isActive: 'true' },
  inactive: { isActive: 'false' },
};

export default function ShippingRatesPage() {
  const t = useTranslations('shippingRates');
  const tCommon = useTranslations('common');
  const tButtons = useTranslations('buttons');
  const { success: toastSuccess, error: toastError } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);

  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const viewTab = (getQueryParam('tab', 'all') as ViewTab);

  const queryParams = useMemo(() => ({
    page,
    limit: 10,
    keywords: search,
    ...TAB_FILTER_PARAMS[viewTab]
  }), [page, search, viewTab]);

  const { data, isLoading, refetch } = useShippingRates(queryParams);
  const { mutateAsync: deleteRateAsync, isPending: deleteRatePending } = useDeleteShippingRate();
  const { mutateAsync: updateRateAsync, isPending: updateRatePending } = useUpdateShippingRate();

  const {
    openDialog,
    closeDialog,
    handleConfirm,
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    title: confirmTitle,
    message: confirmMessage
  } = useConfirmDialog();

  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);
  const handleTabChange = useCallback((val: ViewTab) => setQueryParams({ tab: val, page: 1 }), [setQueryParams]);
  const handleSearch = useCallback((value: string) => setQueryParams({ search: value, page: 1 }), [setQueryParams]);

  const handleEdit = useCallback((rate: ShippingRate) => {
    setEditingRate(rate);
    setIsFormOpen(true);
  }, []);

  const handleToggleStatus = useCallback(async (rate: ShippingRate) => {
    try {
      await updateRateAsync({ id: rate._id, payload: { isActive: !rate.isActive, city: rate.city?._id } });
      toastSuccess(tCommon('messages.success'));
      refetch();
    } catch (err: any) {
      toastError(err.response.data.message || tCommon('errors.serverError'));
    }
  }, [updateRateAsync, toastSuccess, toastError, tCommon, refetch]);

  const handleDelete = useCallback((rate: ShippingRate) => {
    openDialog({
      title: tCommon('messages.deleteConfirm'),
      message: `${tCommon('messages.deleteConfirm')} (${(rate.provider as any)?.name?.ar || (rate.provider as any)?.name})`,
      onConfirm: async () => {
        try {
          await deleteRateAsync(rate._id);
          toastSuccess(tCommon('messages.success'));
          refetch();
        } catch (err: any) {
          toastError(tCommon('errors.serverError'));
        }
      },
    });
  }, [openDialog, deleteRateAsync, toastSuccess, toastError, refetch, tCommon]);

  const handleSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingRate(null);
    refetch();
  }, [refetch]);

  const tabs = useMemo(() => [
    { key: 'all' as ViewTab, label: tCommon('tabs.all'), activeClass: 'bg-primary text-white shadow-md shadow-primary/20' },
    { key: 'active' as ViewTab, label: tCommon('tabs.active'), activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { key: 'inactive' as ViewTab, label: tCommon('tabs.inactive'), activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
  ], [tCommon]);

  const columns = useMemo(() => [
    {
      header: t('fields.provider'),
      render: (item: ShippingRate, index: number) => {
        const provider = item.provider as any;
        const name = typeof provider?.name === 'string' ? provider.name : (provider?.name?.ar || provider?.name?.en || 'N/A');
        return (
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 shrink-0 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
              <ImageWithFallback
                src={provider.logo || ''}
                alt={name}
                fill
                sizes="48px"
                loading={index < 5 ? "eager" : "lazy"}
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="font-bold text-foreground">{name}</div>
          </div>
        );
      },
    },
    {
      header: t('fields.country'),
      render: (item: ShippingRate) => {
        const country = (item.country as any)?.name?.ar || (item.country as any)?.name || t('globalFallback');
        const region = (item.region as any)?.name?.ar || (item.region as any)?.name;
        const city = (item.city as any)?.name?.ar || (item.city as any)?.name;

        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-primary text-sm">{country}</span>
            {region && <span className="text-xs text -foreground flex items-center gap-1">
              <Icons.ChevronRight className="w-2.5 h-2.5 rtl:rotate-180" /> {region}
            </span>}
            {city && <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icons.ChevronRight className="w-2.5 h-2.5 rtl:rotate-180" /> {city}
            </span>}
          </div>
        );
      },
    },
    {
      header: t('fields.basePrice'),
      render: (item: ShippingRate) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg w-fit">
            {formatCurrency(item.basePrice)}
          </span>
          <span className="text-[10px] text-muted-foreground px-1">
            {t('fields.baseWeight')}: {item.baseWeight} kg
          </span>
        </div>
      ),
    },
    {
      header: t('fields.additionalKgPrice'),
      render: (item: ShippingRate) => (
        <span className="font-semibold text-green-600 bg-green-500/5 px-2 py-1 rounded-lg">
          +{formatCurrency(item.additionalKgPrice)}
        </span>
      ),
    },
    {
      header: t('fields.estimatedDays'),
      render: (item: ShippingRate) => (
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Icons.Clock className="w-4 h-4" />
          {item.estimatedDays || '-'}
        </div>
      ),
    },
    {
      header: t('fields.isActive'),
      render: (item: ShippingRate) => (
        <Switch
          checked={item.isActive}
          onCheckedChange={() => handleToggleStatus(item)}
          disabled={updateRatePending || isLoading}
        />
      ),
    },
    {
      header: t('fields.actions'),
      className: "pe-6 text-center",
      render: (item: ShippingRate) => (
        <div className="flex justify-center gap-2.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            onClick={() => handleEdit(item)}
            disabled={isLoading || updateRatePending}
          >
            <Icons.Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            onClick={() => handleDelete(item)}
            disabled={isLoading || deleteRatePending}
          >
            <Icons.Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [t, handleEdit, handleDelete, handleToggleStatus, updateRatePending, isLoading, deleteRatePending, tCommon]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('description')}
        totalResults={tCommon('results.total', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createRate'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => {
            setEditingRate(null);
            setIsFormOpen(true);
          }
        }}
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <Button variant="ghost"
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              disabled={isLoading}
              className={`${viewTab === tab.key ? tab.activeClass : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <EntitySearchBar
        placeholder={t('searchPlaceholder')}
        onSearch={handleSearch}
        defaultValue={search}
        debounceMs={700}
        disabled={isLoading}
      />

      <EntityDataTable<ShippingRate>
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('empty.title'),
          description: t('empty.description'),
          createLink: () => {
            setEditingRate(null);
            setIsFormOpen(true);
          },
          createLabel: t('createRate')
        }}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRate ? t('editRate') : t('createRate')}
        description={t('modalDescription')}
      >
        <ShippingRateForm
          editingRate={editingRate}
          onSuccess={handleSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={tButtons('confirm')}
        cancelText={tButtons('cancel')}
        isDangerous={true}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
