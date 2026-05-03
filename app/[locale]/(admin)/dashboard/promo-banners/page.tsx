'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePromoBanners, useDeletePromoBanner, useUpdatePromoBanner } from '@/features/marketing/hooks/usePromoBanner';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Button } from '@/shared/ui/Button';
import Modal from '@/shared/ui/Modal';
import { Icons } from '@/shared/ui/Icons';
import { PromoBanner } from '@/types';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useTrans } from '@/shared/hooks/useTrans';
import { useToast } from '@/shared/hooks/useToast';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import PromoBannerForm from '@/features/marketing/components/dashboard/PromoBannerForm';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { Switch } from '@/shared/ui/Switch';
import { cn } from '@/lib/utils';

type ViewTab = 'active' | 'notActive';

const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, string>> = {
  active: {},
  notActive: { isActive: 'false' },
};

export default function PromoBannersPage() {
  // get page and search from query params
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const viewTab = (getQueryParam('tab', 'active') as ViewTab);
  
  // create query params
  const queryParams = useMemo(() => ({
    page, limit: 10, keywords: search, all_langs: true, ...TAB_FILTER_PARAMS[viewTab]
  }), [page, search, viewTab]);

  // get data from api
  const { data, isLoading, refetch } = usePromoBanners(queryParams);
  const { mutateAsync: deletePromoBannerAsync, isPending: deletePromoBannerPending } = useDeletePromoBanner();
  const updateBanner = useUpdatePromoBanner();
;
  // handle page change
  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);
  
  // handle search
  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);

  const handleTabChange = useCallback((tabValue: string) => {
    setQueryParams({ tab: tabValue, page: 1 });
  }, [setQueryParams]);

  // translations
  const t = useTranslations('promoBanners');
  const tMessages = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const getTrans = useTrans();

  // hooks
  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage } = useConfirmDialog();
  const { success: toastSuccess, error: toastError } = useToast();

  // states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);

  // open modal for adding or editing
  const handleOpenModal = useCallback((banner?: PromoBanner) => {
    setEditingBanner(banner || null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingBanner(null);
  }, []);

  const handleStatusChange = useCallback(async (banner: PromoBanner, newStatus: boolean) => {
    try {
      await updateBanner.mutateAsync({
        id: banner._id,
        data: { isActive: newStatus }
      });
      toastSuccess(t('messages.updateSuccess'));
      refetch();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t('messages.error');
      toastError(errorMessage);
    }
  }, [updateBanner, toastSuccess, toastError, t, refetch]);

  const handleDelete = useCallback((id: string, text: string) => {
    openDialog({
      title: tMessages('deleteConfirm'),
      message: tMessages('deleteConfirmWithName', { name: text }),
      onConfirm: async () => {
        try {
          await deletePromoBannerAsync(id);
          toastSuccess(tMessages('success'));
          refetch();
        } catch (error) {
          toastError(tMessages('error') || 'حدث خطأ أثناء الحذف');
        }
      },
    });
  }, [openDialog, deletePromoBannerAsync, toastSuccess, toastError, refetch, tMessages]);

  const tabs = useMemo(() => [
    { key: 'active' as ViewTab, label: t('active'), activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { key: 'notActive' as ViewTab, label: t('inactive'), activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
  ], [t]);

  // columns configuration for data table
  const columns = useMemo(() => [
    {
      header: t('fields.text') || "Text (Preview)",
      className: "pl-6",
      render: (item: PromoBanner) => (
        <div className="flex flex-col gap-0.5 py-1">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {getTrans(item.text)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
            ID: {item._id.substring(0, 8)}...
          </span>
        </div>
      )
    },
    {
      header: t('fields.link') || "Link",
      render: (item: PromoBanner) => (
        item.link ? (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 group/link max-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover/link:bg-primary group-hover/link:text-white transition-all shrink-0">
              <Icons.ExternalLink className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground group-hover/link:text-primary transition-colors truncate ltr:font-mono">
              {item.link.replace(/^https?:\/\//, '')}
            </span>
          </a>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">
            ---
          </span>
        )
      )
    },
    {
      header: t('fields.status') || "Status",
      render: (item: PromoBanner) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={item.isActive}
            onChange={(e) => handleStatusChange(item, e.target.checked)}
          />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            item.isActive ? "text-success" : "text-muted-foreground"
          )}>
            {item.isActive ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
          </span>
        </div>
      )
    },
    {
      header: t('actions') || "Actions",
      className: "pe-6 text-center",
      render: (item: PromoBanner) => (
        <div className="flex justify-center gap-2.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            onClick={() => handleOpenModal(item)}
            disabled={deletePromoBannerPending || isLoading}
          >
            <Icons.Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            onClick={() => handleDelete(item._id, getTrans(item.text))}
            disabled={deletePromoBannerPending || isLoading}
            isLoading={deletePromoBannerPending}
          >
            <Icons.Trash className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], [getTrans, handleOpenModal, handleDelete, handleStatusChange, deletePromoBannerPending, isLoading, t]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title') || 'Promo Banners'}
        subtitle={t('subtitle') || 'Manage promo banners'}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('addBanner') || 'Add Banner',
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
        className='mb-8'
      />

      <div className="flex flex-col gap-4">
        <EntitySearchBar
          placeholder={t('searchPlaceholder') || 'Search promo banners...'}
          defaultValue={search}
          onSearch={handleSearch}
          debounceMs={700}
          disabled={deletePromoBannerPending || isLoading}
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

      <EntityDataTable<PromoBanner>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('emptyState.title') || "No banners found",
          description: t('emptyState.description') || "Announce seasonal offers or important news at the top of your shop.",
          icon: <Icons.PromoBanners className="h-10 w-10 text-muted-foreground/40" />,
          createLabel: t('addBanner') || "Add Banner",
          createLink: () => handleOpenModal()
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBanner ? (t('editBanner') || 'Edit Banner') : (t('addBanner') || 'Add Banner')}
        description={t('emptyState.description') || "Configure banner messages that appear at the top of your website."}
      >
        <PromoBannerForm
          editingPromoBanner={editingBanner}
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
        isDangerous={true}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
