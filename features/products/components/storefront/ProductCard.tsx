'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { Product } from '@/types';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useTrans } from '@/shared/hooks/useTrans';
import { Star, ShoppingBag, Eye, TrendingUp } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const minPrice = product.priceRange?.min || 0;
  const maxPrice = product.priceRange?.max || 0;
  const hasRange = minPrice !== maxPrice;
  const stock = product.stockSummary ?? 0;
  const isUnlimited = product.isUnlimitedStock ?? false;

  const title = getTrans(product.title) || 'Product';
  
  const categoryName = (product.category && typeof product.category === 'object' && 'name' in product.category) 
    ? getTrans(product.category.name) 
    : 'Uncategorized';

  const brandName = (product.brand && typeof product.brand === 'object' && 'name' in product.brand)
    ? getTrans(product.brand.name)
    : null;

  // Rating calculations
  const rating = product.ratingsAverage || 0;
  const reviewsCount = product.ratingsQuantity || 0;

  // Let's check for fake or real discount to make it look premium
  const hasDiscount = product.comparePrice && product.comparePrice > minPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((product.comparePrice! - minPrice) / product.comparePrice!) * 100) 
    : 0;

  return (
    <Link href={`/${locale}/products/${product._id}`} className="group block h-full select-none">
      <Card className="h-full border border-border/50 bg-card rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/25 hover:-translate-y-1.5 transition-all duration-500 ease-out flex flex-col relative">
        
        {/* Top Badges overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          {product.isFeatured && (
            <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm border-0 uppercase tracking-wider backdrop-blur-xs">
              {locale === 'ar' ? 'مميز' : 'Featured'}
            </Badge>
          )}
          {!isUnlimited && stock <= 0 ? (
            <Badge variant="destructive" className="font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm border-0 uppercase tracking-wider backdrop-blur-xs">
              {locale === 'ar' ? 'نفد من المخزون' : 'Out of Stock'}
            </Badge>
          ) : !isUnlimited && stock <= 5 && stock > 0 ? (
            <Badge className="bg-orange-500 text-white hover:bg-orange-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm border-0 uppercase tracking-wider backdrop-blur-xs">
              {locale === 'ar' ? 'كمية محدودة' : 'Low Stock'}
            </Badge>
          ) : null}
          {hasDiscount && (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm border-0 backdrop-blur-xs">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Dynamic cover container */}
        <div className="relative aspect-square w-full bg-muted/20 overflow-hidden border-b border-border/40">
          <ImageWithFallback
            src={product.imageCover || ''}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
          />
          
          {/* Subtle elegant gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Quick-action glass overlay with visual icons (Desktop only) */}
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hidden md:flex bg-black/10 backdrop-blur-xs">
            <div className="p-3 rounded-full bg-background border border-border/60 hover:bg-primary hover:text-primary-foreground hover:scale-110 shadow-md shadow-black/5 transition-all duration-200">
              <Eye className="w-5 h-5" />
            </div>
            <div className="p-3 rounded-full bg-background border border-border/60 hover:bg-primary hover:text-primary-foreground hover:scale-110 shadow-md shadow-black/5 transition-all duration-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card Content Body */}
        <CardContent className="p-5 flex-1 flex flex-col gap-2 bg-gradient-to-b from-transparent to-muted/5">
          
          {/* Taxonomy row */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
            <span>{categoryName}</span>
            {brandName && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="text-primary/95">{brandName}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors duration-300 text-sm sm:text-base leading-snug line-clamp-2 h-[2.5rem] sm:h-[3rem]">
            {title}
          </h3>

          {/* Rating reviews block */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-black text-foreground">{rating.toFixed(1)}</span>
              {reviewsCount > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium">({reviewsCount})</span>
              )}
            </div>
          )}

          {/* Pricing, savings and sold summary */}
          <div className="mt-auto pt-3 flex flex-col gap-2 border-t border-border/30">
            <div className="flex flex-wrap items-baseline justify-between gap-1.5">
              
              {/* Dynamic Prices */}
              <div className="flex flex-col">
                {hasDiscount && (
                  <span className="text-[11px] line-through text-muted-foreground/60 font-semibold mb-0.5">
                    {formatCurrency(product.comparePrice!)}
                  </span>
                )}
                <span className="text-sm sm:text-base font-black text-foreground tracking-tight">
                  {hasRange 
                    ? `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}` 
                    : formatCurrency(minPrice)
                  }
                </span>
              </div>

              {/* Total sold statistics (glowing micro-counter) */}
              {product.totalSold && product.totalSold > 0 ? (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/65 px-2 py-0.5 rounded-md font-semibold shrink-0">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>
                    {locale === 'ar' ? 'بيعت' : 'Sold'} {product.totalSold}+
                  </span>
                </div>
              ) : null}

            </div>
          </div>

        </CardContent>

      </Card>
    </Link>
  );
}
