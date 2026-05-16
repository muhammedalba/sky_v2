'use client';

import { useEffect, useState } from 'react';
import Modal from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { usePermissionsList, useCreateRole, useUpdateRole } from '../hooks/useRoles';
import { Role, PermissionGroup } from '../types';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';

interface RoleDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoleDialog({ role, isOpen, onClose, onSuccess }: RoleDialogProps) {
  const { data: permissionGroups, isLoading: isLoadingPerms } = usePermissionsList();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 0,
    permissions: [] as string[]
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        level: role.level,
        permissions: role.permissions || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        level: 0,
        permissions: []
      });
    }
  }, [role, isOpen]);

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
    const hasAll = allKeys.every(k => formData.permissions.includes(k));

    if (hasAll) {
      // Remove all
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(k => !allKeys.includes(k))
      }));
    } else {
      // Add all missing
      setFormData(prev => ({
        ...prev,
        permissions: Array.from(new Set([...prev.permissions, ...allKeys]))
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (role) {
        await updateMutation.mutateAsync({ id: role._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {}
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? 'تعديل الدور' : 'إضافة دور جديد'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="اسم الدور"
            placeholder="مثل: مدير مبيعات"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="المستوى (0-100)"
            type="number"
            min="0"
            max="100"
            value={String(formData.level)}
            onChange={e => setFormData({ ...formData, level: Number(e.target.value) })}
            required
          />
          <div className="md:col-span-2">
            <Textarea
              label="الوصف"
              placeholder="وصف مهام هذا الدور..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Icons.Shield className="w-5 h-5 text-primary" />
              الصلاحيات المتاحة
            </h3>
            <Badge variant="outline">
              تم اختيار {formData.permissions.length} صلاحية
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingPerms ? (
              <div className="col-span-2 text-center py-10 text-muted-foreground">
                جاري تحميل الصلاحيات...
              </div>
            ) : (
              permissionGroups?.map((group: PermissionGroup) => (
                <div key={group.group} className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-2">
                    <span className="font-bold text-sm text-primary uppercase tracking-wider">
                      {group.group}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] px-2 hover:bg-primary/10"
                      onClick={() => toggleGroup(group)}
                    >
                      {group.permissions.every(p => formData.permissions.includes(p.key)) ? 'إلغاء الكل' : 'تحديد الكل'}
                    </Button>
                  </div>
                  <div className="space-y-4">
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
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {role ? 'حفظ التغييرات' : 'إنشاء الدور'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
