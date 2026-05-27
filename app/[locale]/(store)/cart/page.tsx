'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import { useCart, useRemoveFromCart, useClearCart, useUpdateCartQuantity } from '@/features/cart/hooks/useCart';
import { useCartStore } from '@/store/cart-store';
import { useMe } from '@/features/auth/hooks/useAuth';
import { getLocalizedValue } from '@/lib/utils';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { useSettings } from '@/app/providers/SettingsProvider';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Tag,
  Package,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';

/* ------------------------------------------------------------------ */
/*  Attribute label helpers                                             */
/* ------------------------------------------------------------------ */
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
  if (entry) return isAr ? entry.ar : entry.en;
  return isAr ? key : key.charAt(0).toUpperCase() + key.slice(1);
};

/* ------------------------------------------------------------------ */
/*  Helpers to resolve price / variant from either cart shape          */
/*  Server cart  → item.variant (populated), item.price               */
/*  Guest cart   → item.variantId (string), find in product.variants  */
/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type CartVariant = {
  _id?: string;
  price?: number;
  priceAfterDiscount?: number;
  stock?: number;
  sku?: string;
  attributes?: Record<string, { value: string | number; unit?: string }>;
  image?: string;
};

type CartProduct = {
  _id: string;
  slug?: string;
  title: string | Record<string, string>;
  imageCover?: string;
  isActive?: boolean;
  isUnlimitedStock?: boolean;
  category?: { name: string | Record<string, string> };
  variants?: CartVariant[];
  priceRange?: { min: number };
  comparePrice?: number;
};

type CartItem = {
  productId?: string;
  variantId?: string;
  quantity: number;
  price?: number;
  product: CartProduct;
  variant?: CartVariant;
};

/* ------------------------------------------------------------------ */
const resolveItemData = (item: CartItem) => {
  // Server cart returns item.variant as a populated object
  const populatedVariant: CartVariant | null =
    item.variant && typeof item.variant === 'object' ? item.variant : null;

  const guestVariant = item.product?.variants?.find(
    (v) => v._id === item.variantId,
  );

  const price =
    item.price ??
    populatedVariant?.price ??
    populatedVariant?.priceAfterDiscount ??
    guestVariant?.priceAfterDiscount ??
    guestVariant?.price ??
    item.product?.priceRange?.min ??
    0;

  const stock = populatedVariant?.stock ?? guestVariant?.stock ?? null;
  const sku = populatedVariant?.sku ?? guestVariant?.sku ?? null;
  const attributes = populatedVariant?.attributes ?? guestVariant?.attributes ?? null;
  const image = populatedVariant?.image ?? item.product?.imageCover ?? '';
  const isUnlimitedStock: boolean = item.product?.isUnlimitedStock ?? false;
  const isActive: boolean = item.product?.isActive ?? true;

  return { price, stock, sku, attributes, image, isUnlimitedStock, isActive };
};

/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                          */
/* ------------------------------------------------------------------ */
function Breadcrumb({ isAr }: { isAr: boolean }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
      <Link href="/" className="hover:text-foreground transition-colors">
        {isAr ? 'الرئيسية' : 'Home'}
      </Link>
      <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
      <span className="text-foreground font-semibold">{isAr ? 'سلة التسوق' : 'Shopping Cart'}</span>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock badge                                                         */
/* ------------------------------------------------------------------ */
function StockBadge({
  stock,
  isAr,
  isUnlimitedStock,
}: {
  stock: number | null;
  isAr: boolean;
  isUnlimitedStock: boolean;
}) {
  // Unlimited stock → always available regardless of the numeric stock value
  if (isUnlimitedStock) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {isAr ? 'متوفر دائمًا' : 'Always In Stock'}
      </span>
    );
  }
  if (stock === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {isAr ? 'متوفر' : 'In Stock'}
      </span>
    );
  }
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        {isAr ? 'نفد المخزون' : 'Out of Stock'}
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        {isAr ? `باقي ${stock} فقط` : `Only ${stock} left`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
      <CheckCircle2 className="w-3.5 h-3.5" />
      {isAr ? 'متوفر' : 'In Stock'}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Cart Item Card                                                       */
/* ------------------------------------------------------------------ */
function CartItemCard({
  item,
  idx,
  isAr,
  locale,
  user,
  isRemoving,
  formatCurrency,
  onRemove,
  onUpdateQty,
}: {
  item: any;
  idx: number;
  isAr: boolean;
  locale: string;
  user: any;
  isRemoving: boolean;
  formatCurrency: (n: number) => string;
  onRemove: (productId: string, variantId?: string) => void;
  onUpdateQty: (productId: string, variantId: string, currentQty: number, change: number) => void;
}) {
  const product = item.product;
  if (!product) return null;

  const title = getLocalizedValue(product.title, locale) || product.title || 'Product';
  const categoryName = getLocalizedValue(product.category?.name, locale) || '';
  const { price, stock, sku, attributes, image, isUnlimitedStock, isActive } = resolveItemData(item);
  const lineTotal = price * item.quantity;

  // A product is "unavailable" when it is inactive OR (stock is 0 and not unlimited)
  const isOutOfStock = !isUnlimitedStock && stock === 0;
  const isUnavailable = !isActive;

  return (
    <div
      className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      {/* Inactive product overlay */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
          <span className="text-sm font-bold text-muted-foreground bg-accent border border-border px-5 py-2 rounded-xl shadow">
            {isAr ? 'المنتج غير متاح حاليًا' : 'Product no longer available'}
          </span>
        </div>
      )}

      {/* Out-of-stock overlay (only when stock is limited and zero) */}
      {!isUnavailable && isOutOfStock && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
          <span className="text-sm font-bold text-destructive bg-destructive/10 border border-destructive/30 px-4 py-2 rounded-xl">
            {isAr ? 'نفد المخزون' : 'Out of Stock'}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-0 animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
        {/* Image */}
        <Link
          href={`/products/${product.slug || product._id}`}
          className="relative w-full sm:w-40 h-44 sm:h-auto shrink-0 overflow-hidden bg-accent/30"
        >
          <ImageWithFallback
            src={image}
            alt={(title as string) || 'Product'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Category pill */}
          {categoryName && (
            <span className="absolute top-2 inset-s-2 text-[10px] font-bold uppercase tracking-wider bg-background/80 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full border border-border/40">
              {categoryName as string}
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 gap-3">
          {/* Top row: title + remove */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product.slug || product._id}`}>
                <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
                  {title as string}
                </h3>
              </Link>
              {sku && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground font-mono">
                  <Tag className="w-3 h-3" />
                  {sku}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(item.productId || product._id, item.variantId || item.variant?._id)}
              disabled={isRemoving}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors shrink-0 disabled:opacity-50"
              title={isAr ? 'حذف' : 'Remove'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Attributes + stock */}
          <div className="flex flex-wrap items-center gap-2">
            <StockBadge stock={stock} isAr={isAr} isUnlimitedStock={isUnlimitedStock} />
            {attributes &&
              Object.entries(attributes).map(([key, val]: any) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-accent/60 text-muted-foreground rounded-full border border-border/40"
                >
                  <span className="opacity-60">{getAttributeLabel(key, isAr)}:</span>
                  <span className="font-bold text-foreground uppercase">
                    {val.value} {val.unit || ''}
                  </span>
                </span>
              ))}
          </div>

          {/* Bottom row: price + qty + line total */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-border/40">
            {/* Unit price */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
                {isAr ? 'سعر الوحدة' : 'Unit Price'}
              </p>
              <p className="text-base font-bold text-foreground">{formatCurrency(price)}</p>
            </div>

            {/* Quantity control */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-accent/40 rounded-xl p-1 border border-border/50">
                <button
                  onClick={() => onUpdateQty(item.productId || product._id, item.variantId || item.variant?._id, item.quantity, -1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-lg shadow-sm disabled:opacity-30 transition-all text-foreground"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-black w-8 text-center tabular-nums">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.productId || product._id, item.variantId || item.variant?._id, item.quantity, 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-lg shadow-sm transition-all text-foreground"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Line total */}
            <div className="text-end">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
                {isAr ? 'الإجمالي' : 'Subtotal'}
              </p>
              <p className="text-lg font-black text-primary">{formatCurrency(lineTotal)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const formatCurrency = useFormatCurrency();
  const { data: user } = useMe();
  const settings = useSettings();

  // Data
  const { data: serverCart, isLoading } = useCart();
  const guestCartItems = useCartStore((state) => state.items);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const clearGuestCart = useCartStore((state) => state.clearCart);
  console.log(serverCart);

  const { mutate: removeServerItem, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: clearServerCart } = useClearCart();
  const { mutate: updateServerQuantity } = useUpdateCartQuantity();

  const cartItems = user ? (serverCart?.items || []) : guestCartItems;
  const totalQuantity = serverCart?.totalQuantity ?? cartItems.reduce((s: number, i: any) => s + i.quantity, 0);

  const handleRemoveItem = (productId: string, variantId?: string) => {
    if (user) removeServerItem(productId);
    else removeGuestItem(productId, variantId);
  };

  const handleUpdateQuantity = (productId: string, variantId: string, currentQty: number, change: number) => {
    const newQty = Math.max(1, currentQty + change);
    if (!user) {
      updateGuestQuantity(productId, variantId, newQty);
    } else {
      updateServerQuantity({ productId, variantId, quantity: newQty });
    }
  };

  const handleClearCart = () => {
    if (user) clearServerCart();
    else clearGuestCart();
  };

  // Totals
  const subtotal =
    serverCart?.totalPrice ??
    cartItems.reduce((acc: number, item: any) => {
      const { price } = resolveItemData(item);
      return acc + price * item.quantity;
    }, 0);

  const vatRate = settings.vatRate || 15;
  const tax = settings.taxesIncluded ? 0 : subtotal * (vatRate / 100);
  const totalAmount = subtotal + tax;

  /* Loading */
  if (isLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {isAr ? 'جارٍ تحميل السلة…' : 'Loading your cart…'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Breadcrumb isAr={isAr} />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <ShoppingBag className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                {t('title') || (isAr ? 'سلة التسوق' : 'Shopping Cart')}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalQuantity}{' '}
                {isAr
                  ? totalQuantity === 1 ? 'منتج' : 'منتجات'
                  : totalQuantity === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-4 h-4" />
              {isAr ? 'تفريغ السلة' : 'Clear Cart'}
            </button>
          )}
        </div>

        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative w-44 h-44">
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-30" />
              <div className="relative w-44 h-44 bg-accent/60 rounded-full flex items-center justify-center border border-border/50">
                <ShoppingBag className="w-20 h-20 text-muted-foreground/30" />
              </div>
              <div className="absolute -top-1 -inset-e-1 w-10 h-10 bg-destructive rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                <span className="text-white font-black text-sm">0</span>
              </div>
            </div>
            <div className="space-y-3 max-w-sm">
              <h2 className="text-2xl font-black text-foreground">
                {t('empty.title') || (isAr ? 'سلتك فارغة!' : 'Your cart is empty!')}
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                {t('empty.subtitle') ||
                  (isAr
                    ? 'لم تُضف أي منتجات بعد. استكشف مجموعتنا واختر ما يعجبك.'
                    : "You haven't added anything yet. Explore our collection and find something you love.")}
              </p>
            </div>
            <Link href="/products">
              <Button size="lg" className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-primary/20 gap-3 hover:scale-105 transition-transform">
                {t('empty.cta') || (isAr ? 'تسوق الآن' : 'Start Shopping')}
                {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </Link>
          </div>
        ) : (
          /* ── Cart Grid ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── Items Column ── */}
            <div className="lg:col-span-8 space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <h2 className="text-base font-bold text-muted-foreground uppercase tracking-widest">
                  {isAr ? 'المنتجات' : 'Products'}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {isAr ? 'السعر × الكمية = الإجمالي' : 'Price × Qty = Subtotal'}
                </span>
              </div>

              <div className="space-y-3">
                {cartItems.map((item: any, idx: number) => (
                  <CartItemCard
                    key={item.variant?._id || item.variantId || item.productId || idx}
                    item={item}
                    idx={idx}
                    isAr={isAr}
                    locale={locale}
                    user={user}
                    isRemoving={isRemoving}
                    formatCurrency={formatCurrency}
                    onRemove={handleRemoveItem}
                    onUpdateQty={handleUpdateQuantity}
                  />
                ))}
              </div>

              {/* Continue shopping */}
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mt-2"
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                {isAr ? 'مواصلة التسوق' : 'Continue Shopping'}
              </Link>
            </div>

            {/* ── Order Summary Column ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-600">
              <div className="bg-card border border-border/50 rounded-3xl shadow-xl shadow-primary/5 overflow-hidden">

                {/* Summary header */}
                <div className="px-6 py-5 bg-accent/30 border-b border-border/50">
                  <h2 className="text-xl font-black text-foreground">
                    {t('summary.title') || (isAr ? 'ملخص الطلب' : 'Order Summary')}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {cartItems.length}{' '}
                    {isAr
                      ? cartItems.length === 1 ? 'نوع منتج' : 'أنواع منتجات'
                      : cartItems.length === 1 ? 'product type' : 'product types'}
                  </p>
                </div>

                {/* Line items breakdown */}
                <div className="px-6 py-4 space-y-3 border-b border-border/40 max-h-52 overflow-y-auto">
                  {cartItems.map((item: any, idx: number) => {
                    const product = item.product;
                    if (!product) return null;
                    const title = getLocalizedValue(product.title, locale) || product.title || 'Product';
                    const { price } = resolveItemData(item);
                    return (
                      <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground truncate flex-1">
                          {title as string}
                          <span className="text-xs ms-1 opacity-60">×{item.quantity}</span>
                        </span>
                        <span className="font-semibold text-foreground shrink-0 tabular-nums">
                          {formatCurrency(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="px-6 py-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      {t('summary.subtotal') || (isAr ? 'المجموع الجزئي' : 'Subtotal')}
                    </span>
                    <span className="font-bold text-foreground tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>

                  {tax > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">
                        {t('summary.tax') || (isAr ? 'ضريبة القيمة المضافة' : 'VAT')} ({vatRate}%)
                      </span>
                      <span className="font-bold text-foreground tabular-nums">{formatCurrency(tax)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      {t('summary.shipping') || (isAr ? 'الشحن' : 'Shipping')}
                    </span>
                    <span className="font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg text-xs">
                      {t('summary.free') || (isAr ? 'مجاني' : 'Free')}
                    </span>
                  </div>

                  <div className="h-px bg-border/60 my-1" />

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-base">
                      {t('summary.total') || (isAr ? 'الإجمالي' : 'Total')}
                    </span>
                    <div className="text-end">
                      <span className="text-2xl font-black text-primary tabular-nums">
                        {formatCurrency(totalAmount)}
                      </span>
                      {settings.taxesIncluded && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {isAr ? 'شامل الضريبة' : 'Tax included'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 space-y-3">
                  <Link href="/checkout" className="block">
                    <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 gap-3 group">
                      {t('summary.checkout') || (isAr ? 'إتمام الطلب' : 'Proceed to Checkout')}
                      {isAr
                        ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                  </Link>

                  {/* Trust badges */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 justify-center bg-accent/40 py-2.5 px-3 rounded-xl border border-border/40">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {isAr ? 'دفع آمن' : 'Secure Pay'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center bg-accent/40 py-2.5 px-3 rounded-xl border border-border/40">
                      <Truck className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {isAr ? 'شحن سريع' : 'Fast Ship'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
