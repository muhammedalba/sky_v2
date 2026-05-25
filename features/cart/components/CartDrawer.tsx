'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { useCart, useRemoveFromCart } from '@/features/cart/hooks/useCart';
import { useMe } from '@/features/auth/hooks/useAuth';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { useTrans } from '@/shared/hooks/useTrans';
import { Button } from '@/shared/ui/Button';
import { X, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Minus, Plus } from 'lucide-react';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { createPortal } from 'react-dom';

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

export default function CartDrawer() {
  const { isCartDrawerOpen, closeCartDrawer } = useCartStore();
  const locale = useLocale();
  const t = useTranslations('cart');
  const formatCurrency = useFormatCurrency();
  const getTrans = useTrans();
  const { data: user } = useMe();
  const isAr = locale === 'ar';

  // --- Data Fetching ---
  const { data: serverCart } = useCart();
  const guestCartItems = useCartStore((state) => state.items);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const { mutate: removeServerItem } = useRemoveFromCart();
  
  // Use server cart if logged in, otherwise guest cart
  const cartItems = user ? (serverCart?.items || []) : guestCartItems;
  
  // Subtotal calculation
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    // If it's the server cart, price comes directly. If guest, price comes from product/variant
    const price = item.price || 
      (item.product?.variants?.find((v: { _id: string }) => v._id === item.variantId)?.priceAfterDiscount) || 
      (item.product?.variants?.find((v: { _id: string }) => v._id === item.variantId)?.price) ||
      item.product?.priceRange?.min || 
      item.product?.comparePrice || 0;
    
    return acc + (price * item.quantity);
  }, 0);

  // --- Handlers ---
  const handleRemove = (productId: string, variantId?: string) => {
    if (user) {
      removeServerItem(productId); // Assuming backend removes by productId for now
    } else {
      removeGuestItem(productId, variantId);
    }
  };

  const handleUpdateQuantity = (productId: string, variantId: string, currentQty: number, change: number) => {
    const newQty = Math.max(1, currentQty + change);
    if (!user) {
      updateGuestQuantity(productId, variantId, newQty);
    } else {
      // Backend quantity update API goes here if it exists. 
      // If it doesn't exist, we might need to add it or ignore for now.
    }
  };

  // --- Close on Esc ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={closeCartDrawer}
      />

      {/* Drawer */}
      <div 
        className={`absolute top-0 bottom-0 w-full sm:w-[400px] md:w-[450px] bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isAr ? 'left-0' : 'right-0'
        } animate-in slide-in-from-${isAr ? 'left' : 'right'} zoom-in-95`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black">{t('title') || 'Your Cart'}</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button 
            onClick={closeCartDrawer}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/50" />
              <p className="text-lg font-bold">{t('empty.title') || 'Your cart is empty'}</p>
              <Button onClick={closeCartDrawer} variant="outline" className="mt-4 rounded-xl">
                {t('empty.cta') || 'Continue Shopping'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item: any, idx: number) => {
                const product = item.product;
                if (!product) return null;
                
                const title = typeof product.title === 'string' ? product.title : getTrans(product.title);
                const image = item.variant?.image || product.imageCover || '';
                
                const price = item.price || 
                  (product.variants?.find((v: any) => v._id === item.variantId)?.priceAfterDiscount) || 
                  (product.variants?.find((v: any) => v._id === item.variantId)?.price) ||
                  product.priceRange?.min || 
                  product.comparePrice || 0;

                return (
                  <div key={item.variantId || item.productId || idx} className="flex gap-4 group">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-accent/30 border border-border/50 shrink-0">
                      <ImageWithFallback src={image} alt={title || 'Product'} fill className="object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-sm line-clamp-2 leading-tight">{title}</h3>
                          <button 
                            onClick={() => handleRemove(item.productId, item.variantId)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {item.variantId && product.variants?.find((v: any) => v._id === item.variantId)?.attributes && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                             {Object.entries(product.variants.find((v: any) => v._id === item.variantId).attributes).map(([key, val]: any) => {
                               const displayKey = getAttributeLabel(key, isAr);
                               return (
                                 <span key={key} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-accent/60 text-muted-foreground rounded-md border border-border/40">
                                   <span className="opacity-70">{displayKey}:</span>
                                   <span className="font-bold text-foreground uppercase">{val.value} {val.unit || ''}</span>
                                 </span>
                               );
                             })}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-black text-primary">{formatCurrency(price)}</span>
                        
                        {!user && ( // Only show quantity controls for guest cart currently, until backend supports qty updates
                          <div className="flex items-center gap-3 bg-accent/40 rounded-lg p-1 border border-border/50">
                            <button 
                              onClick={() => handleUpdateQuantity(item.productId, item.variantId, item.quantity, -1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 flex items-center justify-center hover:bg-background rounded shadow-sm disabled:opacity-30 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.productId, item.variantId, item.quantity, 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-background rounded shadow-sm transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {user && (
                          <span className="text-xs font-bold text-muted-foreground px-2">
                            Qty: {item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-accent/10 space-y-4">
            <div className="flex items-center justify-between font-black text-lg">
              <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="text-primary">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href="/cart" onClick={closeCartDrawer}>
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2 hover:bg-accent">
                  {isAr ? 'عرض السلة' : 'View Cart'}
                </Button>
              </Link>
              <Link href="/checkout" onClick={closeCartDrawer}>
                <Button className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
                  {isAr ? 'إتمام الطلب' : 'Checkout'}
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Return via portal if client-side
  if (typeof document === 'undefined') return null;
  return createPortal(drawerContent, document.body);
}
