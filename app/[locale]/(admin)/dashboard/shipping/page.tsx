'use client';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useShippingProviders, useDeleteShippingProvider } from '@/features/shipping/hooks/useShippingProviders';
import { ShippingProvider } from '@/features/shipping/types';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Icons } from '@/shared/ui/Icons';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import Modal from '@/shared/ui/Modal';
import ShippingProviderForm from '@/features/shipping/components/dashboard/ShippingProviderForm';
import { useTrans } from '@/shared/hooks/useTrans';
import { useToast } from '@/shared/hooks/useToast';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Badge } from '@/shared/ui/Badge';

export default function ShippingPage() {
  const { data, isLoading, refetch } = useShippingProviders();
  // console.log(data);
  const { mutateAsync: deleteProviderAsync, isPending: deleteProviderPending } = useDeleteShippingProvider();

  const t = useTranslations('shipping');
  const tMessages = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const getTrans = useTrans();
  const { success: toastSuccess, error: toastError } = useToast();

  const { openDialog, closeDialog, handleConfirm, isOpen: isConfirmOpen, isLoading: isConfirmLoading, title: confirmTitle, message: confirmMessage, isDangerous: isConfirmDangerous } = useConfirmDialog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);

  const handleOpenModal = useCallback((provider?: ShippingProvider) => {
    if (provider) {
      setEditingProvider(provider);
    } else {
      setEditingProvider(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProvider(null);
  }, []);

  const handleDelete = useCallback((id: string, name: string) => {
    openDialog({
      title: tMessages('deleteConfirm'),
      message: tMessages('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        try {
          await deleteProviderAsync(id);
          toastSuccess(tMessages('success'));
          refetch();
        } catch (error) {
          toastError(tMessages('error') || 'حدث خطأ أثناء الحذف');7
          console.log(error);
          
        }
      },
    });
  }, [openDialog, deleteProviderAsync, toastSuccess, toastError, refetch, tMessages]);

  const columns = useMemo(() => [
    {
      header: 'الشعار',
      className: "w-[100px] pl-6",
      render: (provider: ShippingProvider) => (
        <div className="h-14 w-14 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 relative">
          <ImageWithFallback
            src={provider.logo || ''}
            alt={getTrans(provider.name)}
            fill
            className="object-contain p-2"
          />
        </div>
      )
    },
    {
      header: 'شركة الشحن',
      render: (provider: ShippingProvider) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base text-foreground">
            {getTrans(provider.name)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
            {provider.code}
          </span>
        </div>
      )
    },
    {
      header: 'الحالة',
      render: (provider: ShippingProvider) => (
        <Badge variant={provider.isActive ? "default" : "secondary"}>
          {provider.isActive ? 'مفعل' : 'غير مفعل'}
        </Badge>
      )
    },
    {
      header: t('fields.actions') || 'إجراءات',
      className: "pe-6 text-center",
      render: (provider: ShippingProvider) => (
        <div className="flex justify-center gap-2">
          <Tooltip content={tButtons('edit')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-primary rounded-xl"
              onClick={() => handleOpenModal(provider)}
              disabled={deleteProviderPending || isLoading || isConfirmLoading}
            >
              <Icons.Edit className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content={tButtons('delete')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive rounded-xl hover:bg-destructive/10"
              onClick={() => handleDelete(provider._id, getTrans(provider.name))}
              isLoading={deleteProviderPending}
              disabled={deleteProviderPending || isLoading || isConfirmLoading}
            >
              <Icons.Trash className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [getTrans, handleOpenModal, handleDelete, deleteProviderPending, isLoading, isConfirmLoading, t, tButtons]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={'شركات الشحن'}
        subtitle={'إدارة مزودي الشحن المتاحين في المتجر'}
        totalResults={data?.length ? `${data.length} شركات` : '0 شركة'}
        action={{
          label: 'إضافة شركة شحن',
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
      />

      <EntityDataTable<ShippingProvider>
        data={data || []}
        isLoading={isLoading}
        columns={columns}
        emptyState={{
          title: tMessages('noData'),
          description: 'لا يوجد شركات شحن مضافة بعد.',
          createLink: () => handleOpenModal(),
          createLabel: 'إضافة شركة شحن'
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProvider ? 'تعديل شركة الشحن' : 'إضافة شركة شحن'}
        description={'قم بتعبئة بيانات شركة الشحن لتوفيرها للعملاء'}
      >
        <ShippingProviderForm
          editingProvider={editingProvider}
          onSuccess={() => {
            refetch();
            handleCloseModal();
          }}
          onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={tButtons('confirm')}
        cancelText={tButtons('cancel')}
        isDangerous={isConfirmDangerous}
        isLoading={isConfirmLoading}
      />
    </div>
  );
}
