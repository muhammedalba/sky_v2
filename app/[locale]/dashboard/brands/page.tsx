'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useBrands, useDeleteBrand } from '@/hooks/api/useBrands';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import Modal from '@/shared/ui/Modal';
import BrandForm from '@/features/brands/components/dashboard/BrandForm';
import { useTrans } from '@/hooks/useTrans';
import { Brand } from '@/types';

export default function BrandsPage() {
  const t = useTranslations('brands');
  const tCommon = useTranslations('messages');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const getTrans = useTrans();
  const confirmDialog = useConfirmDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const { data, isLoading, refetch } = useBrands({ page, limit: 10, keywords: search,all_langs:true});
  const deleteMutation = useDeleteBrand();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleOpenModal = useCallback((brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
    } else {
      setEditingBrand(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingBrand(null);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    confirmDialog.openDialog({
      title: tCommon('deleteItem', { item: t('entityLabel') }),
      message: tCommon('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        refetch();
      },
    });
  }, [confirmDialog, deleteMutation, refetch, t, tCommon]);

  const columns = useMemo(() => [
    {
      header: t('fields.image'),
      className: "w-[100px] pl-6",
      render: (brand: Brand) => (
        <div className="h-14 w-14 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
          <ImageWithFallback
            src={brand.image || ''}
            alt={getTrans(brand.name)}
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )
    },
    {
      header: t('fields.name'),
      render: (brand: Brand) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {getTrans(brand.name)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
            ID: {brand._id.substring(0, 8)}...
          </span>
        </div>
      )
    },
    {
      header: t('fields.actions'),
      className: "pr-6 text-right",
      render: (brand: Brand) => (
        <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
            onClick={() => handleOpenModal(brand)}
          >
            {t('buttons.edit')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
            onClick={() => handleDelete(brand._id, getTrans(brand.name))}
            isLoading={deleteMutation.isPending}
          >
            {t('buttons.delete')}
          </Button>
        </div>
      )
    }
  ], [t, getTrans, handleOpenModal, handleDelete, deleteMutation.isPending]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={{
          label: t('createBrand'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
      />

      <EntitySearchBar
        placeholder={t('searchPlaceholder')}
        onSearch={handleSearch}
      />

      <EntityDataTable<Brand>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={setPage}
        columns={columns}
        emptyState={{
          title: tCommon('noData'),
          description: "Try adjusting your search or create a new brand to get started.",
          createLink: undefined,
          createLabel: t('createBrand')
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBrand ? t('editBrand') : t('createBrand')}
        description="Organize your store by creating meaningful product brands."
      >
        <BrandForm
          editingBrand={editingBrand}
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
