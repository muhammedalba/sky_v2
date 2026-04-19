'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePromoBanners, useDeletePromoBanner } from '@/hooks/api/usePromoBanner';
import { Button } from '@/components/ui/Button';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { PromoBanner } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTrans } from '@/hooks/useTrans';
import EntityPageHeader from '@/components/dashboard/EntityPageHeader';
import EntitySearchBar from '@/components/dashboard/EntitySearchBar';
import Modal from '@/components/ui/Modal';
import PromoBannerForm from '@/components/dashboard/forms/PromoBannerForm';
import { useToast } from '@/hooks/useToast';

export default function PromoBannersPage() {
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();
  const t = useTranslations('promoBanners');
  const tCommon = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);

  const { data, isLoading, refetch } = usePromoBanners({ all_langs: true });
  const deleteMutation = useDeletePromoBanner();

  const handleOpenModal = useCallback((banner?: PromoBanner) => {
    if (banner) {
      setEditingBanner(banner);
    } else {
      setEditingBanner(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingBanner(null);
  }, []);

  const handleDelete = useCallback(async (id: string, text: string) => {
    confirmDialog.openDialog({
      title: 'Delete Banner',
      message: `Are you sure you want to delete "${text}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        toast.success(tCommon('success'));
        refetch();
      },
    });
  }, [confirmDialog, deleteMutation, refetch, tCommon, toast]);

  const columns = useMemo(() => [
    {
      header: "Text (Preview)",
      className: "pl-6",
      render: (item: PromoBanner) => (
        <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
          {getTrans(item.text)}
        </span>
      )
    },
    {
      header: "Status",
      render: (item: PromoBanner) => (
        <Badge variant={item.isActive ? 'secondary' : 'destructive'} className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider">
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "pr-6 text-right",
      render: (item: PromoBanner) => (
        <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
            onClick={() => handleOpenModal(item)}
          >
            {tButtons('edit')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
            onClick={() => handleDelete(item._id, getTrans(item.text))}
            isLoading={deleteMutation.isPending}
          >
            {tButtons('delete')}
          </Button>
        </div>
      )
    }
  ], [getTrans, handleDelete, handleOpenModal, tButtons, deleteMutation.isPending]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader 
        title={t('title') || 'Promo Banners'}
        subtitle={t('subtitle')}
        action={{
          label: t('addBanner'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
      />

      <EntitySearchBar 
        placeholder={t('searchPlaceholder')}
        onSearch={() => {}} // Local filters if needed
      />

      <EntityDataTable<PromoBanner>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={() => {}}
        columns={columns}
        emptyState={{
          title: "No banners found",
          description: "Announce seasonal offers or important news at the top of your shop.",
          createLink: undefined,
          createLabel: "Add Banner"
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBanner ? 'Edit Banner' : 'Add Banner'}
        description="Configure banner messages that appear at the top of your website."
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
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
