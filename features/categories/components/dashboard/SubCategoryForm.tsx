'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useCreateSubCategory, useUpdateSubCategory } from '@/features/categories/hooks/useSubCategories';
import { Category, SubCategory } from '@/types';
import { useTranslations } from 'next-intl';
import { useTrans } from '@/shared/hooks/useTrans';
import { useState } from 'react';
import Spinner from '@/shared/ui/Spinner';
import { SubCategoryFormValues, subCategorySchema } from '@/features/categories/category.schema';


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
  const [search, setSearch] = useState<string>(
    editingSubCategory?.category ? getTrans(editingSubCategory.category.name) : ''
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: categoriesData, isFetching: isCategoriesFetching } = useCategories(
    { fields: "name id", keywords: search },
    { enabled: isDropdownOpen }
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors }
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      name: {
        en: editingSubCategory ? (typeof editingSubCategory.name === 'string' ? editingSubCategory.name : editingSubCategory.name?.en || '') : '',
        ar: editingSubCategory ? (typeof editingSubCategory.name === 'string' ? editingSubCategory.name : editingSubCategory.name?.ar || '') : '',
      },
      category: (editingSubCategory?.category && typeof editingSubCategory.category === 'object') ? (editingSubCategory.category as { _id: string })._id : (typeof editingSubCategory?.category === 'string' ? editingSubCategory.category : ''),
    },
  });

  const selectedCategoryId = useWatch({
    control,
    name: 'category',
  });

  const onSubmit = async (data: SubCategoryFormValues) => {
    const payload = {
      name: {
        en: data.name.en,
        ar: data.name.ar,
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
            {...register('name.en')}
            placeholder="e.g. Smartphones"
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.name?.en ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.name?.en && <p className="text-destructive text-xs mt-1">{errors.name.en.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t('fields.name') || 'Name'} (Arabic)
          </label>
          <Input
            {...register('name.ar')}
            placeholder="مثال: الهواتف الذكية"
            dir="rtl"
            className={`h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.name?.ar ? 'ring-2 ring-red-500' : ''}`}
          />
          {errors.name?.ar && <p className="text-destructive text-xs mt-1">{errors.name.ar.message}</p>}
        </div>
      </div>

      <div className="space-y-2 relative">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Parent Category
        </label>
        <Input
          placeholder="Search for a category..."
          value={search}
          autoComplete="off"
          onChange={(e) => {
            setSearch(e.target.value);
            setIsDropdownOpen(true);
            setValue('category', '', { shouldValidate: true });
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          className={`w-full h-12 rounded-xl bg-secondary/10 border-none focus-visible:ring-primary/20 font-bold ${errors.category ? 'ring-2 ring-red-500' : ''}`}
        />
        <input type="hidden" {...register('category')} />

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-border/50 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {isCategoriesFetching ? (
              <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Spinner className="w-4 h-4" /> Loading categories...
              </div>
            ) : categoriesData?.data && categoriesData.data.length > 0 ? (
              <ul className="p-1">
                {categoriesData.data.map((cat: Category) => (
                  <li
                    key={cat._id}
                    onClick={() => {
                      setValue('category', cat._id, { shouldValidate: true });
                      setSearch(getTrans(cat.name));
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg text-sm font-bold cursor-pointer transition-colors ${
                      selectedCategoryId === cat._id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-secondary/20'
                    }`}
                  >
                    {getTrans(cat.name)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No categories found.
              </div>
            )}
          </div>
        )}
        {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
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
