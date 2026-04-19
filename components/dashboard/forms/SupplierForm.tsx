'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/api/useSuppliers';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ImageUpload from '@/components/ui/form/ImageUpload';
import { Supplier } from '@/types';
import { SupplierFormValues, supplierSchema } from '@/lib/validations/schemas';
import { Switch } from '@/components/ui/Switch';



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
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      avatar: initialData?.avatar || null,
      contactName: initialData?.contactName || '',
      website: initialData?.website ? String(initialData.website) : '',
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: SupplierFormValues) => {
    console.log(data);
    
    const formData = new FormData();

    // Send name as nested object

    formData.append('name', data.name);

    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.contactName) formData.append('contactName', data.contactName);
    if (data.website) formData.append('website', data.website);
    if (data.active !== undefined) formData.append('active', String(data.active));

    if (imageFile) {
      formData.append('avatar', imageFile);
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
            <label className="text-sm font-medium">Supplier Name</label>
            <Input {...form.register('name')} placeholder="Supplier Name" />
            {form.formState.errors?.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input {...form.register('email')} placeholder="Email Address" type="email" />
            {form.formState.errors?.email && <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input {...form.register('phone')} placeholder="Phone Number" />
            {form.formState.errors?.phone && <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <Input {...form.register('address')} placeholder="Full Address" />
            {form.formState.errors?.address && <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Name</label>
            <Input {...form.register('contactName')} placeholder="Contact Name" />
            {form.formState.errors?.contactName && <p className="text-red-500 text-sm">{form.formState.errors.contactName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input {...form.register('website')} placeholder="https://example.com" />
            {form.formState.errors?.website && <p className="text-red-500 text-sm">{form.formState.errors.website.message}</p>}
            
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Switch {...form.register('active')} label={'active'} className="p-2 gap-2 bg-background border rounded-xl" />
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
          {form.formState.errors?.avatar && <p className="text-red-500 text-sm">{form.formState.errors.avatar.message}</p>}
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
