'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/hooks/useToast';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Tax, useTaxes, useDeleteTax, useUpdateTax } from '@/features/taxes/hooks/useTaxes';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import Modal from '@/shared/ui/Modal';
import TaxForm from '@/features/taxes/components/TaxForm';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { Switch } from '@/shared/ui/Switch';
import { useParams } from 'next/navigation';

type ViewTab = 'all' | 'active' | 'inactive';

const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, any>> = {
  all: {},
  active: { isActive: true },
  inactive: { isActive: false },
};

export default function TaxesPage() {
  const t = useTranslations('taxes');
  const tCommon = useTranslations('common');
  const tButtons = useTranslations('buttons');
  const { locale } = useParams();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);

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

  const { data, isLoading, refetch } = useTaxes(queryParams);
  const { mutateAsync: deleteTaxAsync, isPending: deleteTaxPending } = useDeleteTax();
  const { mutateAsync: updateTaxAsync, isPending: updateTaxPending } = useUpdateTax();

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

  const handleEdit = useCallback((tax: Tax) => {
    setEditingTax(tax);
    setIsFormOpen(true);
  }, []);

  const handleToggleStatus = useCallback(async (tax: Tax) => {
    try {
      await updateTaxAsync({ id: tax._id, data: { isActive: !tax.isActive } });
      toastSuccess(t('updateSuccess') || 'Status updated');
      refetch();
    } catch (err: any) {
      toastError(t('updateError') || 'Error updating status');
    }
  }, [updateTaxAsync, toastSuccess, toastError, t, refetch]);

  const handleDelete = useCallback((tax: Tax) => {
    openDialog({
      title: t('deleteConfirm'),
      message: `${t('deleteConfirm')} (${tax.name})`,
      onConfirm: async () => {
        try {
          await deleteTaxAsync(tax._id);
          toastSuccess(t('deleteSuccess'));
          refetch();
        } catch (err: any) {
          toastError(t('deleteError'));
        }
      },
    });
  }, [openDialog, deleteTaxAsync, toastSuccess, toastError, refetch, t]);

  const handleSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingTax(null);
    refetch();
  }, [refetch]);

  const tabs = useMemo(() => [
    { key: 'all' as ViewTab, label: tCommon('tabs.all'), activeClass: 'bg-primary text-white shadow-md shadow-primary/20' },
    { key: 'active' as ViewTab, label: tCommon('tabs.active'), activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { key: 'inactive' as ViewTab, label: tCommon('tabs.inactive'), activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
  ], [tCommon]);

  const columns = useMemo(() => [
    {
      header: t('fields.name'),
      render: (item: Tax) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {item.name}
          </span>
          {item.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
          )}
        </div>
      ),
    },
    {
      header: t('fields.percentage'),
      render: (item: Tax) => (
        <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">
          {item.percentage}%
        </span>
      ),
    },
    {
      header: t('fields.country'),
      render: (item: Tax) => {
        if (!item.country) {
          return (
            <Badge variant="secondary" className="font-medium">{t('globalFallback')}</Badge>
          );
        }
        const country = item.country as any;
        return (
          <span className="font-medium text-muted-foreground">{country.name?.ar || country.name || '-'}</span>
        );
      },
    },
    {
      header: t('fields.isIncludedInPrice'),
      render: (item: Tax) => (
        <Badge variant={item.isIncludedInPrice ? 'default' : 'outline'} className="font-medium">
          {item.isIncludedInPrice ? t('included') : t('excluded')}
        </Badge>
      ),
    },
    {
      header: t('fields.isActive'),
      render: (item: Tax) => (
        <Switch
          checked={item.isActive}
          onCheckedChange={() => handleToggleStatus(item)}
          disabled={updateTaxPending || isLoading}
        />
      ),
    },
    {
      header: t('fields.actions'),
      className: "pe-6 text-center",
      render: (item: Tax) => (
        <div className="flex justify-center gap-2.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            onClick={() => handleEdit(item)}
            disabled={isLoading || updateTaxPending}
          >
            <Icons.Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            onClick={() => handleDelete(item)}
            disabled={isLoading || deleteTaxPending}
          >
            <Icons.Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [t, handleEdit, handleDelete, handleToggleStatus, updateTaxPending, isLoading, deleteTaxPending]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('description')}
        totalResults={tCommon('results.total', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createTax'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => {
            setEditingTax(null);
            setIsFormOpen(true);
          }
        }}
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              disabled={isLoading}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${viewTab === tab.key ? tab.activeClass : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <EntitySearchBar
        placeholder={t('searchPlaceholder') || 'Search taxes...'}
        onSearch={handleSearch}
        defaultValue={search}
        debounceMs={700}
        disabled={isLoading}
      />

      <EntityDataTable<Tax>
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('empty.title'),
          description: t('empty.description'),
          createLink: () => {
            setEditingTax(null);
            setIsFormOpen(true);
          },
          createLabel: t('createTax')
        }}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTax ? t('editTax') : t('createTax')}
        description={t('modalDescription')}
      >
        <TaxForm
          editingTax={editingTax}
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
