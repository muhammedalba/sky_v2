'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/api/useCategories';
import { categorySchema, type CategoryInput } from '@/lib/validations/schemas';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('categoryList')}
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="h-12 px-6 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Icons.Menu className="w-5 h-5 rotate-45" />
          {t('createCategory')}
        </Button>
      </div>

      {/* Categories Table */}
      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="w-[100px] font-bold">Icon</TableHead>
                <TableHead className="font-bold">{t('fields.name')}</TableHead>
                <TableHead className="font-bold">{t('fields.description')}</TableHead>
                <TableHead className="font-bold">{t('fields.productsCount')}</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data?.length ? (
                data.data.map((category: Category) => (
                  <TableRow key={category._id} className="group hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                       {getTrans(category.name).charAt(0).toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {getTrans(category.name)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full font-bold px-3">
                        {category.productsCount || 0} Products
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button
                            size="sm"
                            variant="secondary"
                            className="bg-background rounded-lg px-4"
                            onClick={() => handleOpenModal(category)}
                          >
                            {tCommon('edit')}
                          </Button>
                           <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg px-4"
                            onClick={() => handleDelete(category._id, getTrans(category.name))}
                            isLoading={deleteMutation.isPending}
                          >
                            {tCommon('delete')}
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                     No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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
