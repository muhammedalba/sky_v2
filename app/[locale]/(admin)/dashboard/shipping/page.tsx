'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useShippingProviders, useDeleteShippingProvider, useUpdateShippingProvider } from '@/features/shipping/hooks/useShippingProviders';
import { ShippingProvider } from '@/features/shipping/types';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import Modal from '@/shared/ui/Modal';
import ShippingProviderForm from '@/features/shipping/components/dashboard/ShippingProviderForm';
import { useTrans } from '@/shared/hooks/useTrans';
import { useToast } from '@/shared/hooks/useToast';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Switch } from '@/shared/ui/Switch';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { useParams } from 'next/navigation';

type ViewTab = 'all' | 'active' | 'inactive';

const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, string>> = {
  all: {},
  active: { isActive: 'true' },
  inactive: { isActive: 'false' },
};

export default function ShippingPage() {
  const { locale } = useParams();
  const t = useTranslations('shipping');
  const tCommon = useTranslations('common');
  const tMessages = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const getTrans = useTrans();
  const { success: toastSuccess, error: toastError } = useToast();

  // State management via URL
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const viewTab = (getQueryParam('tab', 'all') as ViewTab);

  // Query params for API
  const queryParams = useMemo(() => ({
    page,
    limit: 15,
    keywords: search,
    ...TAB_FILTER_PARAMS[viewTab]
  }), [page, search, viewTab]);

  // Data fetching
  const { data, isLoading, refetch } = useShippingProviders(queryParams);
  const { mutateAsync: deleteProviderAsync, isPending: deleteProviderPending } = useDeleteShippingProvider();
  const { mutateAsync: updateProviderAsync, isPending: updateProviderPending } = useUpdateShippingProvider();

  // Dialog & Modal state
  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage, isDangerous: isConfirmDangerous } = useConfirmDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);

  // Handlers
  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);
  const handleTabChange = useCallback((val: ViewTab) => setQueryParams({ tab: val, page: 1 }), [setQueryParams]);
  const handleSearch = useCallback((value: string) => setQueryParams({ search: value, page: 1 }), [setQueryParams]);

  const handleOpenModal = useCallback((provider?: ShippingProvider) => {
    if (provider) setEditingProvider(provider);
    else setEditingProvider(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProvider(null);
  }, []);

  const handleToggleStatus = async (provider: ShippingProvider) => {
    try {
      await updateProviderAsync({
        id: provider._id,
        data: { isActive: !provider.isActive }
      });
      toastSuccess(tMessages('success'));
      refetch();
    } catch (error: any) {
      toastError(error?.message || tMessages('error'));
    }
  };

  const handleDelete = useCallback((id: string, name: string) => {
    openDialog({
      title: tMessages('deleteConfirm'),
      message: tMessages('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        try {
          await deleteProviderAsync(id);
          toastSuccess(tMessages('success'));
          refetch();
        } catch (error: any) {
          toastError(error?.message || tMessages('error') || 'حدث خطأ أثناء الحذف');
        }
      },
    });
  }, [openDialog, deleteProviderAsync, toastSuccess, toastError, refetch, tMessages]);

  const tabs = useMemo(() => [
    { key: 'all' as ViewTab, label: tCommon('tabs.all'), activeClass: 'bg-primary text-white shadow-md shadow-primary/20' },
    { key: 'active' as ViewTab, label: tCommon('tabs.active'), activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { key: 'inactive' as ViewTab, label: tCommon('tabs.inactive'), activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
  ], [tCommon]);

  const columns = useMemo(() => [
    {
      header: t('fields.logo') || 'الشعار',
      className: "w-[100px] pl-6",
      render: (provider: ShippingProvider) => (
        <div className="h-14 w-14 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
          <ImageWithFallback
            src={provider.logo || ''}
            alt={getTrans(provider.name)}
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )
    },
    {
      header: t('fields.name') || 'شركة الشحن',
      render: (provider: ShippingProvider) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {getTrans(provider.name)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
            {provider.code}
          </span>
        </div>
      )
    },
    {
      header: t('fields.status') || 'الحالة',
      render: (provider: ShippingProvider) => (
        <Switch
          checked={provider.isActive}
          onCheckedChange={() => handleToggleStatus(provider)}
          disabled={updateProviderPending || isLoading}
        />
      )
    },
    {
      header: t('fields.actions') || 'إجراءات',
      className: "pe-6 text-center",
      render: (provider: ShippingProvider) => (
        <div className="flex justify-center gap-2.5">
          <Tooltip content={tButtons('edit')}>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl hover:bg-primary/10 text-primary transition-colors"
              onClick={() => handleOpenModal(provider)}
              disabled={deleteProviderPending || isLoading || updateProviderPending}
            >
              <Icons.Edit className="h-4.5 w-4.5" />
            </Button>
          </Tooltip>

          <Tooltip content={tButtons('delete')}>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
              onClick={() => handleDelete(provider._id, getTrans(provider.name))}
              isLoading={deleteProviderPending}
              disabled={deleteProviderPending || isLoading || updateProviderPending}
            >
              <Icons.Trash className="h-4.5 w-4.5" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [getTrans, handleOpenModal, handleDelete, deleteProviderPending, isLoading, updateProviderPending, t, tButtons]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title') || 'شركات الشحن'}
        subtitle={t('subtitle') || 'إدارة مزودي الشحن المتاحين في المتجر'}
        totalResults={tCommon('results.total', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createProvider') || 'إضافة شركة شحن',
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal(),
          disabled: deleteProviderPending || isLoading || updateProviderPending
        }}
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              disabled={deleteProviderPending || isLoading || updateProviderPending}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${viewTab === tab.key ? tab.activeClass : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <EntitySearchBar
        placeholder={t('searchPlaceholder') || 'بحث عن شركة شحن...'}
        onSearch={handleSearch}
        defaultValue={search}
        debounceMs={700}
        disabled={deleteProviderPending || isLoading || updateProviderPending}
      />

      <EntityDataTable<ShippingProvider>
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: tMessages('noData'),
          description: t('emptyDescription') || 'لا يوجد شركات شحن مضافة بعد.',
          createLink: () => handleOpenModal(),
          createLabel: t('createProvider') || 'إضافة شركة شحن'
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProvider ? t('editProvider') || 'تعديل شركة الشحن' : t('createProvider') || 'إضافة شركة شحن'}
        description={t('modalDescription') || 'قم بتعبئة بيانات شركة الشحن لتوفيرها للعملاء'}
      >
        <ShippingProviderForm
          editingProvider={editingProvider}
          onSuccess={() => {
            refetch();
            handleCloseModal();
          }}
          onCancel={handleCloseModal}
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
        isDangerous={isConfirmDangerous}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
