'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useUsers, useDeleteUser, useUpdateUser } from '@/features/users/hooks/useUsers';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { Tooltip } from '@/shared/ui/Tooltip';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useToast } from '@/shared/hooks/useToast';
import { cn, formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { env } from '@/lib/env';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';


export default function UsersPage() {
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const locale = useLocale();
  const t = useTranslations('users');
  const tButtons = useTranslations('common.buttons');
  const tMessages = useTranslations('users.messages');
  const router = useRouter();
  const toast = useToast();

  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const activeTab = getQueryParam('tab', 'active');

  const { data, isLoading, refetch } = useUsers({
    page,
    limit: 10,
    keywords: search,
    isActive: activeTab === 'active' ? undefined : false
  });
  console.log(data);

  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser();

  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage } = useConfirmDialog();

  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);

  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);

  const handleTabChange = useCallback((tabValue: string) => {
    setQueryParams({ tab: tabValue, page: 1 });
  }, [setQueryParams]);



  const handleDelete = useCallback((id: string, name: string) => {
    openDialog({
      title: tMessages('deleteConfirm'),
      message: tMessages('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(tMessages('deleteSuccess'));
          refetch()
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : tMessages('deleteError');
          toast.error(errorMessage);
        }
      },
    });
  }, [openDialog, deleteMutation, toast, refetch, tMessages]);





  const handleStatusChange = useCallback(async (user: User, newStatus: boolean) => {
    if (newStatus === undefined) return;
    try {
      const formData = new FormData();
      formData.append('isActive', String(newStatus));

      await updateMutation.mutateAsync({
        id: user._id,
        data: formData
      });
      toast.success(t('messages.updateSuccess'));
      refetch()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('messages.updateError');
      toast.error(errorMessage);
    }
  }, [updateMutation, toast, t, refetch]);

  // role badge
  const getRoleBadgeVariant = useCallback((role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'outline';
      default:
        return 'secondary';
    }
  }, []);

  const columns = useMemo(() => [
    {
      header: t('fields.logo'),
      className: "w-[100px] pl-6",
      render: (user: User) => (
        <div className="h-14 w-14 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
          <ImageWithFallback
            src={user.avatar || ''}
            alt={user.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )
    },
    {
      header: t('fields.name'),
      className: "pl-6",
      render: (user: User) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
              {user.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
              ID: {user._id.substring(0, 8)}...
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
              <span className="text-xs font-bold text-primary/50 uppercase tracking-tight">{user.createdAt ? formatDate(user.createdAt) : ''}</span>
            </span>
          </div>
        </div>
      )
    },
    {
      header: t('fields.email'),
      render: (user: User) => (
        <div className="flex items-center gap-2">
          {user.phone && (
            <Tooltip content={user.phone}>
              <a href={`tel:${user.phone}`} className="text-success hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted/50 border border-transparent hover:border-border">
                <Icons.Phone className="w-4 h-4" />
              </a>
            </Tooltip>
          )}
          {user.email && (
            <Tooltip content={user.email}>
              <a href={`mailto:${user.email}`} className="text-warning/80 hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted/50 border border-transparent hover:border-border">
                <Icons.Mail className="w-4 h-4" />
              </a>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      header: t('fields.role'),
      render: (user: User) => (
        <Badge variant={getRoleBadgeVariant(user.role)} className="rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none">
          {t(`roles.${user.role}`)}
        </Badge>
      )
    },
    {
      header: t('fields.lastLogin'),
      render: (user: User) => {
        const isOnline = user.lastLogin && (new Date().getTime() - new Date(user.lastLogin).getTime()) < 1000 * 60 * 5; // 5 mins
        return (
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
        );
      }
    },
    {
      header: t('fields.totalOrders'),
      className: "text-center",
      render: (user: User) => (
        <div className="flex flex-col items-center justify-center gap-1 group/orders">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-primary/5 border border-primary/10 group-hover/orders:bg-primary/10 group-hover/orders:border-primary/20 transition-all duration-300">
            <Icons.Orders className="w-4 h-4 text-primary opacity-70" />
            <span className="text-sm font-black text-primary">
              {user.totalOrders || 0}
            </span>
          </div>
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            {t('entityLabel')}
          </span>
        </div>
      )
    },
    {
      header: t('fields.status'),
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={user.isActive !== false}
            onChange={(e) => handleStatusChange(user, e.target.checked)}
            disabled={deleteMutation.isPending || isLoading || updateMutation.isPending}
          />
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider",
            user.isActive !== false ? "text-success" : "text-muted-foreground"
          )}>
            {user.isActive !== false ? t('fields.active') : t('fields.inactive')}
          </span>
        </div>
      )
    },
    {
      header: t('fields.actions'),
      className: "text-right pr-6",
      render: (user: User) => (
        <div className="flex items-center justify-end gap-2  transition-opacity">
          <Tooltip content={t('editUser')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl bg-background/50 border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
              onClick={() => router.push(`/${locale}/dashboard/users/${user._id}/edit`)}
              disabled={deleteMutation.isPending || isLoading || updateMutation.isPending}

            >
              <Icons.Edit className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content={tButtons('delete')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl bg-background/50 border-border/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
              onClick={() => handleDelete(user._id, user.name)}
              disabled={deleteMutation.isPending || isLoading || updateMutation.isPending}
              isLoading={deleteMutation.isPending}

            >
              <Icons.Trash className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [t, tButtons, locale, router, handleStatusChange, handleDelete, getRoleBadgeVariant]);

  const viewTabs = useMemo(() => [
    { id: 'active', label: t('fields.active'), value: 'active', icon: Icons.Check, activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { id: 'inactive', label: t('fields.inactive'), value: 'inactive', icon: Icons.X, activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
  ], [t]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('createUser'),
          icon: <Icons.Plus className="w-4 h-4" />,
          onClick: () => router.push(`/${locale}/dashboard/users/create`),
          disabled: deleteMutation.isPending || isLoading || updateMutation.isPending

        }}
      />

      <div className="flex flex-col gap-4">
        <EntitySearchBar
          defaultValue={search}
          onSearch={handleSearch}
          placeholder={t('searchPlaceholder')}
          disabled={deleteMutation.isPending || isLoading || updateMutation.isPending}
        />

        <div className="border-b border-border/40 pb-4">
          <div className="flex gap-2">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-2",
                  activeTab === tab.value
                    ? tab.activeClass
                    : "bg-muted/30 text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <EntityDataTable<User>
        data={data?.data?.filter((u: User) => !env.HIDDEN_EMAILS.includes(u.email)) || []}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('emptyState.title'),
          description: t('emptyState.description'),
          icon: <Icons.Users className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={tButtons('confirm')}
        cancelText={tButtons('cancel')}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
