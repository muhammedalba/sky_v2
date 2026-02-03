'use client';

import { useState, use } from 'react';
import { useProduct } from '@/hooks/api/useProducts';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency } from '@/lib/utils';
import ImageWithFallback from '@/components/ui/image/ImageWithFallback';
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
      <StoreLayout locale={locale}>
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
      </StoreLayout>
    );
  }

  if (error || !product) {
    return (
        <StoreLayout locale={locale}>
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        </StoreLayout>
    );
  }

  const handleAddToCart = () => {
    setAdding(true);
    // LocalStorage Logic
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex((item: Product) => item._id === product._id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Simulate loading
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
  
  // Calculate discount percentage
  const hasDiscount = product.priceAfterDiscount && product.priceAfterDiscount < product.price;
  const discount = hasDiscount && product.priceAfterDiscount
      ? Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100) 
      : null;

  const title = getTrans(product.title) || getTrans(product.name) || 'Product';
  const description = getTrans(product.description);
  const categoryName = typeof product.category === 'object' ? getTrans(product.category.name) : 'Uncategorized';

  return (
    <StoreLayout locale={locale}>
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Gallery Section */}
          <div className="space-y-4">
             <div className="relative aspect-square bg-secondary/20 rounded-3xl overflow-hidden border border-border/50 shadow-sm">
                <ImageWithFallback
                   src={currentImage}
                   alt={title}
                   fill
                   className="object-cover"
                   priority
                />
                
                {discount && (
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500 text-white border-0 text-lg px-3 py-1 font-bold">
                            -{discount}%
                        </Badge>
                    </div>
                )}
             </div>
             
             {product.images && product.images.length > 0 && (
                 <div className="flex gap-4 overflow-x-auto pb-2">
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
             <div className="mb-2">
                <Badge variant="outline" className="text-muted-foreground border-border/60">
                    {categoryName}
                </Badge>
             </div>
             
             <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4 leading-tight">
                {title}
             </h1>

             <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-black text-primary">
                    {formatCurrency(hasDiscount ? product.priceAfterDiscount! : product.price)}
                </span>
                {hasDiscount && (
                    <span className="text-xl text-muted-foreground line-through font-medium">
                        {formatCurrency(product.price)}
                    </span>
                )}
             </div>

             <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground mb-10 leading-relaxed">
                <p>{description}</p>
             </div>

             <div className="mt-auto pt-8 border-t border-border/50">
                 <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex items-center border border-border rounded-full h-14 w-fit bg-background">
                        <button 
                            className="w-14 h-full flex items-center justify-center hover:bg-secondary/50 rounded-l-full transition-colors disabled:opacity-50"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <div className="w-12 text-center font-bold text-lg">{quantity}</div>
                        <button 
                            className="w-14 h-full flex items-center justify-center hover:bg-secondary/50 rounded-r-full transition-colors"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            +
                        </button>
                    </div>
                    
                    <Button 
                        size="lg" 
                        className="flex-1 h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20"
                        onClick={handleAddToCart}
                        isLoading={adding}
                        disabled={product.quantity <= 0}
                    >
                        {product.quantity > 0 ? (
                            <>
                                <Icons.Menu className="w-5 h-5 mr-2" />
                                Add to Cart
                            </>
                        ) : (
                            'Out of Stock'
                        )}
                    </Button>
                 </div>
                 
                 <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 dark:bg-green-900/10 w-fit px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {product.quantity > 0 ? 'In Stock & Ready to Ship' : 'Currently Unavailable'}
                 </div>
             </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
