'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCategories } from '@/hooks/api/useCategories';
import { useCreateSubCategory, useUpdateSubCategory } from '@/hooks/api/useSubCategories';
import { SubCategory, Category } from '@/types';
import { useTranslations } from 'next-intl';
import { useTrans } from '@/hooks/useTrans';

const subCategorySchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameAr: z.string().min(2, 'Arabic name is required'),
  category: z.string().min(1, 'Parent category is required'),
});

type SubCategoryFormValues = z.infer<typeof subCategorySchema>;

interface SubCategoryFormProps {
  editingSubCategory: SubCategory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SubCategoryForm({ editingSubCategory, onSuccess, onCancel }: SubCategoryFormProps) {
  const t = useTranslations('subCategories');
  const tCommon = useTranslations('buttons');
  const getTrans = useTrans();
  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();
  const { data: categoriesData } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      nameEn: (editingSubCategory?.name && typeof editingSubCategory.name === 'object') ? (editingSubCategory.name as { en: string }).en : (typeof editingSubCategory?.name === 'string' ? editingSubCategory.name : ''),
      nameAr: (editingSubCategory?.name && typeof editingSubCategory.name === 'object') ? (editingSubCategory.name as { ar: string }).ar : '',
      category: (editingSubCategory?.category && typeof editingSubCategory.category === 'object') ? (editingSubCategory.category as { _id: string })._id : (typeof editingSubCategory?.category === 'string' ? editingSubCategory.category : ''),
    },
  });

  const onSubmit = async (data: SubCategoryFormValues) => {
    const payload = {
      name: {
        en: data.nameEn,
        ar: data.nameAr,
      },
      category: data.category,
    };

    try {
      if (editingSubCategory) {
        await updateMutation.mutateAsync({ id: editingSubCategory._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t('fields.name') || 'Name'} (English)
          </label>
          <Input 
            {...register('nameEn')} 
            placeholder="e.g. Smartphones" 
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.nameEn ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.nameEn && <p className="text-red-500 text-xs mt-1">{errors.nameEn.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t('fields.name') || 'Name'} (Arabic)
          </label>
          <Input 
            {...register('nameAr')} 
            placeholder="مثال: الهواتف الذكية" 
            dir="rtl" 
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.nameAr ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.nameAr && <p className="text-red-500 text-xs mt-1">{errors.nameAr.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Parent Category
        </label>
        <select 
          {...register('category')} 
          className={`w-full h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold px-4 appearance-none hover:bg-secondary/20 transition-colors cursor-pointer ${errors.category ? 'ring-2 ring-red-500' : ''}`}
        >
          <option value="">Select Parent Category</option>
          {categoriesData?.data?.map((cat: Category) => (
            <option key={cat._id} value={cat._id}>
              {getTrans(cat.name)}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
      </div>

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
            onClick={onCancel}
        >
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
