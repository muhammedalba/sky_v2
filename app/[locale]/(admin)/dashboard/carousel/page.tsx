'use client';

import { useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCarousel, useDeleteCarousel, useUpdateCarousel } from '@/features/marketing/hooks/useCarousel';
import { Button } from '@/shared/ui/Button';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { Switch } from '@/shared/ui/Switch';
import { Tooltip } from '@/shared/ui/Tooltip';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { Carousel as CarouselType } from '@/types';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useTrans } from '@/shared/hooks/useTrans';
import { useToast } from '@/shared/hooks/useToast';
import { useQueryState } from '@/shared/hooks/useQueryState';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import EntitySearchBar from '@/shared/ui/dashboard/EntitySearchBar';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CarouselPage() {
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();
  const locale = useLocale();
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();
  const t = useTranslations('carousel');
  const tCommon = useTranslations('messages');
  const tButtons = useTranslations('buttons');
  const toast = useToast();

  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const activeTab = getQueryParam('tab', 'active');

  const { data, isLoading, refetch } = useCarousel({
    page,
    limit: 10,
    keywords: search,
    isActive: activeTab === 'active' ? undefined : false
  });

  const { mutateAsync: deleteMutation, isPending: deleteCarouselPending } = useDeleteCarousel();
  const { mutateAsync: updateMutation, isPending: updateCarouselPending } = useUpdateCarousel();

  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);

  const handleSearch = useCallback((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, [setQueryParams]);

  const handleTabChange = useCallback((tabValue: string) => {
    setQueryParams({ tab: tabValue, page: 1 });
  }, [setQueryParams]);

  const handleStatusChange = useCallback(async (item: CarouselType, newStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append('isActive', String(newStatus));

      await updateMutation({
        id: item._id,
        data: formData
      });
      toast.success(tCommon('success'));
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : tCommon('error');
      toast.error(errorMessage);
    }
  }, [updateMutation, toast, tCommon, refetch]);

  const handleDelete = useCallback(async (id: string, description: string) => {
    confirmDialog.openDialog({
      title: tCommon('deleteItem', { item: t('entityLabel') }),
      message: tCommon('deleteConfirmWithName', { name: description }),
      onConfirm: async () => {
        try {
          await deleteMutation(id);
          toast.success(tCommon('success'));
          refetch();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : tCommon('error');
          toast.error(errorMessage);
        }
      },
    });
  }, [confirmDialog, deleteMutation, refetch, tCommon, toast, t]);

  const columns = useMemo(() => [
    {
      header: t('fields.image') || "Preview",
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
      header: t('fields.description') || "Description",
      render: (item: CarouselType) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-sm">
            {getTrans(item.description)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
            ID: {item._id.substring(0, 8)}...
          </span>
        </div>
      )
    },
    {
      header: t('fields.status') || "Status",
      render: (item: CarouselType) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={item.isActive !== false}
            onChange={(e) => handleStatusChange(item, e.target.checked)}
          />
          <Badge 
            variant={item.isActive !== false ? 'secondary' : 'destructive'} 
            className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider"
          >
            {item.isActive !== false ? (t('fields.active') || 'Active') : (t('fields.inactive') || 'Inactive')}
          </Badge>
        </div>
      )
    },
    {
      header: t('fields.actions') || "Actions",
      className: "ps-6 text-center",
      render: (item: CarouselType) => (
        <div className="flex justify-center gap-2 transition-all duration-300">
          <Tooltip content={tButtons('edit')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-primary rounded-xl bg-background/50 border-border/40 hover:bg-primary/10 hover:text-primary/70 hover:border-primary/20 transition-all"
              onClick={() => router.push(`/${locale}/dashboard/carousel/${item._id}/edit`)}
              disabled={deleteCarouselPending || isLoading || updateCarouselPending}
            >
              <Icons.Edit className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content={tButtons('delete')}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl bg-background/50 border-border/40 hover:bg-destructive/10 text-destructive hover:text-destructive/70 hover:border-destructive/20 transition-all"
              onClick={() => handleDelete(item._id, getTrans(item.description))}
              isLoading={deleteCarouselPending}
              disabled={deleteCarouselPending || isLoading || updateCarouselPending}
            > 
              <Icons.Trash className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [getTrans, handleDelete, tButtons, deleteCarouselPending, handleStatusChange, t, locale, router, updateCarouselPending, isLoading]);

  const viewTabs = useMemo(() => [
    { id: 'active', label: t('fields.active') || 'Active', value: 'active', icon: Icons.Check, activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { id: 'inactive', label: t('fields.inactive') || 'Inactive', value: 'inactive', icon: Icons.X, activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
  ], [t]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader 
        title={t('title') || 'Carousel'}
        subtitle={t('subtitle')}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: t('addSlide') || 'Add Slide',
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => router.push(`/${locale}/dashboard/carousel/create`),
          disabled: deleteCarouselPending || isLoading || updateCarouselPending
        }}
      />

      <div className="flex flex-col gap-4">
        <EntitySearchBar 
          defaultValue={search}
          placeholder={t('searchPlaceholder')}
          onSearch={handleSearch}
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

      <EntityDataTable<CarouselType>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={columns}
        emptyState={{
          title: t('emptyState.title') || "No slides found",
          description: t('emptyState.description') || "Engage your customers with beautiful high-resolution hero images.",
          icon: <Icons.Carousel className="h-10 w-10 text-muted-foreground/40" />,
          createLabel: t('addSlide') || 'Add Slide',
          createLink: () => router.push(`/${locale}/dashboard/carousel/create`)
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={tButtons('confirm')}
        cancelText={tButtons('cancel')}
        isDangerous={confirmDialog.isDangerous}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
