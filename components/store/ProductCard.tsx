'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';

import { useTrans } from '@/hooks/useTrans';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const getTrans = useTrans();
  const hasDiscount = product.priceAfterDiscount && product.priceAfterDiscount < product.price;

  const title = getTrans(product.title) || getTrans(product.name) || 'Product';
  const categoryName = (product.category && typeof product.category === 'object') ? getTrans(product.category.name) : 'Uncategorized';

  return (
    <Link href={`/${locale}/products/${product._id}`} className="group h-full">
      <Card className="h-full border-border/50 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-background flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-secondary/20 overflow-hidden border-b border-border/50">
           {product.quantity <= 0 && (
              <div className="absolute top-2 right-2 z-10">
                 <Badge variant="destructive" className="font-bold">Out of Stock</Badge>
              </div>
           )}
           {product.quantity > 0 && hasDiscount && (
              <div className="absolute top-2 right-2 z-10">
                 <Badge variant="secondary" className="font-bold bg-green-500/10 text-green-600 border-none">Sale</Badge>
              </div>
           )}
           
           <ImageWithFallback
              src={product.imageCover || ''}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
           />
           
           {/* Quick Add Overlay (Desktop) */}
           <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block bg-gradient-to-t from-black/60 to-transparent">
              <Button size="sm" className="w-full rounded-full font-semibold bg-white text-black hover:bg-white/90">
                 View Details
              </Button>
           </div>
        </div>

        <CardContent className="p-5 flex-1 flex flex-col gap-2">
           <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {categoryName}
           </div>
           <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {title}
           </h3>
           <div className="mt-auto pt-2 flex items-baseline gap-2">
              <span className="text-lg font-black text-foreground">
                 {formatCurrency(hasDiscount ? product.priceAfterDiscount! : product.price)}
              </span>
              {hasDiscount && (
                 <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                    {formatCurrency(product.price)}
                 </span>
              )}
           </div>
        </CardContent>
      </Card>
    </Link>
  );
}
