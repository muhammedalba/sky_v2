'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useCreateSubCategory, useUpdateSubCategory } from '@/features/categories/hooks/useSubCategories';
import { Category, LocalizedString, SubCategory } from '@/types';
import { useTranslations } from 'next-intl';
import { useTrans } from '@/shared/hooks/useTrans';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { SubCategoryFormValues, subCategorySchema } from '@/features/categories/category.schema';
import { SearchableSelect, SearchOption } from '@/shared/ui/form/SearchableSelect';
import { Icons } from '@/shared/ui/Icons';
import { useToast } from '@/shared/hooks/useToast';

interface SubCategoryFormProps {
  editingSubCategory: SubCategory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SubCategoryForm({ editingSubCategory, onSuccess, onCancel }: SubCategoryFormProps) {
  const t = useTranslations('subCategories');
  const tCommon = useTranslations('buttons');
  const getTrans = useTrans();
  const { locale } = useParams();
  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();
  const toast = useToast();
  const [search, setSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tError = (msg?: string) => (msg ? (msg.startsWith('validation.') ? t(msg) : msg) : undefined);

  const { data: categoriesData, isFetching: isCategoriesFetching } = useCategories(
    { fields: "name id", keywords: search },
    { enabled: isDropdownOpen }
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const watchedCategory = watch('category');

  const onCategorySearch = (val: string) => setSearch(val);
  const onCategoryOpen = () => setIsDropdownOpen(true);
  const onCategoryChange = (val: string) => {
    setValue('category', val, { shouldValidate: true });
  };

  const initialCategoryLabel = editingSubCategory?.category && typeof editingSubCategory.category === 'object'
    ? getTrans(editingSubCategory.category.name)
    : '';

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
        toast.success(t('messages.updateSuccess'), data.name.en);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('messages.createSuccess'), data.name.en);
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || t('messages.error'), data.name.en);
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            {...register('name.en')}
            label={t('fields.name') + ' (English)'}
            error={errors.name?.en?.message}
            disabled={updateMutation.isPending}
            showAiAction
            dir='ltr'
            aiActionTooltip={t('aiTranslateImprove')}
            icon={Icons.Edit}
          />
        </div>

        <div className="space-y-2">
          <Input
            {...register('name.ar')}
            label={t('fields.name') + ' (Arabic)'}
            dir="rtl"
            error={errors.name?.ar?.message}
            disabled={updateMutation.isPending}
            showAiAction
            aiActionTooltip={t('aiTranslateImprove')}
            icon={Icons.Edit}
          />
        </div>
      </div>

      <SearchableSelect
        icon={Icons.Categories}
        iconColor="text-amber-500"
        label={t('searchPlaceholder')}
        value={watchedCategory || ''}
        isLoading={isCategoriesFetching}
        options={(categoriesData?.data as unknown as SearchOption[]) || []}
        getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
        onSearch={onCategorySearch}
        onOpen={onCategoryOpen}
        onSelect={onCategoryChange}
        error={tError(errors.category?.message)}
        initialDisplayValue={initialCategoryLabel}
        createLink={`/${locale}/dashboard/categories`}
      />

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
