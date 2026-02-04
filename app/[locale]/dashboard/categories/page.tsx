'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useCategories, useDeleteCategory } from '@/hooks/api/useCategories';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import { Category } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTrans } from '@/hooks/useTrans';
import { useToast } from '@/hooks/useToast';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';
import CategoryForm from '@/components/dashboard/forms/CategoryForm';
import EntityPageHeader from '@/components/dashboard/EntityPageHeader';
import EntitySearchBar from '@/components/dashboard/EntitySearchBar';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useCategories({ page, limit: 10, search });
  const getTrans = useTrans();
  const t = useTranslations('categories');
  const tMessages = useTranslations('messages');
  const tCommon = useTranslations('buttons');
  const deleteMutation = useDeleteCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const confirmDialog = useConfirmDialog();
  const toast = useToast();

  const handleOpenModal = useCallback((category?: Category) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategory(null);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    confirmDialog.openDialog({
      title: tMessages('deleteConfirm', { item: t('entityLabel') }),
      message: tMessages('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        toast.success(tMessages('success'));
        refetch();
      },
    });
  }, [confirmDialog, deleteMutation, refetch, t, toast, tMessages]);

  const columns = useMemo(() => [
    {
      header: t('fields.image'),
      className: "w-[100px] pl-6",
      render: (category: Category) => (
        <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative ">
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
    // {
    //   header: t('fields.productsCount'),
    //   render: (category: Category) => (
    //     <Badge variant="secondary" className="rounded-xl font-bold px-3 py-1 bg-muted/40 border-none group-hover:bg-primary/10 group-hover:text-primary transition-colors">
    //       {category.productsCount || 0} Products
    //     </Badge>
    //   )
    // },
        {
      header: t('fields.subCategoriesCount'),
      render: (category: Category) => (
        <Badge variant="secondary" className="rounded-xl font-bold px-3 py-1 bg-muted/40 border-none group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {category.supCategories?.length || category.subCategoriesCount|| 0} Sub Categories
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
            isLoading={deleteMutation.isPending}
          >
            {tCommon('delete')}
          </Button>
        </div>
      )
    }
  ], [getTrans, handleOpenModal, handleDelete, t, tCommon, deleteMutation.isPending]);


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <EntityPageHeader 
        title={t('title')}
        subtitle={t('subtitle')}
        action={{
          label: t('createCategory'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
      />
      
      {/* Search */}
      <EntitySearchBar 
        placeholder={t('searchPlaceholder') || 'Search categories...'}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      {/* Table start */}
      <EntityDataTable<Category>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        columns={columns}
        emptyState={{
          title: t('emptyState.title'),
          description: t('emptyState.description'),
          icon: <Icons.Menu className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />
      {/* Table end */}
      
      {/* Modal start */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? t('editCategory') : t('createCategory')}
        description="Organize your store by creating meaningful categories."
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
      {/* Confirm Dialog start */}
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
      {/* Confirm Dialog end */}
    </div>
  );
}
