'use client';

import { use, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCarousel, useDeleteCarousel } from '@/hooks/api/useCarousel';
import { Button } from '@/components/ui/Button';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';
import { Carousel as CarouselType } from '@/types';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTrans } from '@/hooks/useTrans';
import EntityPageHeader from '@/components/dashboard/EntityPageHeader';
import EntitySearchBar from '@/components/dashboard/EntitySearchBar';
import Modal from '@/components/ui/Modal';
import CarouselForm from '@/components/dashboard/forms/CarouselForm';
import { useToast } from '@/hooks/useToast';

export default function CarouselPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();
  const t = useTranslations('carousel');
  const tCommon = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<CarouselType | null>(null);

  const { data, isLoading, refetch } = useCarousel();
  const deleteMutation = useDeleteCarousel();

  const handleOpenModal = useCallback((carousel?: CarouselType) => {
    if (carousel) {
      setEditingCarousel(carousel);
    } else {
      setEditingCarousel(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCarousel(null);
  }, []);

  const handleDelete = useCallback(async (id: string, description: string) => {
    confirmDialog.openDialog({
      title: tCommon('deleteItem', { item: t('entityLabel') }),
      message: tCommon('deleteConfirmWithName', { name: getTrans(description) }),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        toast.success(tCommon('success'));
        refetch();
      },
    });
  }, [confirmDialog, deleteMutation, refetch, tCommon, toast]);

  const columns = useMemo(() => [
    {
      header: "Preview (Lg)",
      className: "w-[180px] pl-6",
      render: (item: CarouselType) => (
        <div className="h-24 w-40 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
          <ImageWithFallback 
            src={item.carouselLg || ''} 
            alt="Carousel" 
            fill
            sizes="160px"
            className="object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
      )
    },
    {
      header: "Description",
      render: (item: CarouselType) => (
        <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-sm">
          {getTrans(item.description)}
        </span>
      )
    },
    {
      header: "Status",
      render: (item: CarouselType) => (
        <Badge variant={item.isActive ? 'secondary' : 'destructive'} className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider">
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "pr-6 text-right",
      render: (item: CarouselType) => (
        <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
            onClick={() => handleOpenModal(item)}
          >
            {tButtons('edit')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
            onClick={() => handleDelete(item._id, getTrans(item.description))}
            isLoading={deleteMutation.isPending}
          >
            {tButtons('delete')}
          </Button>
        </div>
      )
    }
  ], [getTrans, handleDelete, handleOpenModal, tButtons, deleteMutation.isPending]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader 
        title={t('title') || 'Carousel'}
        subtitle={t('subtitle')}
        action={{
          label: t('addSlide'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => handleOpenModal()
        }}
      />

      <EntitySearchBar 
        placeholder={t('searchPlaceholder')}
        onSearch={() => {}} // Local search or reload if API supports
      />

      <EntityDataTable<CarouselType>
        data={data?.data}
        isLoading={isLoading}
        page={1}
        onPageChange={() => {}}
        columns={columns}
        emptyState={{
          title: "No slides found",
          description: "Engage your customers with beautiful high-resolution hero images.",
          createLink: undefined,
          createLabel: "Add Slide"
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCarousel ? 'Edit Slide' : 'Add Slide'}
        description="Configure your home page hero banner slides."
      >
        <CarouselForm 
          editingCarousel={editingCarousel} 
          onSuccess={() => {
            refetch();
            handleCloseModal();
          }} 
          onCancel={handleCloseModal} 
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
