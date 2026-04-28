'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/use-debounce';

import { useLocale } from 'next-intl';
import ProductCard from '@/features/products/components/storefront/ProductCard';
import { Input } from '@/shared/ui/Input';
import { Icons } from '@/shared/ui/Icons';
import { Skeleton } from '@/shared/ui/Skeleton';
import Pagination from '@/shared/ui/Pagination';
import { useProducts } from '@/features/products/hooks/useProducts';
import { Product } from '@/types';

// Accordion import removed

export default function ProductsPage() {
  const locale = useLocale();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 500);

  // const [sort, setSort] = useState('newest');

  const { data, isLoading } = useProducts({ page, limit: 12, keywords: search });
  
  useEffect(() => {
    setSearch(debouncedSearch);
    setPage(1);
  }, [debouncedSearch]);


  return (
    <>
      <div className="bg-muted/30 py-12 border-b border-border/50">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-black mb-4">Shop All Products</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
               Explore our premium collection of products designed for professionals.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
         {/* Mobile Filter / Search */}
         <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
            <div className="relative w-full md:w-96">
               <Icons.Menu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 h-12 rounded-full bg-background border-border/60 focus-visible:ring-primary/20"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
            </div>
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                   {isLoading ? 'Loading...' : `${data?.meta?.total || 0} Products`}
                </span>
             </div>
          </div>

          {/* Grid */}
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array(8).fill(0).map((_, i) => (
                   <div key={i} className="space-y-4">
                      <Skeleton className="aspect-4/3 rounded-xl" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                   </div>
                ))}
             </div>
          ) : data?.data?.length ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {data.data.map((product: Product) => (
                   <ProductCard key={product._id} product={product} locale={locale} />
                ))}
             </div>
          ) : (
             <div className="text-center py-24">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                   <Icons.Products className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
             </div>
          )}

          {/* Pagination */}
           {data?.meta?.pagination && data.meta.pagination.numberOfPages > 1 && (
             <div className="mt-16 flex justify-center">
                <Pagination 
                   pagination={data.meta.pagination}
                   onPageChange={setPage}
                />
             </div>
           )}
      </div>
    </>
  );
}
