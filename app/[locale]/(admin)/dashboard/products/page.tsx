'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProducts, useDeleteProduct, useRestoreProduct, useHardDeleteProduct, useUpdateProduct } from '@/features/products/hooks/useProducts';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
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

type ViewTab = 'all' | 'deleted' | 'featured' | 'unlimited_stock' | 'disabled';

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { getQueryParam, setQueryParam, setQueryParams } = useQueryState();

  const page = Number(getQueryParam('page', '1'));
  const viewTab = (getQueryParam('tab', 'all') as ViewTab);
  const { apiParams } = useProductFilters();

  const t = useTranslations('products');
  const tCommon = useTranslations('buttons');
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();

  const tabFilterParams: Record<ViewTab, Record<string, string>> = {
    all: {},
    deleted: { isDeleted: 'true' },
    featured: { isFeatured: 'true' },
    unlimited_stock: { isUnlimitedStock: 'true' },
    disabled: { disabled: 'true' },
  };

  const { data, isLoading, refetch } = useProducts({
    page,
    limit: 10,
    ...apiParams,
    ...tabFilterParams[viewTab],
  } as Record<string, unknown>);
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  const hardDeleteMutation = useHardDeleteProduct();
  const updateMutation = useUpdateProduct();
  const setPage = (val: number) => setQueryParam('page', val);
  const setViewTab = (val: ViewTab) => setQueryParams({ tab: val, page: 1 });
  console.log(data);

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
      <EntityPageHeader
        title={t('title')}
        subtitle={t('productList')}
        action={{
          label: t('createProduct'),
          icon: <Icons.Plus className="w-5 h-5" />,
          onClick: () => router.push(`/${locale}/dashboard/products/create`)
        }}
      />
      <div className="">total products: {data?.meta?.pagination?.totalResults}</div>
      {/* Tabs: Active / Featured / Unlimited Stock / Disabled / Deleted */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: 'all' as ViewTab, label: t('filters.all'), activeClass: 'bg-primary text-primary-foreground shadow-md shadow-primary/20' },
          { key: 'featured' as ViewTab, label: t('filters.featured'), activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/20' },
          { key: 'unlimited_stock' as ViewTab, label: t('filters.unlimitedStock'), activeClass: 'bg-sky-500 text-white shadow-md shadow-sky-500/20' },
          { key: 'disabled' as ViewTab, label: t('filters.disabled'), activeClass: 'bg-zinc-500 text-white shadow-md shadow-zinc-500/20' },
          { key: 'deleted' as ViewTab, label: t('filters.deleted'), activeClass: 'bg-destructive text-destructive-foreground shadow-md shadow-destructive/20' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewTab(tab.key)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${viewTab === tab.key
              ? tab.activeClass
              : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ProductFiltersBar />

      <EntityDataTable<Product>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={setPage}
        columns={[
          {
            header: t('fields.product', { defaultValue: 'Product' }),
            className: "w-[300px] pl-6",
            render: (product: Product, index: number) => (
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-muted/60 shrink-0 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/30 transition-all shadow-sm group-hover:shadow-md relative">
                  <ImageWithFallback
                    src={product.imageCover || ''}
                    alt={typeof product.title === 'string' ? product.title : getTrans(product.title)}
                    fill
                    sizes="48px"
                    loading={index < 5 ? "eager" : "lazy"}
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {truncate(getTrans(product.title), 20)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                      {product.variantCount ? `${product.variantCount} Variants` : 'Standard'}
                    </span>
                    {product.infoProductPdf && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-sm">PDF</Badge>
                    )}
                  </div>
                </div>
              </div>
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
                  description="Featured"
                  className="scale-75 origin-left rtl:origin-right"
                />
                <Switch
                  checked={!product.disabled}
                  onChange={(e) => updateMutation.mutate({ id: product._id, data: { disabled: !e.target.checked } })}
                  disabled={updateMutation.isPending}
                  description="Active"
                  className="scale-75 origin-left rtl:origin-right"
                />
              </div>
            )
          },
          {
            header: t('fields.category', { defaultValue: 'Category' }),
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
                <span className="font-black text-sm text-foreground">
                  {minPrice === maxPrice
                    ? formatCurrency(minPrice)
                    : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
                </span>
              );
            }
          },
          {
            header: t('fields.inventory', { defaultValue: 'Inventory' }),
            render: (product: Product) => {
              if (product.isUnlimitedStock) {
                return (
                  <Badge variant="outline" className="rounded-full px-3 py-1.5 font-bold text-xs border-indigo-500/20 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 dark:text-indigo-400 gap-1.5 flex items-center w-fit group/badge hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all duration-300">
                    <Icons.Infinity className="w-4 h-4 group-hover/badge:rotate-12 transition-transform duration-500" />
                    {t('filters.unlimitedStock')}
                  </Badge>
                );
              }
              const stock = product.stockSummary ?? 0;
              return (
                <div className="flex flex-col gap-1 w-fit">
                  <span className="font-bold text-sm">
                    {stock} <span className="text-muted-foreground text-xs font-medium">in stock</span>
                  </span>
                  <Badge
                    variant={stock > 10 ? 'default' : stock > 0 ? 'secondary' : 'destructive'}
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
            className: "pr-6 text-right w-[120px]",
            render: (product: Product) => (
              <div className="flex justify-end gap-1 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
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
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => router.push(`/${locale}/dashboard/products/${product.slug}/edit`)}
                    >
                      <Icons.Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
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
                      <th className="px-4 py-2 rounded-l-lg">SKU</th>
                      <th className="px-4 py-2">Attributes</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2 rounded-r-lg">Stock</th>
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
                        <td className="px-4 py-2 font-semibold">{formatCurrency(variant.price)}</td>
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
                : viewTab === 'disabled' ? t('filters.noDisabled')
                  : "No products found",
          description: viewTab === 'deleted'
            ? "All deleted products will appear here for restoration."
            : "Start by adding your first product to your catalog.",
          createLink: viewTab === 'all' ? `/${locale}/dashboard/products/create` : undefined,
          createLabel: viewTab === 'all' ? t('createProduct') : undefined
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
