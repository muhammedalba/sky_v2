"use client";

import { useMemo, useCallback } from "react"; // تمت إضافة useMemo و useCallback
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
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useTrans } from "@/shared/hooks/useTrans";
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { CartItemCard } from "@/features/cart/components/CartItemCard";

/* ------------------------------------------------------------------ */
/* Page                                                              */
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

  // تحسين: إزالة console.log لتجنب تسريب البيانات في بيئة الإنتاج وتحسين الأداء
  // console.log(serverCart);

  const { mutate: removeServerItem, isPending: isRemoving } =
    useRemoveFromCart();
  const { mutate: clearServerCart, isPending: clearServerCartPending } =
    useClearCart();
  const {
    mutate: updateServerQuantity,
    isPending: updateServerQuantityPending,
  } = useUpdateCartQuantity();

  // تحسين: استخدام useMemo لحفظ المصفوفة وتجنب إنشائها مع كل عملية تصيير (Render)
  const cartItems = useMemo(() => {
    return user ? serverCart?.items || [] : guestCartItems || [];
  }, [user, serverCart?.items, guestCartItems]);

  // تحسين: استخدام useMemo لحساب إجمالي الكمية فقط عند تغير عناصر السلة
  const totalQuantity = useMemo(() => {
    return (
      serverCart?.totalQuantity ??
      cartItems.reduce(
        (s: number, i: { quantity: number }) => s + (i.quantity || 0),
        0,
      )
    );
  }, [serverCart?.totalQuantity, cartItems]);

  // تحسين: استخدام useCallback لمنع إعادة إنشاء الدوال، مما يمنع إعادة تصيير مكون CartItemCard
  const handleRemoveItem = useCallback(
    (productId: string, variantId?: string) => {
      if (!productId) return; // تحصين: التأكد من وجود معرف المنتج
      if (user) removeServerItem(productId);
      else removeGuestItem(productId, variantId);
    },
    [user, removeServerItem, removeGuestItem],
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, variantId: string, newQty: number) => {
      if (!productId) return; // تحصين
      const safeQty = Math.max(1, Number(newQty) || 1); // تحصين: التأكد من أن الكمية رقم صحيح وموجب
      if (!user) {
        updateGuestQuantity(productId, variantId, safeQty);
      } else {
        updateServerQuantity({ productId, variantId, quantity: safeQty });
      }
    },
    [user, updateServerQuantity, updateGuestQuantity],
  );

  const handleClearCart = useCallback(() => {
    if (user) clearServerCart();
    else clearGuestCart();
  }, [user, clearServerCart, clearGuestCart]);

  // Totals
  // تحسين: حساب الإجماليات مرة واحدة وفقط عند الحاجة باستخدام useMemo
  const subtotal = useMemo(() => {
    return (
      serverCart?.totalPrice ??
      cartItems.reduce((acc: number, item: CartItem) => {
        const { price } = resolveItemData(item);
        return acc + (price || 0) * (item.quantity || 1); // تحصين ضد القيم الفارغة
      }, 0)
    );
  }, [serverCart?.totalPrice, cartItems]);

  const vatRate = settings?.vatRate || 15;

  const tax = useMemo(() => {
    return settings?.taxesIncluded ? 0 : subtotal * (vatRate / 100);
  }, [settings?.taxesIncluded, subtotal, vatRate]);

  const totalAmount = useMemo(() => subtotal + tax, [subtotal, tax]);

  const isCartUpdating =
    isRemoving || updateServerQuantityPending || clearServerCartPending;

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
        <Breadcrumb
          items={[{ label: t("misc.home"), href: "/" }, { label: t("title") }]}
        />

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
              disabled={isCartUpdating} // تحصين: منع الضغط أثناء التحديث
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw
                className={`w-4 h-4 ${clearServerCartPending ? "animate-spin" : ""}`}
              />
              {t("misc.clear_cart")}
            </button>
          )}
        </div>

        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* ... (نفس كود الواجهة الفارغة لم يتغير) ... */}
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
                {cartItems.map((item: CartItem, idx: number) => {
                  // تحسين: ضمان وجود مفتاح فريد بشكل أفضل
                  const uniqueKey = [
                    item.product?._id || item.productId,
                    item.variant?._id || item.variantId,
                    idx,
                  ]
                    .filter(Boolean)
                    .join("-");

                  return (
                    <CartItemCard
                      key={uniqueKey}
                      item={item}
                      idx={idx}
                      isAr={isAr}
                      isRemoving={isCartUpdating}
                      formatCurrency={formatCurrency}
                      onRemove={handleRemoveItem}
                      onUpdateQty={handleUpdateQuantity}
                    />
                  );
                })}
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
                  {cartItems.map((item: CartItem, idx: number) => {
                    const product = item.product;
                    if (!product) return null;
                    const title = getTrans(product.title);
                    const { price } = resolveItemData(item);
                    return (
                      <div
                        key={`summary-${idx}`}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-muted-foreground truncate flex-1">
                          {title as string}
                          <span className="text-xs ms-1 opacity-60">
                            ×{item.quantity}
                          </span>
                        </span>
                        <span className="font-semibold text-foreground shrink-0 tabular-nums">
                          {formatCurrency((price || 0) * (item.quantity || 1))}
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
                      {settings?.taxesIncluded && (
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
                    <Button
                      className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 gap-3 group"
                      disabled={isCartUpdating || cartItems.length === 0} // تحصين: منع الانتقال للدفع إذا كانت السلة فارغة أو قيد التحديث
                    >
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
