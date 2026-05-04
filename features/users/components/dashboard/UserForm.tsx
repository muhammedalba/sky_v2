'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useCreateUser, useUpdateUser } from '@/features/users/hooks/useUsers';
import { useState } from 'react';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import { User } from '@/types';
import { UserFormValues, createUserSchema, editUserSchema } from '@/features/users/user.schema';
import { Switch } from '@/shared/ui/Switch';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from '@/shared/hooks/useToast';
import { Icons } from '@/shared/ui/Icons';
import { useRouter } from 'next/navigation';
import FormStickyHeader from '@/shared/ui/dashboard/FormStickyHeader';
import { cn } from '@/lib/utils';
import { Select } from '@/shared/ui/Select';

interface UserFormProps {
  editingUser?: User | null;
  mode: 'create' | 'edit';
}

export default function UserForm({ editingUser, mode }: UserFormProps) {
  const locale = useLocale();
  const t = useTranslations('users');
  const tButtons = useTranslations('buttons');

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const toast = useToast();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingUser?.avatar || null);
  const formId = mode === 'create' ? 'create-user-form' : 'edit-user-form';
  const formSchema = mode === 'create' ? createUserSchema : editUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingUser?.name || '',
      email: editingUser?.email || '',
      role: editingUser?.role || 'user',
      isActive: editingUser?.isActive ?? true,
      phone: editingUser?.phone || '',
      avatar: editingUser?.avatar || null,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('role', data.role);
    formData.append('isActive', String(data.isActive));
    if (data.phone) formData.append('phone', data.phone);

    // Only append password if it's provided (important for edit mode)
    if (data.password) {
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword || '');
    }

    if (imageFile) {
      formData.append('avatar', imageFile);
    }

    try {
      if (editingUser) {
        await updateMutation.mutateAsync({ id: editingUser._id, data: formData });
        toast.success(t('messages.updateSuccess'));
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(t('messages.createSuccess'));
      }
      router.push(`/${locale}/dashboard/users`);

    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : t('messages.updateError');
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {

    router.push(`/${locale}/dashboard/users`);

  };

  const isActive = watch('isActive');

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <FormStickyHeader
        title={mode === 'create' ? t('createUser') : t('editUser')}
        subtitle={t('subtitle')}
        cancelLabel={tButtons('cancel')}
        saveLabel={tButtons('save')}
        formId={formId}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        backUrl={`/${locale}/dashboard/users`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-border/40 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icons.User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {t('fields.basicInfo')}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  {...register('name')}
                  label={t('fields.name')}
                  icon={Icons.User}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  error={errors.name?.message}
                />
              </div>

              <div className="space-y-2">
                <Input
                  {...register('email')}
                  icon={Icons.Mail}
                  label={t('fields.email')}
                  type="email"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  error={errors.email?.message}
                />
              </div>

              <div className="space-y-2">
                <Input
                  {...register('phone')}
                  icon={Icons.Phone}
                  label={t('fields.phone')}
                  dir="ltr"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  error={errors.phone?.message}
                />
              </div>

              <div className="space-y-2">
                <Select
                  label={t('fields.role')}
                  icon={Icons.Shield}
                  {...register('role')}
                  options={[
                    { value: 'user', label: t('roles.user') },
                    { value: 'admin', label: t('roles.admin') },
                    { value: 'manager', label: t('roles.manager') },
                  ]}
                  // value={watch('role')}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  error={errors.role?.message}
                />
              </div>
            </div>
          </div>

          <div className="bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-border/40 pb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Icons.Shield className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {t('fields.security')}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  {...register('password')}
                  type="password"
                  icon={Icons.Key}
                  label={t('fields.password')}
                  placeholder={mode === 'edit' ? '******** (Leave empty to keep)' : '********'}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  error={errors.password?.message}
                />
              </div>

              <div className="space-y-2">
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  icon={Icons.Key}
                  label={t('fields.passwordConfirm')}
                  placeholder={mode === 'edit' ? '******** (Leave empty to keep)' : '********'}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border/40 shadow-sm space-y-6">
            <h3 className="font-bold text-foreground border-b border-border/40 pb-4">
              {t('fields.avatar')}
            </h3>
            <ImageUpload
              value={imagePreview || undefined}
              onChange={(file: File) => {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                setValue('avatar', file);
              }}
              onRemove={() => {
                setImageFile(null);
                setImagePreview(null);
                setValue('avatar', null);
              }}
            />
          </div>

          <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border/40 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <h3 className="font-bold text-foreground">
                {t('fields.status')}
              </h3>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors",
                isActive
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              )}>
                {isActive ? t('fields.active') : t('fields.inactive')}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
              <Switch
                checked={isActive}
                disabled={createMutation.isPending || updateMutation.isPending}
                onChange={(e) => setValue('isActive', e.target.checked, { shouldDirty: true })}
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {isActive ? t('fields.active') : t('fields.inactive')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
