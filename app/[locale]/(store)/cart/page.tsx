"use client";
import { useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
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
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { CartItemCard } from "@/features/cart/components/CartItemCard";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  TrashIcon,
} from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { OrderSummaryCard } from "@/features/checkout/components/OrderSummaryCard";
import { useCheckoutSummary } from "@/features/checkout/hooks/useCheckout";

/* ------------------------------------------------------------------ */
/* Page                                                              */
/* ------------------------------------------------------------------ */
export default function CartPage() {
  // ======> Hooks <======
  const t = useTranslations("cart");
  const locale = useLocale();
  const formatCurrency = useFormatCurrency();
  const isAr = locale === "ar";

  // ======> Data <======
  const settings = useSettings();
  const { data: user } = useMe();
  const { data: serverCart, isLoading } = useCart();
  const { data: previewResult } = useCheckoutSummary({ enabled: !!user });

  // ======> cart operations <======
  const { mutate: removeServerItem, isPending: isRemoving } =
    useRemoveFromCart();

  const { mutate: clearServerCart, isPending: clearServerCartPending } =
    useClearCart();

  const {
    mutate: updateServerQuantity,
    isPending: updateServerQuantityPending,
  } = useUpdateCartQuantity();

  // ======> cart states <======
  const guestCartItems = useCartStore((state) => state.items);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const clearGuestCart = useCartStore((state) => state.clearCart);

  // ======> cart items <======
  const cartItems = useMemo(() => {
    return user ? serverCart?.items || [] : guestCartItems || [];
  }, [user, serverCart?.items, guestCartItems]);

  // ======> total quantity <======
  const totalQuantity = useMemo(() => {
    return (
      serverCart?.totalQuantity ??
      cartItems.reduce(
        (acc: number, item: CartItem) => acc + (item.quantity || 1),
        0,
      )
    );
  }, [serverCart?.totalQuantity, cartItems]);

  // ======> cart actions <======
  // remove item from cart
  const handleRemoveItem = useCallback(
    (productId: string, variantId?: string) => {
      if (!productId) return;
      if (user) removeServerItem(productId);
      else removeGuestItem(productId, variantId);
    },
    [user, removeServerItem, removeGuestItem],
  );
  // update item quantity in cart
  const handleUpdateQuantity = useCallback(
    (productId: string, variantId: string, newQty: number) => {
      if (!productId) return;
      const safeQty = Math.max(1, Number(newQty) || 1);
      if (user) {
        updateServerQuantity({ productId, variantId, quantity: safeQty });
      } else {
        updateGuestQuantity(productId, variantId, safeQty);
      }
    },
    [user, updateServerQuantity, updateGuestQuantity],
  );
  // clear cart
  const handleClearCart = useCallback(() => {
    if (user) clearServerCart();
    else clearGuestCart();
  }, [user, clearServerCart, clearGuestCart]);

  // ======> cart subtotal <======
  const subtotal = useMemo(() => {
    return (
      serverCart?.totalPrice ??
      cartItems.reduce((acc: number, item: CartItem) => {
        const { price } = resolveItemData(item);
        return acc + (price || 0) * (item.quantity || 1);
      }, 0)
    );
  }, [serverCart?.totalPrice, cartItems]);






  // for guest checkout 
  const checkoutHref = useMemo(() => {
    // if guest checkout is not enabled and user is not logged in, redirect to login
    if (!user && !settings?.features?.guestCheckout) {
      return "/login?redirect=/checkout";
    }
    // otherwise, redirect to checkout
    return "/checkout";
  }, [user, settings?.features?.guestCheckout]);

  // if cart is updating, show loading state
  const isCartUpdating =
    isRemoving || updateServerQuantityPending || clearServerCartPending;

  /* ── Loading ── */
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
    <div className="min-h-screen pt-40 pb-24 bg-accent/70 selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <ScrollReveal animation="fade" delay={200}>
          <Breadcrumb
            items={[
              { label: t("misc.home"), href: "/" },
              { label: t("title") },
            ]}
          />
        </ScrollReveal>
        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 max-w-md mx-auto gap-6">
            <div className="w-28 h-28 rounded-full bg-accent flex items-center justify-center">
              <ScrollReveal animation="slide-up" delay={100}>
                <ShoppingBagIcon className="w-14 h-14 text-muted-foreground/40" />
              </ScrollReveal>
            </div>
            <ScrollReveal animation="slide-up" delay={100}>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {t("empty.title")}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("empty.subtitle")}
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex mt-3 items-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3.5 font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-[1.02]"
              >
                {t("empty.cta")}
                {isAr ? (
                  <ArrowLeftIcon className="w-4 h-4" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4" />
                )}
              </Link>
            </ScrollReveal>
          </div>
        ) : (
          <div className="w-full">
            {/* Page heading + clear */}
            <div className="flex items-center justify-between">
              <ScrollReveal animation="slide-right">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="size-8 text-primary" />
                  <h1 className="text-2xl sm:text-3xl font-bold title-gradient tracking-tight">
                    {t("title")}
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {totalQuantity}
                  {totalQuantity === 1
                    ? t("misc.item_count_single")
                    : t("misc.item_count_plural")}
                </p>
              </ScrollReveal>
              {cartItems.length > 0 && (
                <ScrollReveal animation="slide-left">
                  <button
                    onClick={handleClearCart}
                    disabled={isCartUpdating}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <TrashIcon
                      className={`w-4 h-4 text-destructive ${clearServerCartPending ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">
                      {t("misc.clear_cart")}
                    </span>
                  </button>
                </ScrollReveal>
              )}
            </div>
            {/* ── Cart Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start mt-6">
              {/* ════════════════════════════
                LEFT — Items Column
            ════════════════════════════ */}
              <div className="space-y-5">
                {/* Items list */}
                <div className="space-y-3">
                  {cartItems.map((item: CartItem, idx: number) => {
                    const uniqueKey = [
                      item.product?._id || item.productId,
                      item.variant?._id || item.variantId,
                      idx,
                    ]
                      .filter(Boolean)
                      .join("-");

                    return (
                      <ScrollReveal
                        key={uniqueKey}
                        delay={idx * 50}
                        animation="slide-up"
                      >
                        <CartItemCard
                          item={item}
                          idx={idx}
                          isAr={isAr}
                          isRemoving={isCartUpdating}
                          formatCurrency={formatCurrency}
                          onRemove={handleRemoveItem}
                          onUpdateQty={handleUpdateQuantity}
                        />
                      </ScrollReveal>
                    );
                  })}
                </div>

                {/* Continue shopping */}
                <ScrollReveal
                  animation="slide-right"
                  delay={cartItems.length * 50}
                >
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mt-1"
                  >
                    {isAr ? (
                      <ArrowRightIcon className="w-4 h-4" />
                    ) : (
                      <ArrowLeftIcon className="w-4 h-4" />
                    )}
                    {t("misc.continue_shopping")}
                  </Link>
                </ScrollReveal>
              </div>

              {/* ════════════════════════════
                RIGHT — Order Summary
            ════════════════════════════ */}
              <div className="lg:sticky lg:top-28">
                <ScrollReveal
                  animation="slide-up"
                  delay={cartItems.length * 50}
                >
                  <OrderSummaryCard
                    cartItems={cartItems}
                    subtotal={subtotal}
                    checkoutHref={checkoutHref}
                    isCartUpdating={isCartUpdating}
                    preview={previewResult}
                  />
                </ScrollReveal>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



