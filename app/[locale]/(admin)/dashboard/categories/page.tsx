'use client';
import { useState, useMemo, useCallback, use } from 'react';
import { useTranslations } from 'next-intl';
import { useCategories, useDeleteCategory } from '@/features/categories/hooks/useCategories';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Button } from '@/shared/ui/Button';
import Modal from '@/shared/ui/Modal';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Category } from '@/types';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useTrans } from '@/shared/hooks/useTrans';
import { useToast } from '@/shared/hooks/useToast';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import CategoryForm from '@/features/categories/components/dashboard/CategoryForm';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { useQueryState } from '@/shared/hooks/useQueryState';

export default function CategoriesPage() {
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');

  const queryParams = useMemo(() => ({
    page, limit: 10, keywords: search, all_langs: true
  }), [page, search]);

  const { data, isLoading, refetch } = useCategories(queryParams);
  console.log(data)
  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);

  // ── دالة بسيطة ومستقرة لتحديث الرابط مباشرة ──
  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);

  const getTrans = useTrans();
  const t = useTranslations('categories');
  const tMessages = useTranslations('messages');
  const tCommon = useTranslations('buttons');

  const { mutateAsync: deleteCategoryAsync } = useDeleteCategory();
  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage } = useConfirmDialog();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenModal = useCallback((category?: Category) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategory(null);
  }, []);

  const handleDelete = useCallback((id: string, name: string) => {
    openDialog({
      title: tMessages('deleteConfirm', { item: t('entityLabel') }),
      message: tMessages('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        try {
          await deleteCategoryAsync(id);
          toastSuccess(tMessages('success'));
          refetch();
        } catch (error) {
          toastError(tMessages('error') || 'حدث خطأ أثناء الحذف');
        }
      },
    });
  }, [openDialog, deleteCategoryAsync, toastSuccess, toastError, refetch, t, tMessages]);

  const columns = useMemo(() => [
    {
      header: t('fields.image'),
      className: "w-[100px] pl-6",
      render: (category: Category) => (
        <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
          <ImageWithFallback
            src={category.image || ''}
            alt={getTrans(category.name)}
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )
    },
    {
      header: t('fields.name'),
      render: (category: Category) => (
        <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
          {getTrans(category.name)}
        </span>
      )
    },
    {
      header: t('fields.subCategoriesCount'),
      render: (category: Category) => (
        <Badge variant="secondary"  >
          {t('fields.subCategoriesCount')}
          <span className="font-bold text-primary/70 roup-hover:text-primary transition-colors ps-1">
            ({category.SubCategories?.length || 0})
          </span>
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "pr-6 text-right",
      render: (category: Category) => (
        <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
            onClick={() => handleOpenModal(category)}
          >
            {tCommon('edit')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
            onClick={() => handleDelete(category._id, getTrans(category.name))}
          >
            {tCommon('delete')}
          </Button>
        </div>
      )
    }
  ], [getTrans, handleOpenModal, handleDelete, t, tCommon]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createCategory'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
        className='mb-8'
      />

      <EntitySearchBar
        placeholder={t('searchPlaceholder') || 'Search categories...'}
        defaultValue={search}
        onSearch={handleSearch}
        debounceMs={700}
      />

      <EntityDataTable<Category>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('emptyState.title'),
          description: t('emptyState.description'),
          icon: <Icons.Categories className="h-10 w-10 text-muted-foreground/40" />,
          createLabel: t('createCategory'),
          createLink: () => handleOpenModal()

        }}

      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? t('editCategory') : t('createCategory')}
        description={t('emptyState.description')}
      >
        <CategoryForm
          editingCategory={editingCategory}
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
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}