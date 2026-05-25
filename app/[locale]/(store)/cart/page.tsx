'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { useCart, useRemoveFromCart, useClearCart } from '@/features/cart/hooks/useCart';
import { useCartStore } from '@/store/cart-store';
import { useMe } from '@/features/auth/hooks/useAuth';
import { getLocalizedValue } from '@/lib/utils';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { useSettings } from '@/app/providers/SettingsProvider';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';

const attributeTranslations: Record<string, { ar: string; en: string }> = {
  color: { ar: 'اللون', en: 'Color' },
  اللون: { ar: 'اللون', en: 'Color' },
  size: { ar: 'المقاس', en: 'Size' },
  المقاس: { ar: 'المقاس', en: 'Size' },
  الحجم: { ar: 'المقاس', en: 'Size' },
  weight: { ar: 'الوزن', en: 'Weight' },
  الوزن: { ar: 'الوزن', en: 'Weight' },
  material: { ar: 'المادة', en: 'Material' },
  المادة: { ar: 'المادة', en: 'Material' },
  storage: { ar: 'السعة', en: 'Storage' },
  السعة: { ar: 'السعة', en: 'Storage' },
  memory: { ar: 'الذاكرة', en: 'Memory' },
  الذاكرة: { ar: 'الذاكرة', en: 'Memory' },
};

const getAttributeLabel = (key: string, isAr: boolean) => {
  const normKey = key.trim().toLowerCase();
  const entry = attributeTranslations[normKey];
  if (entry) {
    return isAr ? entry.ar : entry.en;
  }
  return isAr ? key : key.charAt(0).toUpperCase() + key.slice(1);
};

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const formatCurrency = useFormatCurrency();
  const { data: user } = useMe();
  const settings = useSettings();
  
  // Data Fetching
  const { data: serverCart, isLoading } = useCart();
  const guestCartItems = useCartStore((state) => state.items);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const clearGuestCart = useCartStore((state) => state.clearCart);
  
  const { mutate: removeServerItem, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: clearServerCart } = useClearCart();

  const cartItems = user ? (serverCart?.items || []) : guestCartItems;
  
  const handleRemoveItem = (productId: string, variantId?: string) => {
    if (user) {
      removeServerItem(productId);
    } else {
      removeGuestItem(productId, variantId);
    }
  };

  const handleUpdateQuantity = (productId: string, variantId: string, currentQty: number, change: number) => {
    if (!user) {
      const newQty = Math.max(1, currentQty + change);
      updateGuestQuantity(productId, variantId, newQty);
    }
  };

  const handleClearCart = () => {
    if (user) clearServerCart();
    else clearGuestCart();
  };

  // Calculations
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const price = item.price || 
      (item.product?.variants?.find((v: any) => v._id === item.variantId)?.priceAfterDiscount) || 
      (item.product?.variants?.find((v: any) => v._id === item.variantId)?.price) ||
      item.product?.priceRange?.min || 
      item.product?.comparePrice || 0;
    
    return acc + (price * item.quantity);
  }, 0);
  
  const vatRate = settings.vatRate || 15;
  const tax = settings.taxesIncluded ? 0 : subtotal * (vatRate / 100);
  const totalAmount = subtotal + tax;

  if (isLoading && user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 bg-background/50 selection:bg-primary/30 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            {t('title') || 'Shopping Cart'}
          </h1>
          <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full">
            {cartItems.length} {isAr ? 'منتجات' : 'items'}
          </span>
        </div>

        {cartItems.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-40 h-40 bg-accent/50 rounded-full flex items-center justify-center relative">
               <ShoppingBag className="w-20 h-20 text-muted-foreground/40" />
               <div className="absolute top-4 right-4 w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-lg">
                 <span className="w-3 h-3 bg-destructive rounded-full" />
               </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-foreground">
                {t('empty.title') || 'Your cart is empty'}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-lg">
                {t('empty.subtitle') || "Looks like you haven't added anything to your cart yet. Discover our latest collections!"}
              </p>
            </div>
            <Link href="/products">
              <Button size="lg" className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-primary/20 gap-3 hover:scale-105 transition-transform">
                {t('empty.cta') || 'Start Shopping'}
                {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Items List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                 <h2 className="text-xl font-bold text-foreground">
                   {isAr ? 'قائمة المنتجات' : 'Product List'}
                 </h2>
                 <button 
                   className="text-sm font-bold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2" 
                   onClick={handleClearCart}
                 >
                    <Trash2 className="w-4 h-4" />
                    {isAr ? 'تفريغ السلة' : 'Clear Cart'}
                 </button>
              </div>

              <div className="space-y-4">
                {cartItems.map((item: any, idx: number) => {
                  const product = item.product;
                  if (!product) return null;
                  
                  const title = getLocalizedValue(product.title, locale);
                  const image = item.variant?.image || product.imageCover || '';
                  const categoryName = getLocalizedValue(product.category?.name, locale) || 'Category';
                  
                  const price = item.price || 
                    (product.variants?.find((v: any) => v._id === item.variantId)?.priceAfterDiscount) || 
                    (product.variants?.find((v: any) => v._id === item.variantId)?.price) ||
                    product.priceRange?.min || 
                    product.comparePrice || 0;

                  return (
                    <Card 
                      key={item.variantId || item.productId || idx} 
                      className="p-4 sm:p-5 border-border/50 rounded-3xl hover:shadow-lg transition-all group overflow-hidden bg-background"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start animate-in fade-in slide-in-from-left-4 fill-mode-both">
                        {/* Image */}
                        <Link href={`/products/${product.slug || product._id}`} className="w-32 h-32 bg-accent/30 rounded-2xl shrink-0 overflow-hidden relative border border-border/50">
                           <ImageWithFallback 
                             src={image} 
                             alt={(title as string) || 'Product'} 
                             fill 
                             className="object-cover group-hover:scale-105 transition-transform duration-500" 
                           />
                        </Link>

                        {/* Info */}
                        <div className="flex-1 space-y-2 w-full text-center sm:text-start">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                 {categoryName as string}
                              </div>
                              <Link href={`/products/${product.slug || product._id}`}>
                                <h3 className="text-lg font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
                                   {title as string}
                                </h3>
                              </Link>
                            </div>
                            <button 
                               onClick={() => handleRemoveItem(item.productId, item.variantId)}
                               disabled={isRemoving}
                               className="hidden sm:flex p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                            >
                               <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Variants & Stock */}
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 py-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              {t('item.stock_available') || 'In Stock'}
                            </span>
                            {item.variantId && product.variants?.find((v: any) => v._id === item.variantId)?.attributes && (
                               Object.entries(product.variants.find((v: any) => v._id === item.variantId).attributes).map(([key, val]: any) => {
                                 const displayKey = getAttributeLabel(key, isAr);
                                 return (
                                   <span key={key} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-accent/60 text-muted-foreground rounded-xl border border-border/40">
                                     <span className="opacity-70">{displayKey}:</span>
                                     <span className="font-extrabold text-foreground uppercase">{val.value} {val.unit || ''}</span>
                                   </span>
                                 );
                               })
                            )}
                          </div>
                          
                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between sm:justify-start sm:gap-6 pt-3">
                             <div className="text-xl font-black text-foreground">
                                {formatCurrency(price)}
                             </div>
                             
                             {!user ? (
                               <div className="flex items-center gap-3 bg-accent/40 rounded-xl p-1 border border-border/50">
                                 <button 
                                   onClick={() => handleUpdateQuantity(item.productId, item.variantId, item.quantity, -1)}
                                   disabled={item.quantity <= 1}
                                   className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-lg shadow-sm disabled:opacity-30 transition-all text-foreground"
                                 >
                                   <Minus className="w-4 h-4" />
                                 </button>
                                 <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                 <button 
                                   onClick={() => handleUpdateQuantity(item.productId, item.variantId, item.quantity, 1)}
                                   className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-lg shadow-sm transition-all text-foreground"
                                 >
                                   <Plus className="w-4 h-4" />
                                 </button>
                               </div>
                             ) : (
                               <div className="text-sm font-bold text-muted-foreground bg-accent/30 px-4 py-1.5 rounded-lg border border-border/50">
                                 {t('item.quantity') || 'Qty'}: {item.quantity}
                               </div>
                             )}

                             {/* Mobile remove button */}
                             <button 
                               onClick={() => handleRemoveItem(item.productId, item.variantId)}
                               disabled={isRemoving}
                               className="sm:hidden p-2 text-destructive bg-destructive/10 rounded-lg"
                             >
                               <Trash2 className="w-5 h-5" />
                             </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-8 duration-700">
               <Card className="p-6 sm:p-8 border-border/50 rounded-[2.5rem] shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-2xl">
                  <h2 className="text-2xl font-black text-foreground mb-6">
                    {t('summary.title') || 'Order Summary'}
                  </h2>
                  
                  <div className="space-y-4 font-medium mb-8">
                     <div className="flex items-center justify-between text-muted-foreground">
                        <span>{t('summary.subtotal') || 'Subtotal'}</span>
                        <span className="text-foreground font-bold">{formatCurrency(subtotal)}</span>
                     </div>
                     {tax > 0 && (
                       <div className="flex items-center justify-between text-muted-foreground">
                          <span>{t('summary.tax') || 'Tax'} ({vatRate}%)</span>
                          <span className="text-foreground font-bold">{formatCurrency(tax)}</span>
                       </div>
                     )}
                     <div className="flex items-center justify-between text-muted-foreground">
                        <span>{t('summary.shipping') || 'Shipping'}</span>
                        <span className="text-success font-bold bg-success/10 px-2 py-0.5 rounded text-sm">
                          {t('summary.free') || 'Free'}
                        </span>
                     </div>
                     <div className="h-px bg-border/50 my-2" />
                     <div className="flex items-center justify-between text-xl">
                        <span className="font-bold">{t('summary.total') || 'Total'}</span>
                        <span className="text-2xl font-black text-primary">{formatCurrency(totalAmount)}</span>
                     </div>
                  </div>

                  <div className="space-y-5">
                     <Button className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-3 group">
                        {t('summary.checkout') || 'Proceed to Checkout'}
                        {isAr ? <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                     </Button>
                     
                     {/* Guarantees */}
                     <div className="grid grid-cols-2 gap-3 text-xs font-bold text-muted-foreground">
                        <div className="flex items-center gap-2 justify-center bg-accent/30 py-2 rounded-xl">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          {isAr ? 'دفع آمن' : 'Secure Payment'}
                        </div>
                        <div className="flex items-center gap-2 justify-center bg-accent/30 py-2 rounded-xl">
                          <Truck className="w-4 h-4 text-primary" />
                          {isAr ? 'توصيل سريع' : 'Fast Delivery'}
                        </div>
                     </div>
                  </div>
               </Card>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
