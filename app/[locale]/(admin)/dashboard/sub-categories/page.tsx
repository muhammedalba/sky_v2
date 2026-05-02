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

  const getTrans = useTrans();
  const confirmDialog = useConfirmDialog();
  const t = useTranslations('subCategories');
  const tCommon = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const toast = useToast();
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const queryParams = useMemo(() => ({
    page, limit: 10, keywords: search, all_langs: true
  }), [page, search]);

  const { data, isLoading, refetch } = useSubCategories(queryParams);
  const deleteMutation = useDeleteSubCategory();
  console.log(data);
  // const handleSearch = useCallback((value: string) => {
  //   setSearch(value);
  //   setPage(1);
  // }, []);

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
      title: t('messages.deleteTitle'),
      message: t('messages.deleteConfirm', { name }),
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('messages.deleteSuccess'));
          refetch();
        } catch (error: any) {
          console.error('Delete operation failed:', error);
          toast.error(error.message || 'Failed to delete the item. Please try again.');
        }
      },
    });
  }, [confirmDialog, deleteMutation, refetch, t, toast]);

  const columns = useMemo(() => [
    {
      header: "Name",
      className: "pl-6",
      render: (sub: SubCategory) => (
        <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
          {getTrans(sub.name)}
        </span>
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
      className: "pr-6 text-right",
      render: (sub: SubCategory) => (
        <div className="flex justify-end gap-2.5">
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 rounded-lg hover:bg-primary/10 text-primary transition-colors "
                 onClick={() => handleOpenModal(sub)}           >
              <Icons.Edit className="w-4 h-4" />
              {/* {tCommon('edit')} */}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 rounded-lg hover:bg-destructive/10 text-destructive transition-colors "
              onClick={() => handleDelete(sub._id, getTrans(sub.name))}
            isLoading={deleteMutation.isPending}
            >
              <Icons.Trash className="w-4 h-4" />     
                 {/* {tCommon('delete')} */}
            </Button>
        </div>
      )
    }
  ], [getTrans, handleDelete, handleOpenModal, tButtons, deleteMutation.isPending]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title') || 'Sub Categories'}
        subtitle={t('subtitle')}
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
      />

      <EntityDataTable<SubCategory>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: "No sub-categories found",
          description: "Organize your catalog by creating sub-categories under main categories.",
          createLink: undefined,
          createLabel: "Create Sub Category"
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSubCategory ? 'Edit Sub-Category' : 'Create Sub-Category'}
        description="Establish relationships between products and categories."
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
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
