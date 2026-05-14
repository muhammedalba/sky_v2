'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icons } from '@/shared/ui/Icons';
import { useCart, useRemoveFromCart, useClearCart } from '@/features/cart/hooks/useCart';
import { getLocalizedValue } from '@/lib/utils';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { useSettings } from '@/app/providers/SettingsProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/shared/ui/ScrollReveal';

export default function CartPage() {
  const t = useTranslations('cart');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const formatCurrency = useFormatCurrency();
  
  const { data: cart, isLoading } = useCart();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: clearCart } = useClearCart();

  const settings = useSettings();
  
  const cartItems = cart?.items || [];
  const totalAmount = cart?.totalPrice || 0;
  const subtotal = cartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  
  // Calculate dynamic VAT
  const vatRate = settings.vatRate || 15;
  const tax = settings.taxesIncluded ? 0 : subtotal * (vatRate / 100);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Icons.RefreshCw className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40  bg-background selection:bg-primary/30 pb-20">
      {/* Header */}
      <section className="py-12 bg-secondary/5 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight flex items-center gap-4">
              {t('title')}
              <span className="text-xl font-medium text-muted-foreground bg-background px-4 py-1 rounded-full border border-border/50">
                {cartItems.length} {locale === 'ar' ? 'منتجات' : 'items'}
              </span>
            </h1>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
              <div className="w-32 h-32 bg-secondary/30 rounded-full flex items-center justify-center text-muted-foreground/30 relative">
                 <Icons.ShoppingCart className="w-16 h-16" />
                 <Icons.Plus className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground">{t('empty.title')}</h2>
                <p className="text-muted-foreground max-w-md mx-auto font-medium">{t('empty.subtitle')}</p>
              </div>
              <Link href="/products">
                <Button size="lg" className="rounded-2xl h-14 px-10 font-black shadow-xl shadow-primary/20 gap-3">
                  {t('empty.cta')}
                  <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Items List */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h2 className="text-lg font-black uppercase tracking-widest text-muted-foreground/60">{locale === 'ar' ? 'قائمة المنتجات' : 'Product List'}</h2>
                   <Button variant="ghost" className="text-destructive font-black hover:bg-destructive/10" onClick={() => clearCart()}>
                      {locale === 'ar' ? 'تفريغ السلة' : 'Clear Cart'}
                   </Button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item: any, idx: number) => (
                    <motion.div
                      key={item.product?._id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-4 sm:p-6 border-border/50 rounded-3xl hover:shadow-lg transition-shadow group relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                          {/* Image */}
                          <div className="w-32 h-32 bg-secondary/50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
                             {item.product?.imageCover ? (
                               <img src={item.product.imageCover} alt={getLocalizedValue(item.product.title, locale)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                             ) : (
                               <Icons.Package className="w-12 h-12 text-muted-foreground/20" />
                             )}
                          </div>

                          {/* Info */}
                          <div className="grow space-y-2 text-center sm:text-start">
                            <div className="text-xs font-black text-primary uppercase tracking-wider">
                               {getLocalizedValue(item.product?.category?.name, locale)}
                            </div>
                            <h3 className="text-xl font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                               {getLocalizedValue(item.product?.title, locale)}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2">
                               <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                               {t('item.stock_available')}
                            </p>
                            
                            <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                               <div className="flex items-center bg-secondary/30 rounded-xl px-2 py-1 border border-border/50">
                                  <span className="px-3 py-1 font-black text-foreground">{item.quantity}</span>
                                  <span className="text-xs text-muted-foreground font-medium px-2 border-l border-border/50 rtl:border-l-0 rtl:border-r">{t('item.quantity')}</span>
                               </div>
                               <div className="text-lg font-black text-foreground">
                                  {formatCurrency(item.price)}
                               </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-row sm:flex-col items-center justify-center gap-3">
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="w-12 h-12 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                               onClick={() => removeItem(item.product?._id)}
                               disabled={isRemoving}
                             >
                                <Icons.Trash className="w-6 h-6" />
                             </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                 <ScrollReveal animation="slide-up">
                    <Card className="p-8 border-border/50 rounded-[2.5rem] shadow-xl bg-card/50 backdrop-blur-xl space-y-8">
                       <h2 className="text-2xl font-black text-foreground">{t('summary.title')}</h2>
                       
                       <div className="space-y-4 font-medium">
                          <div className="flex items-center justify-between text-muted-foreground">
                             <span>{t('summary.subtotal')}</span>
                             <span className="text-foreground font-black">{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                             <span>{t('summary.tax')}</span>
                             <span className="text-foreground font-black">{formatCurrency(tax)}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                             <span>{t('summary.shipping')}</span>
                             <span className="text-success font-black">{t('summary.free')}</span>
                          </div>
                          <div className="h-px bg-border/50 my-2" />
                          <div className="flex items-center justify-between text-xl font-black">
                             <span>{t('summary.total')}</span>
                             <span className="text-primary">{formatCurrency(totalAmount)}</span>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <Button className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 gap-3 group">
                             {t('summary.checkout')}
                             <Icons.ChevronRight className="w-6 h-6 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-transform" />
                          </Button>
                          
                          {/* Trust Badges */}
                          <div className="flex items-center justify-center gap-4 py-4 border-t border-border/50 opacity-60 grayscale hover:grayscale-0 transition-all">
                             <div className="w-12 h-8 bg-secondary/50 rounded-lg flex items-center justify-center">VISA</div>
                             <div className="w-12 h-8 bg-secondary/50 rounded-lg flex items-center justify-center">MADA</div>
                             <div className="w-12 h-8 bg-secondary/50 rounded-lg flex items-center justify-center">APPLE</div>
                          </div>
                       </div>
                    </Card>
                 </ScrollReveal>
              </div>

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
