'use client';

import { useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSuppliers, useDeleteSupplier, useUpdateSupplier } from '@/features/suppliers/hooks/useSuppliers';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Switch } from '@/shared/ui/Switch';
import { Supplier } from '@/types';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { useToast } from '@/shared/hooks/useToast';
import { useRouter, useParams } from 'next/navigation';

type ViewTab = 'isActive' | 'notActive';

const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, string>> = {
  isActive: { isActive: 'true' },
  notActive: { isActive: 'false' },
};

export default function SuppliersPage() {
  const router = useRouter();
  const { locale } = useParams();

  // get page and search from query params
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const viewTab = (getQueryParam('tab', 'isActive') as ViewTab);

  // create query params
  const queryParams = useMemo(() => ({
    page, limit: 10, keywords: search, ...TAB_FILTER_PARAMS[viewTab]
  }), [page, search, viewTab]);

  // get data from api
  const { data, isLoading, refetch } = useSuppliers(queryParams);
  const { mutateAsync: deleteSupplierAsync, isPending: deleteSupplierPending } = useDeleteSupplier();
  const { mutateAsync: updateSupplierAsync, isPending: updateSupplierPending } = useUpdateSupplier();
;

  // handle page change
  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);
  const handleTabChange = useCallback((val: ViewTab) => setQueryParams({ tab: val, page: 1 }), [setQueryParams]);

  // translations
  const t = useTranslations('suppliers');
  const tMessages = useTranslations('suppliers.messages');
  const tButtons = useTranslations('buttons');

  const tabs = useMemo(() => [
    { key: 'isActive' as ViewTab, label: t('fields.active'), activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { key: 'notActive' as ViewTab, label: t('fields.inactive'), activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
  ], [t]);

  // hooks
  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage } = useConfirmDialog();
  const { success: toastSuccess, error: toastError } = useToast();

  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      const formData = new FormData();
      formData.append('isActive', String(!supplier.isActive));
      await updateSupplierAsync({ id: supplier._id, data: formData });
      toastSuccess(tMessages('updateSuccess'));
    } catch (error) {
      toastError(tMessages('updateError') || 'Error updating status');
    }
  };

  // handle search
  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);

  const handleDelete = useCallback((id: string, name: string) => {
    openDialog({
      title: tMessages('deleteConfirm'),
      message: tMessages('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        try {
          await deleteSupplierAsync(id);
          toastSuccess(tMessages('deleteSuccess'));
          refetch();
        } catch (error) {
          toastError(tMessages('deleteError') || 'Error while deleting');
          console.error(error);
        }
      },
    });
  }, [openDialog, deleteSupplierAsync, toastSuccess, toastError, refetch, tMessages]);

  const columns = useMemo(() => [
    {
      header: t('fields.logo'),
      className: "w-[100px] pl-6",
      render: (supplier: Supplier) => (
        <div className="h-14 w-14 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
          <ImageWithFallback
            src={supplier.avatar || ''}
            alt={supplier.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )
    },
    {
      header: t('fields.name'),
      render: (supplier: Supplier) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {supplier.name}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
            ID: {supplier._id.substring(0, 8)}...
          </span>
        </div>
      )
    },
    {
      header: t('fields.contact'),
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-2">
          {supplier.phone && (
            <Tooltip content={supplier.phone}>
              <a href={`tel:${supplier.phone}`} className="text-success hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted/50 border border-transparent hover:border-border">
                <Icons.Phone className="w-4 h-4" />
              </a>
            </Tooltip>
          )}
          {supplier.email && (
            <Tooltip content={supplier.email}>
              <a href={`mailto:${supplier.email}`} className="text-warning/80 hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted/50 border border-transparent hover:border-border">
                <Icons.Mail className="w-4 h-4" />
              </a>
            </Tooltip>
          )}
          {supplier.website && (
            <Tooltip content={String(supplier.website)}>
              <a href={String(supplier.website)} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/70 transition-colors p-1.5 rounded-md hover:bg-muted/50 border border-transparent hover:border-border">
                <Icons.Globe className="w-4 h-4" />
              </a>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      header: t('fields.address'),
      render: (supplier: Supplier) => (
        <div className="text-sm font-medium text-muted-foreground truncate max-w-[200px]" title={supplier.address}>
          {supplier.address}
        </div>
      )
    },
    {
      header: t('fields.status'),
      render: (supplier: Supplier) => (
        <Switch
          checked={supplier.isActive}
          onChange={() => handleToggleStatus(supplier)}
          disabled={updateSupplierPending || isLoading || deleteSupplierPending}
        />
      )
    },
    {
      header: t('fields.actions'),
      className: "pe-6 text-center",
      render: (supplier: Supplier) => (
        <div className="flex justify-center gap-2.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-lg hover:bg-primary/10 text-primary transition-colors "
            onClick={() => router.push(`/${locale}/dashboard/suppliers/${supplier.slug}/edit`)}
            disabled={deleteSupplierPending || isLoading || updateSupplierPending}
          >
            <Icons.Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-lg hover:bg-destructive/10 text-destructive transition-colors "
            onClick={() => handleDelete(supplier._id, supplier.name)}
            isLoading={deleteSupplierPending}
            disabled={deleteSupplierPending || isLoading || updateSupplierPending}
          >
            <Icons.Trash className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], [router, locale, deleteSupplierPending, isLoading, t, handleDelete]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createSupplier'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => router.push(`/${locale}/dashboard/suppliers/create`),
          disabled: deleteSupplierPending || isLoading || updateSupplierPending
        }}
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              disabled={deleteSupplierPending || isLoading || updateSupplierPending}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${viewTab === tab.key ? tab.activeClass : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <EntitySearchBar
        placeholder={t('searchPlaceholder')}
        onSearch={handleSearch}
        defaultValue={search}
        debounceMs={700}
        disabled={deleteSupplierPending || isLoading || updateSupplierPending}
      />

      <EntityDataTable<Supplier>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('emptyState.title'),
          description: t('emptyState.description'),
          createLink: () => router.push(`/${locale}/dashboard/suppliers/create`),
          createLabel: t('createSupplier')
        }}
      />

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
