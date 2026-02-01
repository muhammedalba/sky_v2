'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useCreateProduct, useUpdateProduct } from '@/hooks/api/useProducts';
import { useCategories } from '@/hooks/api/useCategories';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ImageUpload from '@/components/ui/form/ImageUpload';
import { Product, Category } from '@/types';
import { Icons } from '@/components/ui/Icons';



const productSchema = z.object({
  titleEn: z.string().min(3, 'English title is required'),
  titleAr: z.string().min(3, 'Arabic title is required'),
  descriptionEn: z.string().min(10, 'English description is required'),
  descriptionAr: z.string().min(10, 'Arabic description is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  priceAfterDiscount: z.number().optional(),
  quantity: z.number().min(0, 'Quantity must be at least 0'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  sku: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  locale: string;
}

export default function ProductForm({ initialData, locale }: ProductFormProps) {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categoriesData } = useCategories();

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      titleEn: (initialData?.title && typeof initialData.title === 'object') ? (initialData.title as { en: string }).en : (typeof initialData?.title === 'string' ? initialData.title : ''),
      titleAr: (initialData?.title && typeof initialData.title === 'object') ? (initialData.title as { ar: string }).ar : '',
      descriptionEn: (initialData?.description && typeof initialData.description === 'object') ? (initialData.description as { en: string }).en : (typeof initialData?.description === 'string' ? initialData.description : ''),
      descriptionAr: (initialData?.description && typeof initialData.description === 'object') ? (initialData.description as { ar: string }).ar : '',
      price: initialData?.price || 0,
      priceAfterDiscount: initialData?.priceAfterDiscount || undefined,
      quantity: initialData?.quantity || 0,
      category: (initialData?.category && typeof initialData.category === 'object') ? (initialData.category as { _id: string })._id : (typeof initialData?.category === 'string' ? initialData.category : ''),
      brand: (initialData?.brand && typeof initialData.brand === 'object') ? (initialData.brand as { _id: string })._id : (typeof initialData?.brand === 'string' ? initialData.brand : ''),
      sku: initialData?.sku || '',
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    const formData = new FormData();

    // Send title and description as nested objects
    formData.append('title', JSON.stringify({
      en: data.titleEn,
      ar: data.titleAr,
    }));

    formData.append('description', JSON.stringify({
      en: data.descriptionEn,
      ar: data.descriptionAr,
    }));

    formData.append('price', data.price.toString());
    if (data.priceAfterDiscount) formData.append('priceAfterDiscount', data.priceAfterDiscount.toString());
    formData.append('quantity', data.quantity.toString());
    formData.append('category', data.category);
    if (data.brand) formData.append('brand', data.brand);
    if (data.sku) formData.append('sku', data.sku);

    // Cover image (required for create, optional for update)
    if (coverImage) {
      formData.append('imageCover', coverImage);
    }

    // Additional images (optional)
    additionalImages.forEach((img) => {
      formData.append('images', img);
    });

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      router.push(`/${locale}/dashboard/products`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdditionalImageAdd = (file: File) => {
    setAdditionalImages((prev) => [...prev, file]);
  };

  const handleAdditionalImageRemove = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {initialData ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-muted-foreground">Add a new item to your store</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {initialData ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic details in both languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (English) *</label>
                  <Input {...form.register('titleEn')} placeholder="Wireless Headphones" />
                  {form.formState.errors.titleEn && (
                    <p className="text-red-500 text-sm">{form.formState.errors.titleEn.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (Arabic) *</label>
                  <Input {...form.register('titleAr')} placeholder="سماعات لاسلكية" dir="rtl" />
                  {form.formState.errors.titleAr && (
                    <p className="text-red-500 text-sm">{form.formState.errors.titleAr.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (English) *</label>
                  <Textarea {...form.register('descriptionEn')} placeholder="Product details..." rows={5} />
                  {form.formState.errors.descriptionEn && (
                    <p className="text-red-500 text-sm">{form.formState.errors.descriptionEn.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Arabic) *</label>
                  <Textarea {...form.register('descriptionAr')} placeholder="تفاصيل المنتج..." dir="rtl" rows={5} />
                  {form.formState.errors.descriptionAr && (
                    <p className="text-red-500 text-sm">{form.formState.errors.descriptionAr.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('price', { valueAsNumber: true })}
                    placeholder="99.99"
                  />
                  {form.formState.errors.price && (
                    <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Discounted Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('priceAfterDiscount', { valueAsNumber: true })}
                    placeholder="79.99"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock *</label>
                  <Input
                    type="number"
                    {...form.register('quantity', { valueAsNumber: true })}
                    placeholder="100"
                  />
                  {form.formState.errors.quantity && (
                    <p className="text-red-500 text-sm">{form.formState.errors.quantity.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle>Cover Image *</CardTitle>
              <CardDescription>Main product image (required)</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={coverImage ? URL.createObjectURL(coverImage) : (initialData?.imageCover || '')}
                onChange={(file) => setCoverImage(file)}
                onRemove={() => setCoverImage(null)}
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle>Additional Images</CardTitle>
              <CardDescription>Optional product gallery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {additionalImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <ImageUpload
                    value={URL.createObjectURL(img)}
                    onChange={() => {}}
                    onRemove={() => handleAdditionalImageRemove(idx)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const file = target.files?.[0];
                    if (file) handleAdditionalImageAdd(file);
                  };
                  input.click();
                }}
              >
                <Icons.Menu className="w-4 h-4 mr-2 rotate-45" />
                Add Image
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  {...form.register('category')}
                  className="w-full h-10 border rounded-lg px-3 bg-background"
                >
                  <option value="">Select Category</option>
                  {categoriesData?.data?.map((cat: Category) => (
                    <option key={cat._id} value={cat._id}>
                      {typeof cat.name === 'object' ? cat.name.en : cat.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.category && (
                  <p className="text-red-500 text-sm">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SKU</label>
                <Input {...form.register('sku')} placeholder="WH-1000XM4" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Input {...form.register('brand')} placeholder="Sony" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
