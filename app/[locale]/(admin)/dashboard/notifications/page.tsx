'use client';

import { useTranslations } from 'next-intl';
import { useGetAdminNotifications, useAdminDeleteNotification } from '@/features/notifications/hooks/useNotifications';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Tooltip } from '@/shared/ui/Tooltip';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { formatDate } from '@/lib/utils';
import { Notification } from '@/features/notifications/api';
import { useMemo, useCallback } from 'react';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { Can } from '@/components/auth/Can';
import { Permissions } from '@/features/roles/types';
import { useRouter } from 'next/navigation';


export default function AdminNotificationsPage() {
  const t = useTranslations('notifications');
  const tButtons = useTranslations('common.buttons');
  const tMessages = useTranslations('common.messages');
  const router = useRouter();
  
  // Use the admin-specific endpoint that returns ALL system notifications (not just current user's)
  const { data: response, isLoading } = useGetAdminNotifications(1, 100);
  const deleteMutation = useAdminDeleteNotification();

  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage } = useConfirmDialog();

  const handleDelete = useCallback((id: string) => {
    openDialog({
      title: t('admin.globalDelete'),
      message: t('admin.globalDeleteConfirm'),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  }, [openDialog, deleteMutation, t]);

  const columns = useMemo(() => [
    {
      header: t('columns.type'),
      className: "pl-6",
      render: (item: Notification) => (
        <Badge variant={item.type === 'BROADCAST' ? 'default' : 'outline'}>
          {item.type === 'BROADCAST' ? t('admin.typeBroadcast') : t('admin.typeDirect')}
        </Badge>
      )
    },
    {
      header: t('columns.action'),
      render: (item: Notification) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md">
          {item.action}
        </span>
      )
    },
    {
      header: t('columns.message'),
      render: (item: Notification) => (
        <span className="text-sm font-medium line-clamp-2" title={item.message}>
          {item.message}
        </span>
      )
    },
    {
      header: t('columns.recipient'),
      render: (item: Notification) => {
        if (item.type === 'BROADCAST') {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        if (!item.recipient) {
          return <span className="text-sm text-muted-foreground">N/A</span>;
        }
        if (typeof item.recipient === 'object') {
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {item.recipient.name || item.recipient.email || item.recipient._id}
              </span>
              {item.recipient.name && item.recipient.email && (
                <span className="text-xs text-muted-foreground">
                  {item.recipient.email}
                </span>
              )}
            </div>
          );
        }
        return <span className="text-sm text-muted-foreground">{String(item.recipient)}</span>;
      }
    },
    {
      header: t('columns.date'),
      render: (item: Notification) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      )
    },
    {
      header: t('columns.actions'),
      className: "text-right pr-6",
      render: (item: Notification) => (
        <div className="flex items-center justify-end gap-2">
          <Can permission={Permissions.UPDATE_SETTINGS}>
            <Tooltip content={tButtons('delete')}>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(item._id)}
              >
                <Icons.Trash className="h-4 w-4 text-destructive" />
              </Button>
            </Tooltip>
          </Can>
        </div>
      )
    }
  ], [handleDelete, t, tButtons]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('admin.title')}
        subtitle={t('admin.list')}
        totalResults={tMessages('showingResults', { count: response?.data.length || 0 })}
        action={{
          label: t('admin.sendTitle'),
          icon: <Icons.Send className="w-4 h-4" />,
          onClick: () => router.push('/dashboard/notifications/send'),
          permission: Permissions.UPDATE_SETTINGS,
        }}
      />

      <EntityDataTable<Notification>
        data={response?.data || []}
        isLoading={isLoading}
        columns={columns}
        emptyState={{
          title: t('empty'),
          description: t('emptyDesc'),
          icon: <Icons.Bell className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={tButtons('delete')}
        cancelText={tButtons('cancel')}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
