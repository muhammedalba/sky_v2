'use client';

import Image from 'next/image';
import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProducts, useDeleteProduct } from '@/hooks/api/useProducts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency, debounce } from '@/lib/utils';
import { Product } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTrans } from '@/hooks/useTrans';

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const t = useTranslations('products');
  const tCommon = useTranslations('buttons');
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const getTrans = useTrans();

  const { data, isLoading, refetch } = useProducts({ page, limit: 10, search });
  const deleteMutation = useDeleteProduct();

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleDelete = async (id: string, title: string) => {
    confirmDialog.openDialog({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };

  const getCategoryName = (name: string | { en: string; ar: string }) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('productList')}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/products/create`}>
          <Button className="font-semibold flex items-center gap-2">
            <Icons.Menu className="w-4 h-4 rotate-45" /> 
            {t('createProduct')}
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
           <Icons.Menu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder={tCommon('search')}
             className="pl-9 h-10 w-full"
             onChange={(e) => handleSearch(e.target.value)}
           />
        </div>
      </div>

      {/* Products Table */}
      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="w-[80px] font-bold">{t('fields.image') || 'Image'}</TableHead>
                <TableHead className="font-bold">{t('fields.name')}</TableHead>
                <TableHead className="font-bold">{t('fields.category')}</TableHead>
                <TableHead className="font-bold">{t('fields.price')}</TableHead>
                <TableHead className="font-bold">{t('fields.stock')}</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-12 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data?.length ? (
                data.data.map((product: Product) => (
                  <TableRow key={product._id} className="group hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <div className="h-12 w-12 rounded-xl bg-secondary/50 overflow-hidden ring-1 ring-border/50 relative">
                        <ImageWithFallback 
                          src={product.imageCover || ''} 
                          alt={typeof product.title === 'string' ? product.title : getTrans(product.title)} 
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{getTrans(product.title || product.name)}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">SKU: {product.sku || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg bg-secondary/30 border-none font-medium text-xs">
                        {(() => {
                           const catName = (typeof product.category === 'object' && product.category !== null) ? product.category.name : '-';
                           if (typeof catName === 'object' && catName !== null) {
                              return (catName as any)[locale] || (catName as any)['en'] || '-';
                           }
                           return typeof catName === 'string' ? catName : '-';
                        })()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-sm">{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.quantity > 10 ? 'default' : product.quantity > 0 ? 'secondary' : 'destructive'}
                        className="rounded-full px-3 py-0 scale-90"
                      >
                        {product.quantity > 0 ? `${product.quantity} in Stock` : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button
                            size="sm"
                            variant="secondary"
                            className="bg-background hover:bg-primary hover:text-white rounded-lg px-4"
                            onClick={() => router.push(`/${locale}/dashboard/products/${product._id}/edit`)}
                          >
                            {tCommon('edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg px-4"
                            onClick={() => handleDelete(product._id, getTrans(product.title || product.name))}
                            isLoading={deleteMutation.isPending}
                          >
                            {tCommon('delete')}
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium">
                     No products found. Start by adding a new one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with Pagination */}
        {data?.metadata && data.metadata.numberOfPages > 1 && (
          <div className="p-4 border-t border-border bg-secondary/10 flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
               Showing page <span className="text-foreground font-bold">{page}</span> of {data.metadata.numberOfPages}
            </p>
            <Pagination
              currentPage={page}
              totalPages={data.metadata.numberOfPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

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
