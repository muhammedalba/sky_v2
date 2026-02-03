'use client';

import { use, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useBrands, useDeleteBrand } from '@/hooks/api/useBrands';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Icons } from '@/components/ui/Icons';
import { Skeleton } from '@/components/ui/Skeleton';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTrans } from '@/hooks/useTrans';
import { debounce } from '@/lib/utils';
import { Brand } from '@/types';

export default function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations('brands');
  const tCommon = useTranslations('messages');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const getTrans = useTrans();
  const confirmDialog = useConfirmDialog();

  const { data, isLoading, refetch } = useBrands({ page, limit: 10, search });
  const deleteMutation = useDeleteBrand();

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleDelete = async (id: string, name: string) => {
    confirmDialog.openDialog({
      title: tCommon('deleteItem', { item: t('entityLabel') }),
      message: tCommon('deleteConfirmWithName', { name }),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage and organize your product brands with ease
          </p>
        </div>
        <Link href={`/${locale}/dashboard/brands/create`}>
          <Button className="h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
            <Icons.Plus className="w-5 h-5" /> 
            {t('createBrand')}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-border/40 shadow-sm w-full max-w-2xl">
        <div className="relative flex-1 group">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <Input
             placeholder="Search by brand name..."
             className="pl-11 h-12 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
             onChange={(e) => handleSearch(e.target.value)}
           />
        </div>
      </div>

      <EntityDataTable<Brand>
        data={data?.data}
        isLoading={isLoading}
        metadata={data?.metadata}
        page={page}
        onPageChange={setPage}
        columns={[
          {
            header: t('fields.image'),
            className: "w-[100px] pl-6",
            render: (brand: Brand) => (
              <div className="h-14 w-14 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
                <ImageWithFallback 
                  src={brand.image || ''} 
                  alt={getTrans(brand.name)} 
                  fill
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
            )
          },
          {
            header: t('fields.name'),
            render: (brand: Brand) => (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {getTrans(brand.name)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                  ID: {brand._id.substring(0, 8)}...
                </span>
              </div>
            )
          },
          {
            header: t('fields.actions'),
            className: "pr-6 text-right",
            render: (brand: Brand) => (
              <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
                  onClick={() => router.push(`/${locale}/dashboard/brands/${brand._id}/edit`)}
                >
                  {t('buttons.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
                  onClick={() => handleDelete(brand._id, getTrans(brand.name))}
                  isLoading={deleteMutation.isPending}
                >
                  {t('buttons.delete')}
                </Button>
              </div>
            )
          }
        ]}
        emptyState={{
          title: tCommon('noData'),
          description: "Try adjusting your search or create a new brand to get started.",
          createLink: `/${locale}/dashboard/brands/create`,
          createLabel: t('createBrand')
        }}
      />

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
