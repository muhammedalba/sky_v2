'use client';

import { useState } from 'react';
import Modal from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { usePermissionsList, useCreateRole, useUpdateRole } from '../hooks/useRoles';
import { Role, PermissionGroup } from '../types';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/hooks/useToast';

interface RoleDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoleDialog({ role, isOpen, onClose, onSuccess }: RoleDialogProps) {
  const t = useTranslations('roles');
  const tButtons = useTranslations('common.buttons');
  const { data: permissionGroups, isLoading: isLoadingPerms } = usePermissionsList();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const toast = useToast();

  const [prevRole, setPrevRole] = useState(role);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    level: role?.level || 0,
    permissions: role?.permissions || []
  });

  if (role !== prevRole || isOpen !== prevIsOpen) {
    setPrevRole(role);
    setPrevIsOpen(isOpen);
    setFormData({
      name: role?.name || '',
      description: role?.description || '',
      level: role?.level || 0,
      permissions: role?.permissions || []
    });
  }

  const togglePermission = (key: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key]
    }));
  };

  const toggleGroup = (group: PermissionGroup) => {
    const allKeys = group.permissions.map(p => p.key);

    setFormData(prev => {
      const hasAll = allKeys.every(k => prev.permissions.includes(k));

      if (hasAll) {
        // Remove all permissions in this group
        return {
          ...prev,
          permissions: prev.permissions.filter(k => !allKeys.includes(k))
        };
      } else {
        // Add all missing permissions in this group
        return {
          ...prev,
          permissions: Array.from(new Set([...prev.permissions, ...allKeys]))
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (role) {
        await updateMutation.mutateAsync({ id: role._id, data: formData });
        toast.success(t('dialog.success'));
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(t('dialog.success'));
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save role:", error);
      toast.error(t('dialog.error'));

    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? t('editRole') : t('createRole')}
      description={role ? t('editRole') : t('createRole')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('dialog.nameLabel')}
            placeholder={t('dialog.namePlaceholder')}
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            disabled={isSubmitting}
            icon={Icons.Shield}
          />
          <Input
            label={t('dialog.levelLabel')}
            type="number"
            min="0"
            max="100"
            value={String(formData.level)}
            onChange={e => setFormData(prev => ({ ...prev, level: Number(e.target.value) }))}
            required
          />
          <div className="md:col-span-2">
            <Textarea
              label={t('dialog.descLabel')}
              placeholder={t('dialog.descPlaceholder')}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              disabled={isSubmitting}
              icon={Icons.Edit}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h3 className="title-gradient font-bold flex items-center gap-2">
              <Icons.Shield className="w-5 h-5 text-destructive" />
              {t('dialog.availablePerms')}
            </h3>
            <Badge variant="success">
              {t('dialog.selectedPerms', { count: formData.permissions.length })}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingPerms ? (
              <div className="col-span-2 text-center py-10 text-muted-foreground">
                {t('dialog.loadingPerms')}
              </div>
            ) : (
              permissionGroups?.map((group: PermissionGroup) => {
                const isAllSelected = group.permissions.every(p => formData.permissions.includes(p.key));

                return (
                  <div key={group.group} className="space-y-3 rounded-2xl bg-muted/30 overflow-hidden border border-border/40">
                    <div className="flex items-center justify-between bg-muted p-4 border-b border-border/20 pb-2 mb-2">
                      <span className="font-bold text-sm text-primary uppercase tracking-wider">
                        {group.group}
                      </span>
                      <Button
                        type="button"
                        variant={isAllSelected ? "outline" : "default"}
                        size="sm"
                        className={cn(
                          isAllSelected
                            ? "bg-destructive/5 hover:bg-destructive/20 text-destructive hover:text-destructive"
                            : "bg-primary/5 text-primary hover:bg-primary/20 hover:text-primary",
                          "h-7 text-[10px] px-2 shadow-none"
                        )}
                        onClick={() => toggleGroup(group)}
                      >
                        {isAllSelected ? t('dialog.deselectAll') : t('dialog.selectAll')}
                      </Button>
                    </div>
                    <div className="space-y-4 p-3">
                      {group.permissions.map(perm => (
                        <Checkbox
                          key={perm.key}
                          label={perm.label}
                          description={perm.description}
                          checked={formData.permissions.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <Button type="button" variant="outline" onClick={onClose}>
            {tButtons('cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {role ? tButtons('save') : tButtons('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}