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
import { Tooltip } from '@/shared/ui/Tooltip';

export default function CategoriesPage() {
  // get page and search from query params
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  // create query params
  const queryParams = useMemo(() => ({
    page, limit: 10, keywords: search, all_langs: true
  }), [page, search]);
  // get data from api
  const { data, isLoading, refetch } = useCategories(queryParams);
  const { mutateAsync: deleteCategoryAsync, isPending: deleteCategoryPending } = useDeleteCategory();
  // handle page change
  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);
  // handle search
  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);
  // translations
  const t = useTranslations('categories');
  const tMessages = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const getTrans = useTrans();
  // hooks
  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage, isDangerous: isConfirmDangerous } = useConfirmDialog();
  const { success: toastSuccess, error: toastError } = useToast();
  // states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  // open modal for adding or editing
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
      title: tMessages('deleteConfirm'),
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
  }, [openDialog, deleteCategoryAsync, toastSuccess, toastError, refetch]);
  // columns configuration for data table
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
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {getTrans(category.name)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
            ID: {category._id.substring(0, 8)}...
          </span>
        </div>
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
      className: "pe-6 text-center",
      render: (category: Category) => (
        <div className="flex justify-center gap-2 transition-all duration-300">
          <Tooltip content={tButtons('edit')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-primary rounded-xl bg-background/50 border-border/40 hover:bg-primary/10 hover:text-primary/70 hover:border-primary/20 transition-all"
              onClick={() => handleOpenModal(category)}
              disabled={deleteCategoryPending || isLoading}                   >
              <Icons.Edit className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content={tButtons('delete')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl bg-background/50 border-border/40 hover:bg-destructive/10 text-destructive hover:text-destructive/70 hover:border-destructive/20 transition-all"
              onClick={() => handleDelete(category._id, getTrans(category.name))}
              disabled={deleteCategoryPending || isLoading}
              isLoading={deleteCategoryPending}
            >
              <Icons.Trash className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [getTrans, handleOpenModal, handleDelete, deleteCategoryPending, isLoading]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createCategory'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal(),
          disabled: deleteCategoryPending || isLoading
        }}
        className='mb-8'
      />

      <EntitySearchBar
        placeholder={t('searchPlaceholder') || 'Search categories...'}
        defaultValue={search}
        onSearch={handleSearch}
        debounceMs={700}
        disabled={deleteCategoryPending || isLoading}
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
          createLink: () => handleOpenModal(),
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
        confirmText={tButtons('confirm')}
        cancelText={tButtons('cancel')}
        isDangerous={isConfirmDangerous}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}