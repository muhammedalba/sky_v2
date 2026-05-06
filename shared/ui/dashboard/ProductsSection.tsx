'use client';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency } from '@/lib/utils';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { PieCompositionChart } from '@/shared/ui/charts/PieCompositionChart';
import { getProductTitle } from './types';
import { CHART_COLORS } from '@/shared/ui/charts/ChartUtils';
import type { DashboardData } from './types';

function StarRating({ rating, qty }: { rating: number; qty?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Icons.Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
      <span className="text-[10px] text-muted-foreground ms-1">{rating?.toFixed(1)}</span>
      {qty != null && <span className="text-[10px] text-muted-foreground/60">({qty})</span>}
    </div>
  );
}

export function ProductsSection({ d }: { d?: DashboardData }) {
  const t = useTranslations('dashboard.productsSection');
  const topProducts = d?.topProducts ?? [];
  const orderTopProducts = d?.orders?.topProducts ?? [];
  const topCustomers = d?.orders?.topCustomers ?? [];
  const suppliersWithProducts = d?.suppliers?.suppliersWithProducts ?? [];
  const supplierStatusData = (d?.suppliers?.suppliersByStatus ?? []).map(s => ({
    name: s._id ? t('active') : t('inactive'),
    value: s.count,
  }));

  const displayProducts = topProducts.length > 0 ? topProducts : orderTopProducts;
  const maxSold = Math.max(...displayProducts.map(p => p.totalSold ?? 0), 1);

  return (
    <div className="space-y-6">
      {/* Row 1: Top Products (full width) */}
      <Card className="border  shadow-md bg-background">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">{t('topProducts')}</CardTitle>
            <CardDescription>{t('topProductsDesc')}</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">{t('productsCount', { count: displayProducts.length })}</Badge>
        </CardHeader>
        <CardContent>
          {displayProducts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">{t('noProducts')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayProducts.map((product, idx) => {
                const title = getProductTitle(product.title);
                const sold = product.totalSold ?? 0;
                return (
                  <div key={product._id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-secondary/30 transition-colors group border border-border/40">
                    <span className="text-sm font-black text-muted-foreground w-5 shrink-0 mt-1">#{idx + 1}</span>
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-secondary shrink-0 ring-1 ring-border/50">
                      <ImageWithFallback
                        src={product.imageCover || ''}
                        alt={title}
                        fill
                        sizes="56px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* isActive dot indicator */}
                      <span className={`absolute top-1 inset-e-1 w-2 h-2 rounded-full ring-1 ring-background ${product.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm truncate">{title}</p>
                        {product.isFeatured && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-amber-400/15 text-amber-600 border-amber-400/30 shrink-0">
                            ⭐ {t('featured')}
                          </Badge>
                        )}
                        {product.isUnlimitedStock && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-sky-400/15 text-sky-600 border-sky-400/30 shrink-0">
                            ♾ {t('unlimited')}
                          </Badge>
                        )}
                      </div>
                      <StarRating rating={product.ratingsAverage ?? 0} qty={product.ratingsQuantity} />
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500"
                            style={{ width: `${(sold / maxSold) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{t('sold', { count: sold })}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {product.variantCount != null && (
                          <span className="text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded-md">
                            {product.variantCount !== 1 ? t('variantsPlural', { count: product.variantCount }) : t('variants', { count: product.variantCount })}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${product.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                          {product.isActive ? t('active') : t('inactive')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-sm">{formatCurrency(product.priceRange?.min ?? 0)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {product.isUnlimitedStock ? `♾ ${t('unlimited')}` : t('stock', { count: product.stockSummary ?? 0 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 2: Top Customers + Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Customers */}
        <Card className="border shadow-md bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">{t('topCustomers')}</CardTitle>
            <CardDescription>{t('topCustomersDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="p-3 rounded-full bg-secondary/50">
                  <Icons.Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{t('noCustomers')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {(c.name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t('orders', { count: c.orders })}</p>
                    </div>
                    {c.revenue != null && (
                      <span className="font-bold text-sm text-emerald-500">{formatCurrency(c.revenue)}</span>
                    )}
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-600' : 'bg-secondary'}`}>
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suppliers */}
        <Card className="border shadow-md bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">{t('suppliersOverview')}</CardTitle>
            <CardDescription>{t('totalSuppliers', { count: d?.suppliers?.totalSuppliers ?? 0 })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplierStatusData.length > 0 && (
              <div className="h-32">
                <PieCompositionChart 
                  data={supplierStatusData.map(s => ({
                    ...s,
                    color: s.name === t('active') ? '#22c55e' : '#f59e0b'
                  }))}
                  height={128}
                  innerRadius={30}
                  outerRadius={50}
                  showLegend={false}
                />
              </div>
            )}
            <div className="space-y-2">
              {suppliersWithProducts.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-3">{t('noSuppliers')}</p>
                : suppliersWithProducts.map((s, i) => (
                  <div key={s.supplierId} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                        {s.supplierName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold truncate max-w-[120px]">{s.supplierName}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{t('productsCount', { count: s.totalProducts })}</Badge>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
