'use client';

import { use, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useProducts, useDeleteProduct, useRestoreProduct, useHardDeleteProduct, useUpdateProduct } from '@/features/products/hooks/useProducts';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency, truncate } from '@/lib/utils';
import { Product } from '@/types';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { useTrans } from '@/shared/hooks/useTrans';

import { useQueryState } from '@/shared/hooks/useQueryState';
import { useProductFilters } from '@/features/products/hooks/useProductFilters';
import { ProductFiltersBar } from '@/features/products/components/dashboard/ProductFiltersBar';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import Link from 'next/link';

type ViewTab = 'isActive' | 'deleted' | 'featured' | 'lowStock' | 'notActive' | 'sort' | 'unlimited_stock';

// نقل الثوابت خارج المكون لمنع إعادة تخصيص الذاكرة
const TAB_FILTER_PARAMS: Record<ViewTab, Record<string, string>> = {
  isActive: {},
  deleted: { isDeleted: 'true' },
  featured: { isFeatured: 'true' },
  lowStock: { sort: 'stockSummary', isUnlimitedStock: 'false' },
  notActive: { isActive: 'false' },
  sort: { sort: '-totalSold' }, 
  unlimited_stock: { isUnlimitedStock: 'true' },
};

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();

  const page = Number(getQueryParam('page', '1'));
  const viewTab = (getQueryParam('tab', 'isActive') as ViewTab);
  const { apiParams } = useProductFilters();

  const t = useTranslations('products');
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();

  // جلب البيانات
  const { data, isLoading, refetch } = useProducts({
    page,
    limit: 10,
    ...apiParams,
    ...TAB_FILTER_PARAMS[viewTab],
  } as Record<string, unknown>);
  console.log(" Products data", data?.data)
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  const hardDeleteMutation = useHardDeleteProduct();
  const updateMutation = useUpdateProduct();

  // الدوال المساعدة
  const handlePageChange = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);
  const handleTabChange = useCallback((val: ViewTab) => setQueryParams({ tab: val, page: 1 }), [setQueryParams]);

  const tabs = useMemo(() => [
    { key: 'isActive' as ViewTab, label: t('filters.active'), activeClass: 'bg-success text-white shadow-md shadow-green-500/20' },
    { key: 'notActive' as ViewTab, label: t('filters.disabled'), activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
    { key: 'sort' as ViewTab, label: t('filters.sold'), activeClass: 'bg-amber-400 text-white shadow-md shadow-amber-500/20' },
    { key: 'featured' as ViewTab, label: t('filters.featured'), activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/20' },
    { key: 'lowStock' as ViewTab, label: t('filters.lowStock'), activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/20' },
    { key: 'unlimited_stock' as ViewTab, label: t('filters.unlimitedStock'), activeClass: 'bg-sky-500 text-white shadow-md shadow-sky-500/20' },
    { key: 'deleted' as ViewTab, label: t('filters.deleted'), activeClass: 'bg-destructive text-destructive-foreground shadow-md shadow-destructive/20' },
  ], [t]);

  const handleSoftDelete = (id: string, title: string) => {
    confirmDialog.openDialog({
      title: t('messages.softDeleteTitle'),
      message: t('messages.softDeleteConfirm', { title }),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };

  const handleHardDelete = (id: string, title: string) => {
    confirmDialog.openDialog({
      title: t('form.hardDelete'),
      message: `${t('messages.hardDeleteConfirm')}\n\n"${title}"`,
      onConfirm: async () => {
        await hardDeleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };
  const handleRestore = async (id: string) => {

    await restoreMutation.mutateAsync(id);

    refetch();

  };
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('productList')}
        action={{
          label: t('createProduct'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => router.push(`/${locale}/dashboard/products/create`)
        }}
        totalResults={t('totalResults', { count: data?.meta?.pagination?.totalResults || 0 })}
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${viewTab === tab.key ? tab.activeClass : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ProductFiltersBar />

      <EntityDataTable<Product>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={handlePageChange}
        columns={[
          {
            header: t('fields.product', { defaultValue: 'Product' }),
            className: "w-[300px] ps-6",
            render: (product: Product, index: number) => (
              <>
                <Link href={`/${locale}/dashboard/products/${product.slug}/edit`} className="flex items-center gap-3">

                  <div className="h-14 w-14 rounded-2xl bg-muted/60 shrink-0 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
                    <ImageWithFallback
                      src={product.imageCover || ''}
                      alt={getTrans(product.title)}
                      fill
                      sizes="48px"
                      loading={index < 5 ? "eager" : "lazy"}
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {truncate(getTrans(product.title), 30)}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                        {product.variantCount ? `${product.variantCount} Variants` : 'Standard'}
                      </span>
                      {product.infoProductPdf && (
                        <Badge variant="success" className="text-[9px] px-1.5 py-0 rounded-sm">PDF</Badge>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Icons.Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.round(product.ratingsAverage || 0) ? 'text-amber-400' : 'text-zinc-200'}`}
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1 font-medium">({product.ratingsAverage || 0})</span>
                </div>

              </>
            )
          },
          {
            header: t('fields.status', { defaultValue: 'Status' }),
            className: "w-[150px]",
            render: (product: Product) => (
              <div className="flex flex-col gap-2">
                <Switch
                  checked={product.isFeatured}
                  onChange={(e) => updateMutation.mutate({ id: product._id, data: { isFeatured: e.target.checked } })}
                  disabled={updateMutation.isPending}
                  label={getTrans({ ar: "مميز", en: "Featured" })}
                  className="scale-75 origin-left rtl:origin-right"
                />
                <Switch
                  checked={product.isActive}
                  onChange={(e) => updateMutation.mutate({ id: product._id, data: { isActive: e.target.checked } })}
                  disabled={updateMutation.isPending}
                  label={getTrans({ ar: "نشط", en: "Active" })}
                  className="scale-75 origin-left rtl:origin-right"
                />
              </div>
            )
          },
          {
            header: `${t('fields.category', { defaultValue: 'Category' })} & ${t('form.brand', { defaultValue: 'brand' })}`,
            render: (product: Product) => (<>
              <Badge variant="outline" className="rounded-xl bg-muted/40 border-none font-bold text-xs px-3 py-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {product.category && typeof product.category === 'object' && 'name' in product.category
                  ? getTrans(product.category.name)
                  : typeof product.category === 'string' ? product.category : '-'}
              </Badge>
              <i className="mb-1 block!" />
              <Badge variant="outline" className="rounded-xl bg-muted/40 border-none font-bold text-xs px-3 py-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {product.brand && typeof product.brand === 'object' && 'name' in product.brand
                  ? getTrans(product.brand.name)
                  : typeof product.brand === 'string' ? product.brand : '-'}
              </Badge>
            </>
            )
          },
          {
            header: t('fields.price', { defaultValue: 'Price' }),
            render: (product: Product) => {
              const minPrice = product.priceRange?.min || 0;
              const maxPrice = product.priceRange?.max || 0;
              return (
                <span className="font-bold text-sm text-foreground">
                  {minPrice === maxPrice
                    ? formatCurrency(minPrice, locale)
                    : `${formatCurrency(minPrice, locale)} - ${formatCurrency(maxPrice, locale)}`}
                </span>
              );
            }
          },
          {
            header: t('fields.inventory', { defaultValue: 'Inventory' }),
            render: (product: Product) => {
              if (product.isUnlimitedStock) {
                return (<>
                  <Badge variant="default" className="rounded-full  p-1.5 font-bold text-xs border-indigo-500/20 text-primary bg-indigo-50/50 dark:bg-indigo-500/10 dark:text-indigo-400 gap-1.5 flex items-center w-fit group/badge hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all duration-300">
                    <Icons.Infinity className="w-4 h-4 group-hover/badge:rotate-12 transition-transform duration-500" />
                    {t('filters.unlimitedStock')}
                  </Badge>
                </>
                );
              }
              const stock = product.stockSummary ?? 0;
              return (
                <div className="flex flex-col gap-1 w-fit">
                  <span className="font-bold text-sm">
                    {stock} <span className="text-muted-foreground text-xs font-medium">in stock</span>
                  </span>
                  <Badge
                    variant={stock > 10 ? 'success' : stock > 0 ? 'warning' : 'danger'}
                    className="w-fit rounded-full px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider"
                  >
                    {stock > 0 ? (stock > 10 ? 'In Stock' : 'Low Stock') : 'Out of Stock'}
                  </Badge>
                </div>
              );
            }
          },
          {
            header: t('fields.actions') || 'Actions',
            className: "pe-6 text-end w-[120px]",
            render: (product: Product) => (
              <div className="flex justify-end gap-1 group-hover:scale-105 transition-all duration-300">
                {viewTab === 'deleted' ? (
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
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-12 w-12 rounded-lg hover:bg-primary/10 text-primary transition-colors "
                      onClick={() => router.push(`/${locale}/dashboard/products/${product.slug}/edit`)}
                    >
                      <Icons.Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-12 w-12 rounded-lg hover:bg-destructive/10 text-destructive transition-colors "
                      onClick={() => handleSoftDelete(product._id, getTrans(product.title))}
                      isLoading={deleteMutation.isPending}
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            )
          }
        ]}
        expandableContent={(product) => {
          if (!product.variants || product.variants.length === 0) {
            return <div className="text-sm text-muted-foreground py-2 text-center">No variants available</div>;
          }
          return (
            <div className="bg-background rounded-xl ring-1 ring-border/50 p-4 shadow-sm">
              <h4 className="font-bold text-sm mb-3 text-foreground">Product Variants</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2 rounded-l-lg">{t('fields.sku')}</th>
                      <th className="px-4 py-2">{t('fields.attributes')}</th>
                      <th className="px-4 py-2">{t('fields.price')}</th>
                      <th className="px-4 py-2 rounded-r-lg">{t('fields.stock')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant, i) => (
                      <tr key={variant.sku || i} className="border-b border-border/10 last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2 font-mono text-xs">{variant.sku || '-'}</td>
                        <td className="px-4 py-2">
                          {Object.entries(variant.attributes || {}).map(([key, value]) => (
                            <span key={key} className="inline-block bg-muted px-2 py-0.5 rounded text-[10px] mr-1">
                              {key}: {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-2 font-semibold">{formatCurrency(variant.price, locale)}</td>
                        <td className="px-4 py-2">
                          <span className={variant.stock > 0 ? "text-success" : "text-destructive"}>
                            {variant.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }}
        emptyState={{
          title: viewTab === 'deleted' ? t('form.noDeletedProducts')
            : viewTab === 'featured' ? t('filters.noFeatured')
              : viewTab === 'unlimited_stock' ? t('filters.noUnlimitedStock')
                : viewTab === 'lowStock' ? t('filters.noLowStock')
                  : viewTab === 'notActive' ? t('filters.noDisabled')
                    : t('emptyState.noProducts'),
          description: viewTab === 'deleted'
            ? t('emptyState.deletedDesc')
            : t('emptyState.activeDesc'),
          createLink: viewTab === 'isActive' ? `/${locale}/dashboard/products/create` : undefined,
          createLabel: viewTab === 'isActive' ? t('createProduct') : undefined
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDangerous
        isLoading={confirmDialog.isLoading}
        cancelText={t('form.cancel')}
        confirmText={t('form.confirm')}
      />
    </div>
  );
}