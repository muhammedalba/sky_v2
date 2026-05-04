'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useBrands, useDeleteBrand } from '@/features/brands/hooks/useBrands';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import Modal from '@/shared/ui/Modal';
import BrandForm from '@/features/brands/components/dashboard/BrandForm';
import { useTrans } from '@/shared/hooks/useTrans';
import { Brand } from '@/types';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { useToast } from '@/shared/hooks/useToast';
import { Tooltip } from '@/shared/ui/Tooltip';

export default function BrandsPage() {
  // get page and search from query params
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  // create query params
  const queryParams = useMemo(() => ({
    page, limit: 10, keywords: search, all_langs: true
  }), [page, search]);

  // get data from api
  const { data, isLoading, refetch } = useBrands(queryParams);
  const { mutateAsync: deleteBrandAsync, isPending: deleteBrandPending } = useDeleteBrand();

  // handle page change
  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);
  // translations
  const t = useTranslations('brands');
  const tMessages = useTranslations('messages');
  const tButtons = useTranslations('buttons');

  const getTrans = useTrans();
  // hooks
  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage, isDangerous: isConfirmDangerous } = useConfirmDialog();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);


  // handle search
  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);

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


  const handleDelete = useCallback((id: string, name: string) => {
    openDialog({
      title: tMessages('deleteConfirm'),
      message: tMessages('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        try {
          await deleteBrandAsync(id);;
          toastSuccess(tMessages('success'));
          refetch();
        } catch (error) {
          toastError(tMessages('error') || 'حدث خطأ أثناء الحذف');
        }
      },
    });
  }, [openDialog, deleteBrandAsync, toastSuccess, toastError, refetch]);

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
      className: "pe-6 text-center",
      render: (brand: Brand) => (
        <div className="flex justify-center gap-2 transition-all duration-300">
          <Tooltip content={tButtons('edit')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-primary rounded-xl bg-background/50 border-border/40 hover:bg-primary/10 hover:text-primary/70 hover:border-primary/20 transition-all"
              onClick={() => handleOpenModal(brand)}
              disabled={deleteBrandPending || isLoading || isConfirmLoading}                   >
              <Icons.Edit className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content={tButtons('delete')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl bg-background/50 border-border/40 hover:bg-destructive/10 text-destructive hover:text-destructive/70 hover:border-destructive/20 transition-all"
              onClick={() => handleDelete(brand._id, getTrans(brand.name))}
              isLoading={deleteBrandPending}
              disabled={deleteBrandPending || isLoading || isConfirmLoading}
            >
              <Icons.Trash className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [getTrans, handleOpenModal, handleDelete, deleteBrandPending, isLoading]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createBrand'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
      />

      <EntitySearchBar
        placeholder={t('searchPlaceholder')}
        onSearch={handleSearch}
        defaultValue={search}
        debounceMs={700}
        disabled={deleteBrandPending || isLoading}

      />

      <EntityDataTable<Brand>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: tMessages('noData'),
          description: t('emptyState.description'),
          createLink: () => handleOpenModal(),
          createLabel: t('createBrand')
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBrand ? t('editBrand') : t('createBrand')}
        description={t('modalDescription')}
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
