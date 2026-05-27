"use client";
import { useState, useEffect } from "react";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import {
  useCart,
  useRemoveFromCart,
  useClearCart,
  useUpdateCartQuantity,
} from "@/features/cart/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { useMe } from "@/features/auth/hooks/useAuth";

import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useSettings } from "@/app/providers/SettingsProvider";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Save,
  Tag,
  Package,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { useTrans } from "@/shared/hooks/useTrans";

import { getAttributeLabel, resolveItemData } from "@/features/cart/utils/cartUtils";

/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                          */
/* ------------------------------------------------------------------ */
function Breadcrumb() {
  const t = useTranslations("cart");
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
      <Link href="/" className="hover:text-foreground transition-colors">
        {t("misc.home")}
      </Link>
      <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
      <span className="text-foreground font-semibold">
        {t("title")}
      </span>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock badge                                                         */
/* ------------------------------------------------------------------ */
function StockBadge({
  stock,
  isUnlimitedStock,
}: {
  stock: number | null;
  isUnlimitedStock: boolean;
}) {
  const t = useTranslations("cart");
  // Unlimited stock → always available regardless of the numeric stock value
  if (isUnlimitedStock) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t("item.always_in_stock")}
      </span>
    );
  }
  if (stock === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t("item.in_stock")}
      </span>
    );
  }
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        {t("item.out_of_stock")}
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        {t("item.only_left", { stock })}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
      <CheckCircle2 className="w-3.5 h-3.5" />
      {t("item.in_stock")}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Cart Item Card                                                       */
/* ------------------------------------------------------------------ */
export function CartItemCard({
  item,
  idx,
  isAr,
  isRemoving,
  isCompact = false,
  formatCurrency,
  onRemove,
  onUpdateQty,
}: {
  item: any;
  idx: number;
  isAr: boolean;
  isRemoving: boolean;
  isCompact?: boolean;
  formatCurrency: (n: number) => string;
  onRemove: (productId: string, variantId?: string) => void;
  onUpdateQty: (productId: string, variantId: string, newQty: number) => void;
}) {
  const [localQty, setLocalQty] = useState(item.quantity);
  const [isEditing, setIsEditing] = useState(false);
  // hooks
  const getTrans = useTrans();

  const t = useTranslations("cart");

  useEffect(() => {
    if (!isEditing) {
      setLocalQty(item.quantity);
    }
  }, [item.quantity, isEditing]);

  const handleUpdate = () => {
    const qty = Math.max(1, localQty);
    setLocalQty(qty);
    setIsEditing(false);
    onUpdateQty(
      item.productId || item.product?._id,
      item.variantId || item.variant?._id,
      qty,
    );
  };
  const product = item.product;
  if (!product) return null;
  const title = getTrans(product.title);
  const categoryName = getTrans(product.category?.name);
  const { price, stock, sku, attributes, image, isUnlimitedStock, isActive } =
    resolveItemData(item);
  const lineTotal = price * item.quantity;

  // A product is "unavailable" when it is inactive OR (stock is 0 and not unlimited)
  const isOutOfStock = !isUnlimitedStock && stock === 0;
  const isUnavailable = !isActive;

  return (
    <div
      className={`group relative bg-card overflow-hidden transition-all duration-300 ${
        isCompact
          ? "border-b border-border/50 hover:bg-accent/20 p-2"
          : "border border-border/50 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      }`}
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      {/* Inactive product overlay */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
          <span className="text-sm font-bold text-muted-foreground bg-accent border border-border px-5 py-2 rounded-xl shadow">
            {t("item.product_unavailable")}
          </span>
        </div>
      )}

      {/* Out-of-stock overlay (only when stock is limited and zero) */}
      {!isUnavailable && isOutOfStock && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
          <span className="text-sm font-bold text-destructive bg-destructive/10 border border-destructive/30 px-4 py-2 rounded-xl">
            {t("item.out_of_stock")}
          </span>
        </div>
      )}

      <div className={`flex ${isCompact ? "flex-row gap-3 items-center" : "flex-col sm:flex-row gap-0"} animate-in fade-in slide-in-from-bottom-2 fill-mode-both`}>
        {/* Image */}
        <Link
          href={`/products/${product.slug || product._id}`}
          className={`relative shrink-0 overflow-hidden bg-accent/30 ${
            isCompact ? "w-24 h-24 rounded-xl" : "w-full sm:w-40 h-44 sm:h-auto"
          }`}
        >
          <ImageWithFallback
            src={image}
            alt={(title as string) || "Product"}
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
        <div className={`flex-1 flex flex-col justify-between ${isCompact ? "py-1 gap-2" : "p-4 sm:p-5 gap-3"}`}>
          {/* Top row: title + remove */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product.slug || product._id}`}>
                <h3 className={`${isCompact ? "text-sm" : "text-base sm:text-lg"} font-bold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug`}>
                  {title as string}
                </h3>
              </Link>
              {!isCompact && sku && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground font-mono">
                  <Tag className="w-3 h-3" />
                  {sku}
                </p>
              )}
            </div>
            <button
              onClick={() =>
                onRemove(
                  item.productId || product._id,
                  item.variantId || item.variant?._id,
                )
              }
              disabled={isRemoving}
              className={`text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50 ${isCompact ? "p-1.5 rounded-lg" : "p-2 rounded-xl"}`}
              title={t("item.remove")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Attributes + stock */}
          <div className="flex flex-wrap items-center gap-2">
            <StockBadge
              stock={stock}
              isUnlimitedStock={isUnlimitedStock}
            />
            {attributes &&
              Object.entries(attributes).map(([key, val]: any) => (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 font-medium bg-accent/60 text-muted-foreground border border-border/40 ${isCompact ? "text-[10px] px-2 py-0.5 rounded-md" : "text-xs px-2.5 py-1 rounded-full"}`}
                >
                  <span className="opacity-60">
                    {getAttributeLabel(key, isAr)}:
                  </span>
                  <span className="font-bold text-foreground uppercase">
                    {val.value} {val.unit || ""}
                  </span>
                </span>
              ))}
          </div>

          {/* Bottom row: price + qty + line total */}
          <div className={`flex items-center justify-between flex-wrap gap-2 ${isCompact ? "mt-1" : "pt-1 border-t border-border/40"}`}>
            {/* Unit price (hidden in compact) */}
            {!isCompact && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
                  {t("item.unit_price")}
                </p>
                <p className="text-base font-bold text-foreground">
                  {formatCurrency(price)}
                </p>
              </div>
            )}

            {/* Quantity control */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 bg-accent/40 border border-border/50 ${isCompact ? "rounded-lg p-1" : "rounded-xl p-1"}`}>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(1, localQty - 1);
                    setLocalQty(next);
                    setIsEditing(true);
                  }}
                  disabled={localQty <= 1 || isRemoving}
                  className={`${isCompact ? "w-6 h-6 rounded" : "w-8 h-8 rounded-lg"} flex items-center justify-center hover:bg-background shadow-sm disabled:opacity-10 transition-all text-foreground cursor-pointer`}
                >
                  <Minus className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={localQty}
                  onChange={(e) => {
                    setLocalQty(parseInt(e.target.value) || 1);
                    setIsEditing(true);
                  }}
                  className={`${isCompact ? "w-8 h-6 text-xs" : "w-12 h-8 text-sm"} text-center font-black tabular-nums bg-transparent border-none focus:ring-0 focus:outline-none`}
                />
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={() => {
                    setLocalQty(localQty + 1);
                    setIsEditing(true);
                  }}
                  className={`${isCompact ? "w-6 h-6 rounded" : "w-8 h-8 rounded-lg"} flex items-center justify-center hover:bg-background shadow-sm transition-all text-foreground disabled:opacity-10 cursor-pointer`}
                >
                  <Plus className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                </button>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isRemoving}
                  className={`${isCompact ? "w-6 h-6 rounded-md" : "w-8 h-8 rounded-xl"} flex items-center justify-center bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-all disabled:opacity-50`}
                  title={t("item.update_quantity")}
                >
                  <Save className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                </button>
              )}
            </div>

            {/* Line total */}
            <div className="text-end">
              {!isCompact && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
                  {t("summary.subtotal")}
                </p>
              )}
              <p className={`${isCompact ? "text-base" : "text-lg"} font-black text-primary`}>
                {formatCurrency(isCompact ? price : lineTotal)}
              </p>
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
  const t = useTranslations("cart");
  const locale = useLocale();
  const isAr = locale === "ar";
  const formatCurrency = useFormatCurrency();
  const { data: user } = useMe();
  const settings = useSettings();
  const getTrans = useTrans();
  // Data
  const { data: serverCart, isLoading } = useCart();
  const guestCartItems = useCartStore((state) => state.items);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const clearGuestCart = useCartStore((state) => state.clearCart);
  console.log(serverCart);

  const { mutate: removeServerItem, isPending: isRemoving } =
    useRemoveFromCart();
  const { mutate: clearServerCart, isPending: clearServerCartPending } =
    useClearCart();
  const {
    mutate: updateServerQuantity,
    isPending: updateServerQuantityPending,
  } = useUpdateCartQuantity();

  const cartItems = user ? serverCart?.items || [] : guestCartItems;
  const totalQuantity =
    serverCart?.totalQuantity ??
    cartItems.reduce((s: number, i: any) => s + i.quantity, 0);

  const handleRemoveItem = (productId: string, variantId?: string) => {
    if (user) removeServerItem(productId);
    else removeGuestItem(productId, variantId);
  };

  const handleUpdateQuantity = (
    productId: string,
    variantId: string,
    newQty: number,
  ) => {
    const safeQty = Math.max(1, newQty);
    if (!user) {
      updateGuestQuantity(productId, variantId, safeQty);
    } else {
      updateServerQuantity({ productId, variantId, quantity: safeQty });
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
            {t("misc.loading_cart")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <Breadcrumb />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <ShoppingBag className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                {t("title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalQuantity}{" "}
                {totalQuantity === 1
                  ? t("misc.item_count_single")
                  : t("misc.item_count_plural")}
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-4 h-4" />
              {t("misc.clear_cart")}
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
                {t("empty.title")}
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                {t("empty.subtitle")}
              </p>
            </div>
            <Link href="/products">
              <Button
                size="lg"
                className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-primary/20 gap-3 hover:scale-105 transition-transform"
              >
                {t("empty.cta")}
                {isAr ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
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
                  {t("misc.products")}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {t("misc.price_qty_subtotal")}
                </span>
              </div>

              <div className="space-y-3">
                {cartItems.map((item: any, idx: number) => (
                  console.log('---- in cart page',item),
                  
                  <CartItemCard
                    key={
                      item.variant?._id ||
                      item.variantId ||
                      item.productId ||
                      idx
                    }
                    item={item}
                    idx={idx}
                    isAr={isAr}
                    isRemoving={
                      isRemoving ||
                      updateServerQuantityPending ||
                      clearServerCartPending
                    }
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
                {isAr ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )}
                {t("misc.continue_shopping")}
              </Link>
            </div>

            {/* ── Order Summary Column ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-600">
              <div className="bg-card border border-border/50 rounded-3xl shadow-xl shadow-primary/5 overflow-hidden">
                {/* Summary header */}
                <div className="px-6 py-5 bg-accent/30 border-b border-border/50">
                  <h2 className="text-xl font-black text-foreground">
                    {t("summary.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {cartItems.length}{" "}
                    {cartItems.length === 1
                      ? t("misc.product_type_single")
                      : t("misc.product_type_plural")}
                  </p>
                </div>

                {/* Line items breakdown */}
                <div className="px-6 py-4 space-y-3 border-b border-border/40 max-h-52 overflow-y-auto">
                  {cartItems.map((item: any, idx: number) => {
                    const product = item.product;
                    if (!product) return null;
                    const title = getTrans(product.title);
                    const { price } = resolveItemData(item);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-muted-foreground truncate flex-1">
                          {title as string}
                          <span className="text-xs ms-1 opacity-60">
                            ×{item.quantity}
                          </span>
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
                      {t("summary.subtotal")}
                    </span>
                    <span className="font-bold text-foreground tabular-nums">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {tax > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">
                        {t("summary.tax")} ({vatRate}%)
                      </span>
                      <span className="font-bold text-foreground tabular-nums">
                        {formatCurrency(tax)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      {t("summary.shipping")}
                    </span>
                    <span className="font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg text-xs">
                      {t("summary.free")}
                    </span>
                  </div>

                  <div className="h-px bg-border/60 my-1" />

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-base">
                      {t("summary.total")}
                    </span>
                    <div className="text-end">
                      <span className="text-2xl font-black text-primary tabular-nums">
                        {formatCurrency(totalAmount)}
                      </span>
                      {settings.taxesIncluded && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {t("misc.tax_included")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 space-y-3">
                  <Link href="/checkout" className="block">
                    <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 gap-3 group">
                      {t("summary.checkout")}
                      {isAr ? (
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      ) : (
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </Link>

                  {/* Trust badges */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 justify-center bg-accent/40 py-2.5 px-3 rounded-xl border border-border/40">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("misc.secure_pay")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center bg-accent/40 py-2.5 px-3 rounded-xl border border-border/40">
                      <Truck className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("misc.fast_ship")}
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
