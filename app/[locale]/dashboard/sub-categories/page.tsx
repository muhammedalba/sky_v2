'use client';

import { use, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSubCategories, useDeleteSubCategory } from '@/hooks/api/useSubCategories';
import { Button } from '@/components/ui/Button';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { useTrans } from '@/hooks/useTrans';
import { SubCategory, Category } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslations } from 'next-intl';
import EntityPageHeader from '@/components/dashboard/EntityPageHeader';
import EntitySearchBar from '@/components/dashboard/EntitySearchBar';
import Modal from '@/components/ui/Modal';
import SubCategoryForm from '@/components/dashboard/forms/SubCategoryForm';
import { useToast } from '@/hooks/useToast';

export default function SubCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const getTrans = useTrans();
  const confirmDialog = useConfirmDialog();
  const t = useTranslations('subCategories');
  const tCommon = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  const { data, isLoading, refetch } = useSubCategories({ page, limit: 10, search });
  const deleteMutation = useDeleteSubCategory();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

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
      title: 'Delete Sub-Category',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        toast.success(tCommon('success'));
        refetch();
      },
    });
  }, [confirmDialog, deleteMutation, refetch, tCommon, toast]);

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
          {sub.category && typeof sub.category === 'object' ? getTrans((sub.category as Category).name) : sub.category || '-'}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "pr-6 text-right",
      render: (sub: SubCategory) => (
        <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
            onClick={() => handleOpenModal(sub)}
          >
            {tButtons('edit')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
            onClick={() => handleDelete(sub._id, getTrans(sub.name))}
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
        title={t('title') || 'Sub Categories'}
        subtitle={t('subtitle')}
        action={{
          label: t('createSubCategory'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
      />

      <EntitySearchBar 
        placeholder={t('searchPlaceholder')}
        onSearch={handleSearch}
      />

      <EntityDataTable<SubCategory>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
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
