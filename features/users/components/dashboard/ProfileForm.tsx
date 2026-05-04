'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Icons } from '@/shared/ui/Icons';
import PasswordInput from '@/shared/ui/PasswordInput';
import { authApi } from '@/features/auth/api';
import {
  profileSchema,
  changePasswordSchema,
  type ProfileInput,
  type ChangePasswordInput,
} from '@/features/users/user.schema';
import { useToastStore } from '@/store/toast-store';
import { User } from '@/types';
import { cn, formatDateTime, formatRelativeTime } from '@/lib/utils';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import { setUser } from '@/lib/auth';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProfileFormProps {
  user: User;
}

// ─── Sub-component: Tab Button ────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
      )}
    >
      {icon}
      {label}
    </button>
  );
}




// ─── Sub-component: Section Header ───────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3 pb-5 mb-6 border-b border-border/60">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-bold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}



// ─── Main Component ───────────────────────────────────────────────────────────

type ActiveTab = 'general' | 'security';

export default function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations('profile');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.avatar || null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  // ── Profile form ──────────────────────────────────────────────────────────
  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      avatar: user?.avatar || null,
      phone: user?.phone ?? undefined,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileInput) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      if (imageFile) formData.append('avatar', imageFile);
      return authApi.updateMe(formData);
    },
    onSuccess: (response) => {
      // تحديث ملف الكوكيز والـ LocalStorage بالبيانات الجديدة مباشرة
      if (response.data) {
        setUser(response.data);
      }
      
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      
      addToast({ title: 'Success', message: t('messages.profileUpdated'), type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', message: error.response?.data?.errors || 'Failed to update profile.', type: 'error' })

    },
  });

  // ── Password form ─────────────────────────────────────────────────────────
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordInput) =>
      authApi.changePassword({ password: data.password, confirmPassword: data.confirmPassword }),
    onSuccess: () => {
      passwordForm.reset();
      addToast({ title: 'Success', message: t('messages.passwordChanged'), type: 'success' });
    },
    onError: () => {
      addToast({ title: 'Error', message: 'Failed to update password.', type: 'error' });
    },
  });

  // ── Role badge helper ─────────────────────────────────────────────────────
  const roleBadgeClass: Record<string, string> = {
    admin: 'bg-primary/10 text-primary',
    manager: 'bg-info/10 text-info',
    user: 'bg-secondary text-secondary-foreground',
  };
  const roleLabel = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';

  // ─────────────────────────────────────────────────────────────────────────
  const isOnline = user.lastLogin && (new Date().getTime() - new Date(user.lastLogin).getTime()) < 1000 * 60 * 5;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Profile Hero Header ── */}
      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        {/* Gradient banner */}
        <div className="h-28 bg-linear-to-br from-primary/25 via-primary/10 to-background relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        </div>

        <CardContent className="relative pt-0 -mt-12 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-secondary flex items-center justify-center font-bold text-2xl text-secondary-foreground shadow-lg">
                {imagePreview && <ImageWithFallback
                  src={imagePreview}
                  alt={user.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />}


              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 sm:pb-1">
              {/* Name + Role + Status row */}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black tracking-tight truncate">{user.name}</h2>

                {/* Role badge */}
                <span
                  className={cn(
                    'text-xs font-bold uppercase px-2.5 py-0.5 rounded-full',
                    roleBadgeClass[user.role] ?? roleBadgeClass.user
                  )}
                >
                  {roleLabel}
                </span>

                {/* Active / Inactive badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full',
                    user.isActive
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      user.isActive ? 'bg-success animate-pulse' : 'bg-destructive'
                    )}
                  />
                  {user.isActive ? t('status.active') : t('status.inactive')}
                </span>
              </div>

              {/* Email */}
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{user.email}</p>

              {/* Last login */}
              {user.lastLogin && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                  <Icons.Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {t('lastLogin')}{' '}
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {isOnline && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                        </span>
                      )}
                      <span className={cn(
                        "text-sm md:font-semibold tracking-tight",
                        isOnline ? "text-success/70" : "text-muted-foreground/80"
                      )}>
                        {user.lastLogin ? formatRelativeTime(user.lastLogin, locale) : '-'}
                      </span>
                    </div>
                    {!isOnline && user.lastLogin && (
                      <span className="text-[10px] text-muted-foreground/50 font-medium uppercase">
                        {formatDateTime(user.lastLogin, locale)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-1 p-1 bg-secondary/40 rounded-2xl w-fit border border-border/40">
        <TabButton
          active={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
          icon={<Icons.User className="w-4 h-4" />}
          label={t('tabs.general')}
        />
        <TabButton
          active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          icon={<Icons.Shield className="w-4 h-4" />}
          label={t('tabs.security')}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Tab 1 — General Info
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-left-2 duration-300">

          {/* ── Left: Avatar Upload Card ── */}
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold">{t('avatar.title')}</CardTitle>
              <CardDescription>{t('avatar.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <ImageUpload
                value={imagePreview || undefined}
                loading="eager"
                onChange={(file: File) => {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                  profileForm.setValue('avatar', file);
                }}
                onRemove={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  profileForm.setValue('avatar', null);
                }}
              />
            </CardContent>
          </Card>

          {/* ── Right: Personal Details Form ── */}
          <Card className="border-none shadow-sm ring-1 ring-border/50 lg:col-span-2">
            <CardContent className="pt-6">
              <SectionHeader
                icon={<Icons.User className="w-5 h-5" />}
                title={t('personalInfo')}
                description={t('personalInfoDescription')}
              />

              <form
                onSubmit={profileForm.handleSubmit((data) =>
                  updateProfileMutation.mutate(data)
                )}
                className="space-y-5"
              >
                {/* Name */}
                <Input
                  {...profileForm.register('name')}
                  label={t('fields.name')}
                  icon={Icons.User}
                  placeholder=" "
                  value={profileForm.watch('name')}
                  error={profileForm.formState.errors.name?.message}
                />


                {/* Email */}
                <Input
                  {...profileForm.register('email')}
                  type="email"
                  label={t('fields.email')}
                  icon={Icons.Mail}
                  placeholder=" "
                  error={profileForm.formState.errors.email?.message}
                />


                {/* Phone (optional, display only if exists) */}

                <Input
                  {...profileForm.register('phone')}
                  type="tel"
                  label={t('fields.phone')}
                  icon={Icons.Phone}

                  placeholder=" "
                  error={profileForm.formState.errors.phone?.message}
                />


                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    isLoading={updateProfileMutation.isPending}
                    className="min-w-[140px] font-bold"
                  >
                    {t('buttons.saveChanges')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Tab 2 — Security
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          <Card className="border-none shadow-sm ring-1 ring-border/50 max-w-2xl">
            <CardContent className="pt-6">
              <SectionHeader
                icon={<Icons.Key className="w-5 h-5" />}
                title={t('changePassword')}
                description={t('changePasswordDescription')}
              />

              {/* Security notice */}
              <div className="flex items-start gap-3 p-3.5 mb-6 rounded-xl bg-warning/10 border border-warning/20 text-warning-foreground">
                <Icons.Shield className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t('passwordSecurityNote')}
                </p>
              </div>

              <form
                onSubmit={passwordForm.handleSubmit((data) =>
                  changePasswordMutation.mutate(data)
                )}
                className="space-y-5"
              >

                <div className="border-t border-dashed border-border/60 pt-5" />

                {/* New Password */}
                <PasswordInput
                  {...passwordForm.register('password')}
                  label={t('fields.newPassword')}
                  icon={Icons.Shield}
                  error={passwordForm.formState.errors.password?.message}
                />

                {/* Confirm Password */}
                <PasswordInput
                  {...passwordForm.register('confirmPassword')}
                  label={t('fields.confirmPassword')}
                  icon={Icons.Shield}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    isLoading={changePasswordMutation.isPending}
                    className="min-w-[160px] font-bold"
                  >
                    {t('buttons.updatePassword')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
