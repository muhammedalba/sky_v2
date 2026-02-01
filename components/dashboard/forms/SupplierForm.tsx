'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/api/useSuppliers';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ImageUpload from '@/components/ui/form/ImageUpload';
import { Supplier } from '@/types';

const supplierSchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameAr: z.string().min(2, 'Arabic name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  initialData?: Supplier;
  locale: string;
}

export default function SupplierForm({ initialData, locale }: SupplierFormProps) {
  const router = useRouter();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      nameEn: (initialData?.name && typeof initialData.name === 'object') ? (initialData.name as { en: string }).en : (typeof initialData?.name === 'string' ? initialData.name : ''),
      nameAr: (initialData?.name && typeof initialData.name === 'object') ? (initialData.name as { ar: string }).ar : '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      avatar: initialData?.avatar || '',
    },
  });

  const onSubmit = async (data: SupplierFormValues) => {
    const formData = new FormData();
    
    // Send name as nested object
    const nameObject = {
      en: data.nameEn,
      ar: data.nameAr,
    };
    formData.append('name', JSON.stringify(nameObject));
    
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      router.push(`/${locale}/dashboard/suppliers`);
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
                <Input {...form.register('nameEn')} placeholder="Supplier Name" />
                {form.formState.errors.nameEn && <p className="text-red-500 text-sm">{form.formState.errors.nameEn.message}</p>}
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">Name (Arabic)</label>
                <Input {...form.register('nameAr')} placeholder="اسم المورد" dir="rtl" />
                {form.formState.errors.nameAr && <p className="text-red-500 text-sm">{form.formState.errors.nameAr.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input {...form.register('email')} placeholder="Email Address" type="email" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input {...form.register('phone')} placeholder="Phone Number" />
            </div>
             <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input {...form.register('address')} placeholder="Full Address" />
            </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Logo / Avatar</label>
          <ImageUpload
            value={imageFile ? URL.createObjectURL(imageFile) : ((form.getValues('avatar') && typeof form.getValues('avatar') === 'string') ? form.getValues('avatar') as string : '')}
            onChange={(file) => setImageFile(file)}
            onRemove={() => {
              setImageFile(null);
              form.setValue('avatar', null);
            }}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
           <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
           <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
             {initialData ? 'Update Supplier' : 'Create Supplier'}
           </Button>
        </div>
      </form>
    </Card>
  );
}
