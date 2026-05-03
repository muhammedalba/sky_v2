'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSubCategories, useDeleteSubCategory } from '@/features/categories/hooks/useSubCategories';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { useToast } from '@/shared/hooks/useToast';
import { useTrans } from '@/shared/hooks/useTrans';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { useTranslations } from 'next-intl';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import Modal from '@/shared/ui/Modal';
import SubCategoryForm from '@/features/categories/components/dashboard/SubCategoryForm';
import { SubCategory } from '@/types';
import { useQueryState } from '@/shared/hooks/useQueryState';

export default function SubCategoriesPage() {
  // get query params
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  // query params
  const queryParams = useMemo(() => ({
    page, limit: 10, keywords: search, all_langs: true
  }), [page, search]);

  const { data, isLoading, refetch } = useSubCategories(queryParams);
  // mutations
  const { mutateAsync: deleteSubCategory, isPending: deleteSubCategoryPending } = useDeleteSubCategory();
  // translations
  const t = useTranslations('subCategories');
  const tCommon = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  // hooks
  const toast = useToast();
  const getTrans = useTrans();
  const confirmDialog = useConfirmDialog();
  // states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);



  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);

  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);

  const handleOpenModal = useCallback((sub?: SubCategory) => {
    if (sub) {
      setEditingSubCategory(sub);
    } else {
      setEditingSubCategory(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSubCategory(null);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    confirmDialog.openDialog({
      title: tCommon('deleteConfirm'),
      message: tCommon('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        try {
          await deleteSubCategory(id);
          toast.success(tCommon('success'));
          refetch();
        } catch (error: any) {
          console.error('Delete operation failed:', error);
          toast.error(tCommon('deleteError') || "Error while deleting");
        }
      },
    });
  }, [confirmDialog, deleteSubCategory, refetch, t, toast]);

  const columns = useMemo(() => [
    {
      header: "Name",
      className: "pl-6",
      render: (sub: SubCategory) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {getTrans(sub.name)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
            ID: {sub._id.substring(0, 8)}...
          </span>
        </div>
      )
    },
    {
      header: "Parent Category",
      render: (sub: SubCategory) => (
        <Badge variant="outline" className="rounded-xl bg-muted/40 border-none font-bold text-xs px-3 py-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {getTrans(sub?.category?.name)}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "ps-6 text-center",
      render: (sub: SubCategory) => (
        <div className="flex justify-center gap-2.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-lg hover:bg-primary/10 text-primary transition-colors "
            disabled={deleteSubCategoryPending || isLoading}
            onClick={() => handleOpenModal(sub)}           >
            <Icons.Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-lg hover:bg-destructive/10 text-destructive transition-colors "
            disabled={deleteSubCategoryPending || isLoading}
            onClick={() => handleDelete(sub._id, getTrans(sub.name))}
            isLoading={isLoading}
          >
            <Icons.Trash className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], [getTrans, handleDelete, handleOpenModal, isLoading, deleteSubCategoryPending]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title') || 'Sub Categories'}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}

        action={{
          label: t('createSubCategory'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
      />


      <EntitySearchBar
        placeholder={t('searchPlaceholder') || 'Search categories...'}
        defaultValue={search}
        onSearch={handleSearch}
        debounceMs={700}
        disabled={deleteSubCategoryPending || isLoading}

      />

      <EntityDataTable<SubCategory>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('emptyState.title'),
          description: t('emptyState.description'),
          createLink: () => handleOpenModal(),
          createLabel: t('createSubCategory')
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSubCategory ? t('editSubCategory') : t('createSubCategory')}
        description={t('modalDescription')}
      >
        <SubCategoryForm
          editingSubCategory={editingSubCategory}
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
        confirmText={tButtons('confirm')}
        cancelText={tButtons('cancel')}
        isDangerous={true}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
