'use client';

import { useState, use } from 'react';
import { useProduct } from '@/hooks/api/useProducts';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency } from '@/lib/utils';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { Product } from '@/types';

import { useTrans } from '@/hooks/useTrans';
import { useToast } from '@/hooks/useToast';

export default function ProductDetailsPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = use(params);
  const getTrans = useTrans();
  const toast = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Assuming slug is actually the ID based on ProductCard logic
  const { data: product, isLoading, error } = useProduct(slug);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
               <Skeleton className="h-10 w-3/4" />
               <Skeleton className="h-6 w-1/4" />
               <Skeleton className="h-32 w-full" />
               <Skeleton className="h-12 w-40" />
            </div>
         </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
              <Icons.Menu className="w-12 h-12 text-muted-foreground/40" />
          </div>
          <h2 className="text-3xl font-black mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
              We couldn't find the product you're looking for. It might have been moved or deleted.
          </p>
          <Button size="lg" className="rounded-full px-8" onClick={() => window.history.back()}>
              Go Back
          </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    setAdding(true);
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex((item: any) => item._id === product._id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        setTimeout(() => {
            setAdding(false);
            toast.success('Added to cart!');
        }, 500);
    } catch (e) {
        console.error(e);
        setAdding(false);
    }
  };

  const currentImage = selectedImage || product.imageCover || '';
  const stock = product.stockSummary ?? 0;
  
  // Use price range for display
  const minPrice = product.priceRange?.min ?? 0;
  const maxPrice = product.priceRange?.max ?? 0;
  const isSinglePrice = minPrice === maxPrice;

  const title = getTrans(product.title) || 'Product';
  const description = getTrans(product.description);
  const categoryName = typeof product.category === 'object' ? getTrans(product.category.name) : 'Uncategorized';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Gallery Section */}
        <div className="space-y-4">
           <div className="relative aspect-square bg-secondary/20 rounded-3xl overflow-hidden border border-border/50 shadow-sm group">
              <ImageWithFallback
                 src={currentImage}
                 alt={title}
                 fill
                 className="object-cover transition-transform duration-700 group-hover:scale-105"
                 priority
              />
           </div>
           
           {product.images && product.images.length > 0 && (
               <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  <button 
                      onClick={() => setSelectedImage(product.imageCover || '')}
                      className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${!selectedImage || selectedImage === product.imageCover ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                      <ImageWithFallback src={product.imageCover || ''} alt="Main" fill className="object-cover" />
                  </button>
                  {product.images.map((img: string, i: number) => (
                      <button 
                          key={i}
                          onClick={() => setSelectedImage(img)}
                          className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                          <ImageWithFallback src={img} alt={`View ${i}`} fill className="object-cover" />
                      </button>
                  ))}
               </div>
           )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
           <div className="mb-4">
              <Badge variant="secondary" className="text-sm font-bold bg-primary/5 text-primary border-primary/10">
                  {categoryName}
              </Badge>
           </div>
           
           <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-6 leading-tight">
              {title}
           </h1>

           <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-black text-primary">
                  {isSinglePrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
              </span>
           </div>

           <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground mb-10 leading-relaxed text-lg">
              <p>{description}</p>
           </div>

           <div className="mt-auto pt-8 border-t border-border/50">
               <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center border border-border/60 rounded-full h-14 w-fit bg-background p-1">
                      <button 
                          className="w-12 h-full flex items-center justify-center hover:bg-secondary/80 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                      >
                          <Icons.Menu className="w-4 h-4" />
                      </button>
                      <div className="w-10 text-center font-black text-xl">{quantity}</div>
                      <button 
                          className="w-12 h-full flex items-center justify-center hover:bg-secondary/80 rounded-full transition-colors"
                          onClick={() => setQuantity(quantity + 1)}
                      >
                          <Icons.Menu className="w-4 h-4 rotate-45" />
                      </button>
                  </div>
                  
                  <Button 
                      size="lg" 
                      className="flex-1 h-16 rounded-full text-xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={handleAddToCart}
                      isLoading={adding}
                      disabled={stock <= 0}
                  >
                      {stock > 0 ? (
                          <>
                              <Icons.Menu className="w-6 h-6 mr-3" />
                              Add to Bag
                          </>
                      ) : (
                          'Sold Out'
                      )}
                  </Button>
               </div>
               
               <div className={`flex items-center gap-3 text-sm font-bold w-fit px-4 py-2.5 rounded-2xl border transition-all ${stock > 0 ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  {stock > 0 ? `${stock} Pieces available in stock` : 'Currently Unavailable'}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
