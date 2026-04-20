'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { profileSchema, changePasswordSchema, type ProfileInput, type ChangePasswordInput } from '@/lib/validations/schemas';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import { useState } from 'react';
import { User } from '@/types';
import { useToastStore } from '@/store/toast-store';


interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations('profile');
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Profile Form
  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileInput) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      return api.auth.updateMe(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      addToast({
        title: 'Success',
        message: t('messages.profileUpdated'),
        type: 'success',
      });
    },
  });

  // Password Form
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      return api.auth.changePassword({
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      addToast({
        title: 'Success',
        message: t('messages.passwordChanged'),
        type: 'success',
      });
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t('personalInfo')}</CardTitle>
              <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('fields.name')}</label>
                    <Input {...profileForm.register('name')} placeholder="John Doe" />
                    {profileForm.formState.errors.name && (
                      <p className="text-red-500 text-xs">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('fields.email')}</label>
                    <Input {...profileForm.register('email')} type="email" placeholder="john@example.com" />
                    {profileForm.formState.errors.email && (
                      <p className="text-red-500 text-xs">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" isLoading={updateProfileMutation.isPending} className="font-bold">
                    {t('buttons.saveChanges')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t('changePassword')}</CardTitle>
              <CardDescription>Keep your account secure with a strong password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('fields.currentPassword')}</label>
                    <Input {...passwordForm.register('currentPassword')} type="password" />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-red-500 text-xs">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>
                  <div className="hidden md:block"></div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('fields.newPassword')}</label>
                    <Input {...passwordForm.register('password')} type="password" />
                    {passwordForm.formState.errors.password && (
                      <p className="text-red-500 text-xs">{passwordForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('fields.confirmPassword')}</label>
                    <Input {...passwordForm.register('confirmPassword')} type="password" />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" isLoading={changePasswordMutation.isPending} className="font-bold">
                    {t('buttons.updatePassword')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5"></div>
            <CardContent className="relative pt-0 flex flex-col items-center -mt-12">
              <div className="relative group">
                <ImageUpload
                  value={avatarFile ? URL.createObjectURL(avatarFile) : (user.avatar || '')}
                  onChange={(file) => setAvatarFile(file)}
                  onRemove={() => setAvatarFile(null)}
                />
              </div>
              <div className="text-center mt-4">
                <h3 className="text-lg font-bold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2 text-xs uppercase font-bold text-primary px-2 py-1 bg-primary/10 rounded-full inline-block">
                  {user.role}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
