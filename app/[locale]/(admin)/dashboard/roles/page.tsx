'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRoles, useDeleteRole } from '@/features/roles/hooks/useRoles';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Tooltip } from '@/shared/ui/Tooltip';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useToast } from '@/shared/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { Role } from '@/features/roles/types';
import { useRouter } from 'next/navigation';
import { useMemo, useCallback, useState } from 'react';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import RoleDialog from '@/features/roles/components/RoleDialog';
import { Can } from '@/components/auth/Can';
import { Permissions } from '@/features/roles/types';

export default function RolesPage() {
  const locale = useLocale();
  const t = useTranslations('roles');
  const tButtons = useTranslations('common.buttons');
  const router = useRouter();
  const toast = useToast();

  const { data: roles, isLoading, refetch } = useRoles();
  const deleteMutation = useDeleteRole();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage } = useConfirmDialog();

  const handleDelete = useCallback((id: string, name: string) => {
    openDialog({
      title: t('messages.deleteTitle'),
      message: t('messages.deleteConfirm', { name }),
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          refetch();
        } catch (error) {}
      },
    });
  }, [openDialog, deleteMutation, refetch, t]);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setIsRoleDialogOpen(true);
  };

  const columns = useMemo(() => [
    {
      header: t('fields.name'),
      className: "pl-6",
      render: (role: Role) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {role.name}
          </span>
          {role.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {role.description}
            </span>
          )}
        </div>
      )
    },
    {
      header: t('fields.level'),
      render: (role: Role) => (
        <Badge variant={role.level >= 90 ? 'destructive' : role.level >= 50 ? 'default' : 'secondary'}>
          {role.level}
        </Badge>
      )
    },
    {
      header: t('fields.users'),
      className: "text-center",
      render: (role: Role) => (
        <div className="flex items-center justify-center gap-2">
          <Icons.Users className="w-4 h-4 text-muted-foreground/60" />
          <span className="font-bold">{role.userCount || 0}</span>
        </div>
      )
    },
    {
      header: t('fields.permissions'),
      render: (role: Role) => (
        <span className="text-sm text-muted-foreground">
          {t('permissionCount', { count: role.permissions?.length || 0 })}
        </span>
      )
    },
    {
      header: t('fields.createdAt'),
      render: (role: Role) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(role.createdAt)}
        </span>
      )
    },
    {
      header: t('fields.actions'),
      className: "text-right pr-6",
      render: (role: Role) => (
        <div className="flex items-center justify-end gap-2">
          <Can permission={Permissions.UPDATE_ROLE}>
            <Tooltip content={tButtons('edit')}>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => handleEdit(role)}
              >
                <Icons.Edit className="h-4 w-4" />
              </Button>
            </Tooltip>
          </Can>

          {role.level < 100 && (
            <Can permission={Permissions.DELETE_ROLE}>
              <Tooltip content={tButtons('delete')}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(role._id, role.name)}
                >
                  <Icons.Trash className="h-4 w-4" />
                </Button>
              </Tooltip>
            </Can>
          )}
        </div>
      )
    }
  ], [handleDelete, t, tButtons]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: roles?.length || 0 })}
        action={{
          label: t('createRole'),
          icon: <Icons.Plus className="w-4 h-4" />,
          onClick: handleCreate,
        }}
      />

      <EntityDataTable<Role>
        data={roles || []}
        isLoading={isLoading}
        columns={columns}
        emptyState={{
          title: t('emptyState.title'),
          description: t('emptyState.description'),
          icon: <Icons.Shield className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />

      <RoleDialog
        role={selectedRole}
        isOpen={isRoleDialogOpen}
        onClose={() => setIsRoleDialogOpen(false)}
        onSuccess={() => {
          setIsRoleDialogOpen(false);
          refetch();
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
