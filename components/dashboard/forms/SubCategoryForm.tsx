'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCategories } from '@/hooks/api/useCategories';
import { useCreateSubCategory, useUpdateSubCategory } from '@/hooks/api/useSubCategories';
import { useRouter } from 'next/navigation';
import { SubCategory, Category } from '@/types';

const subCategorySchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameAr: z.string().min(2, 'Arabic name is required'),
  category: z.string().min(1, 'Parent category is required'),
});

type SubCategoryFormValues = z.infer<typeof subCategorySchema>;

interface SubCategoryFormProps {
  initialData?: SubCategory;
  locale: string;
}

export default function SubCategoryForm({ initialData, locale }: SubCategoryFormProps) {
  const router = useRouter();
  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();
  const { data: categoriesData } = useCategories();

  const form = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      nameEn: (initialData?.name && typeof initialData.name === 'object') ? (initialData.name as { en: string }).en : (typeof initialData?.name === 'string' ? initialData.name : ''),
      nameAr: (initialData?.name && typeof initialData.name === 'object') ? (initialData.name as { ar: string }).ar : '',
      category: (initialData?.category && typeof initialData.category === 'object') ? (initialData.category as { _id: string })._id : (typeof initialData?.category === 'string' ? initialData.category : ''),
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
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push(`/${locale}/dashboard/sub-categories`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name (English)</label>
            <Input {...form.register('nameEn')} placeholder="Smartphones" />
            {form.formState.errors.nameEn && <p className="text-red-500 text-sm">{form.formState.errors.nameEn.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name (Arabic)</label>
            <Input {...form.register('nameAr')} placeholder="الهواتف الذكية" dir="rtl" />
            {form.formState.errors.nameAr && <p className="text-red-500 text-sm">{form.formState.errors.nameAr.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Parent Category</label>
          <select 
            {...form.register('category')} 
            className="w-full h-10 border rounded-lg px-3 bg-background"
          >
            <option value="">Select Parent Category</option>
            {categoriesData?.data?.map((cat: Category) => (
              <option key={cat._id} value={cat._id}>
                {typeof cat.name === 'object' ? (cat.name as { en: string }).en : cat.name}
              </option>
            ))}
          </select>
          {form.formState.errors.category && <p className="text-red-500 text-sm">{form.formState.errors.category.message}</p>}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {initialData ? 'Update Sub-Category' : 'Create Sub-Category'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
