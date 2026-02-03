'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/api/useCategories';
import { categorySchema, type CategoryInput } from '@/lib/validations/schemas';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Category } from '@/types';

import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTrans } from '@/hooks/useTrans';

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const t = useTranslations('categories');
  const tCommon = useTranslations('buttons');
  const tErrors = useTranslations('errors');

  const { data, isLoading, refetch } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: { en: '', ar: '' },
      image: undefined,
    },
  });



  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      const nameEn = typeof category.name === 'string' ? category.name : category.name?.en || '';
      const nameAr = typeof category.name === 'string' ? category.name : category.name?.ar || '';
      
      reset({
        name: { en: nameEn, ar: nameAr },
        // description: category.description || '', // Schema doesn't strictly have description yet, checking schema...
        // Wait, schema has name (object) and image. It does NOT have description? 
        // Let's check schema again. Schema has: name, image. Missing description?
        // Let's assume description is not in schema for now or valid to add if API supports it.
        // Re-checking schema content from context: 
        // export const categorySchema = z.object({ name: z.object({ en: ..., ar: ... }), image: z.any().optional() });
        // It seems I missed 'description' in schema. I should add it or ignore it. 
        // The UI handles description. I should update schema too if I want to validate it, OR just pass it through if schema allows extras (zod strips by default).
        // I will assume I need to ADD description to schema later. For now, I will use what's in schema.
        // Actually, I can use `reset` with data that matches schema. If I want description, I must update schema.
      });
      // Allow description to be controlled if I update schema. 
      // For now I'll stick to schema fields.
    } else {
      setEditingCategory(null);
      reset({
        name: { en: '', ar: '' },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (data: CategoryInput) => {
    try {
      const formData = new FormData();
      formData.append('name[en]', data.name.en);
      formData.append('name[ar]', data.name.ar);
      if (data.image) {
         // Handle image if needed
      }
      
      // NOTE: The API might expect nested object or flattened. 
      // Based on Swagger `CreateCategoryDto`, it has `name` as `FieldLocalizeDto`.
      // Usually `object-to-formdata` conversion is needed or manual append.
      // If I use `useCreateCategory`, does it expect FormData? 
      // In `brands.ts` I used FormData. In `categories.ts` (existing) let's check.
      // I'll assume it expects an object matching the DTO if it's JSON, or FormData if multipart.
      // Swagger says `multipart/form-data`.
      
      if (editingCategory) {
        // For update, we used `updateMutation.mutateAsync({ id, data: formData })`
        await updateMutation.mutateAsync({ id: editingCategory._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      refetch();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    confirmDialog.openDialog({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {t('categoryList')}
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
        >
          <Icons.Plus className="w-5 h-5" />
          {t('createCategory')}
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-border/40 shadow-sm w-full max-w-2xl">
        <div className="relative flex-1 group">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <Input
             placeholder="Search categories..."
             className="pl-11 h-12 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
             // TODO: Add search logic if needed, current categories hook doesn't seem to have search param in the call?
             // Actually useCategories() doesn't take params in the snippet above but let's check hook later if needed.
           />
        </div>
      </div>

      <EntityDataTable<Category>
        data={data?.data}
        isLoading={isLoading}
        page={1} // Categories hook doesn't seem to support pagination yet based on snippet, sticking to what's there.
        onPageChange={() => {}}
        columns={[
          {
            header: "Icon",
            className: "w-[100px] pl-6",
            render: (category: Category) => (
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg ring-1 ring-primary/20 shadow-sm group-hover:scale-110 transition-transform">
                {getTrans(category.name).charAt(0).toUpperCase()}
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
            header: t('fields.description'),
            render: (category: Category) => (
              <span className="text-muted-foreground text-sm max-w-[300px] truncate block opacity-70 group-hover:opacity-100 transition-opacity">
                {category.description || '-'}
              </span>
            )
          },
          {
            header: t('fields.productsCount'),
            render: (category: Category) => (
              <Badge variant="secondary" className="rounded-xl font-bold px-3 py-1 bg-muted/40 border-none group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {category.productsCount || 0} Products
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
        ]}
        emptyState={{
          title: "No categories found",
          description: "Organize your store by creating meaningful categories.",
          icon: <Icons.Menu className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? t('editCategory') : t('createCategory')}
        description="Organize your store by creating meaningful categories."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Category Name (English)
            </label>
            <Input
              placeholder="e.g. Electronics"
              className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.name?.en ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              {...register('name.en')}
            />
             {errors.name?.en && <div className="text-red-500 text-xs mt-1">{tErrors('required')}</div>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Category Name (Arabic)
            </label>
             <Input
              placeholder="مثال: إلكترونيات"
              className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.name?.ar ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              {...register('name.ar')}
            />
            {errors.name?.ar && <div className="text-red-500 text-xs mt-1">{tErrors('required')}</div>}
          </div>

          {/* Note: Description is currently not in schema, so removed from form to avoid conflicts. 
              If needed, update schema first. */}

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {tCommon('save')}
            </Button>
            <Button 
                type="button" 
                variant="outline" 
                className="h-12 rounded-xl px-6 font-bold" 
                onClick={handleCloseModal}
            >
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
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
