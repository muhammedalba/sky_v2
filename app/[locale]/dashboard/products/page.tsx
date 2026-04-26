'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProducts, useDeleteProduct, useRestoreProduct, useHardDeleteProduct } from '@/features/products/hooks/useProducts';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency, debounce } from '@/lib/utils';
import { Product } from '@/types';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { useTrans } from '@/shared/hooks/useTrans';

import { useQueryState } from '@/shared/hooks/useQueryState';

type ViewTab = 'active' | 'deleted';

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();

  const page = Number(getQueryParam('page', '1'));
  const search = getQueryParam('search', '');
  const viewTab = (getQueryParam('tab', 'active') as ViewTab);

  const t = useTranslations('products');
  const tCommon = useTranslations('buttons');
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();

  const { data, isLoading, refetch } = useProducts({
    page,
    limit: 10,
    keywords: search,
    ...(viewTab === 'deleted' ? { isDeleted: 'true' } : {}),
  } as Record<string, unknown>);
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  const hardDeleteMutation = useHardDeleteProduct();

  const setPage = (val: number) => setQueryParam('page', val);
  const setViewTab = (val: ViewTab) => setQueryParams({ tab: val, page: 1 });

  const handleSearch = debounce((value: string) => {
    setQueryParams({ search: value, page: 1 });
  }, 500);

  const handleSoftDelete = async (id: string, title: string) => {
    confirmDialog.openDialog({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${title}"? It can be restored later.`,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };

  const handleRestore = async (id: string) => {
    await restoreMutation.mutateAsync(id);
    refetch();
  };

  const handleHardDelete = async (id: string, title: string) => {
    confirmDialog.openDialog({
      title: t('form.hardDelete'),
      message: `${t('messages.hardDeleteConfirm')}\n\n"${title}"`,
      onConfirm: async () => {
        await hardDeleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {t('productList')}
            </p>
          </div>
          <Link href={`/${locale}/dashboard/products/create`}>
            <Button className="h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
              <Icons.Plus className="w-5 h-5" /> 
              {t('createProduct')}
            </Button>
          </Link>
        </div>

        {/* Tabs: Active / Deleted */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('active')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              viewTab === 'active'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t('filters.active')}
          </button>
          <button
            onClick={() => setViewTab('deleted')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              viewTab === 'deleted'
                ? 'bg-destructive text-destructive-foreground shadow-md shadow-destructive/20'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t('filters.deleted')}
          </button>
        </div>

        <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-border/40 shadow-sm w-full max-w-2xl">
          <div className="relative flex-1 group">
             <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <Input
               placeholder={tCommon('search')}
               defaultValue={search}
               className="pl-11 h-12 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
               onChange={(e) => handleSearch(e.target.value)}
             />
          </div>
        </div>

        <EntityDataTable<Product>
          data={data?.data}
          isLoading={isLoading}
          pagination={data?.meta?.pagination}
          onPageChange={setPage}
          columns={[
            {
              header: t('fields.image') || 'Image',
              className: "w-[100px] pl-6",
              render: (product: Product) => (
                <div className="h-14 w-14 rounded-2xl bg-muted/60 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
                  <ImageWithFallback 
                    src={product.imageCover || ''} 
                    alt={typeof product.title === 'string' ? product.title : getTrans(product.title)} 
                    fill
                    sizes="48px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
              )
            },
            {
              header: t('fields.name', { defaultValue: 'Name' }),
              render: (product: Product) => (
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {getTrans(product.title)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                    {product.variantCount ? `${product.variantCount} Variants` : 'Standard Product'}
                  </span>
                </div>
              )
            },
            {
              header: t('fields.category', { defaultValue: 'Category' }),
              render: (product: Product) => (
                <Badge variant="outline" className="rounded-xl bg-muted/40 border-none font-bold text-xs px-3 py-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {product.category && typeof product.category === 'object' && 'name' in product.category
                    ? getTrans(product.category.name)
                    : typeof product.category === 'string' ? product.category : '-'}
                </Badge>
              )
            },
            {
              header: t('fields.price', { defaultValue: 'Price' }),
              render: (product: Product) => {
                const minPrice = product.priceRange?.min || 0;
                const maxPrice = product.priceRange?.max || 0;
                return (
                  <span className="font-black text-sm text-foreground">
                    {minPrice === maxPrice 
                      ? formatCurrency(minPrice) 
                      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
                  </span>
                );
              }
            },
            {
              header: t('fields.stock', { defaultValue: 'Stock' }),
              render: (product: Product) => {
                const stock = product.stockSummary ?? 0;
                return (
                  <Badge 
                    variant={stock > 10 ? 'default' : stock > 0 ? 'secondary' : 'destructive'}
                    className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider"
                  >
                    {stock > 0 ? `${stock} in Stock` : 'Out of Stock'}
                  </Badge>
                );
              }
            },
            {
              header: t('fields.actions') || 'Actions',
              className: "pr-6 text-right",
              render: (product: Product) => (
                <div className="flex justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  {viewTab === 'active' ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-background/80 hover:bg-primary hover:text-white border border-border/60 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95"
                        onClick={() => router.push(`/${locale}/dashboard/products/${product.slug}/edit`)}
                      >
                        {tCommon('edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
                        onClick={() => handleSoftDelete(product._id, getTrans(product.title))}
                        isLoading={deleteMutation.isPending}
                      >
                        {tCommon('delete')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-success/10 hover:bg-success hover:text-white border border-success/30 rounded-xl px-5 h-9 font-bold shadow-sm transition-all active:scale-95 text-success dark:text-success"
                        onClick={() => handleRestore(product._id)}
                        isLoading={restoreMutation.isPending}
                      >
                        {t('form.restoreProduct')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-xl px-5 h-9 font-bold shadow-sm shadow-destructive/10 hover:shadow-destructive/20 transition-all active:scale-95"
                        onClick={() => handleHardDelete(product._id, getTrans(product.title))}
                        isLoading={hardDeleteMutation.isPending}
                      >
                        {t('form.hardDelete')}
                      </Button>
                    </>
                  )}
                </div>
              )
            }
          ]}
          emptyState={{
            title: viewTab === 'deleted' ? t('form.noDeletedProducts') : "No products found",
            description: viewTab === 'deleted'
              ? "All deleted products will appear here for restoration."
              : "Start by adding your first product to your catalog.",
            createLink: viewTab === 'active' ? `/${locale}/dashboard/products/create` : undefined,
            createLabel: viewTab === 'active' ? t('createProduct') : undefined
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
