"use client";

import { useEffect, useSyncExternalStore, useMemo, useCallback } from "react"; // إضافة خطافات الأداء والحالة
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import {
  useCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "@/features/cart/hooks/useCart";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useSettings } from "@/app/providers/SettingsProvider";
// تم إزالة useTrans لأنه لم يكن مستخدماً في هذا المكون لتخفيف الاستيرادات
import { Button } from "@/shared/ui/Button";
import { createPortal } from "react-dom";
import {
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from "@/shared/ui/Icons";

import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { CartItemCard } from "./CartItemCard";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

/* ------------------------------------------------------------------ */
/* Drawer Component                                                   */
/* ------------------------------------------------------------------ */
export default function CartDrawer() {
  //  hooks
  const locale = useLocale();
  const t = useTranslations("cart");
  const formatCurrency = useFormatCurrency();
  // direction
  const isAr = locale === "ar";

  // --- Data Fetching ---
  const settings = useSettings();
  const { data: user } = useMe();
  const { data: serverCart } = useCart();
  // cart hooks
  const { mutate: removeServerItem, isPending: isRemoving } =
    useRemoveFromCart();
  const { mutate: updateServerQuantity, isPending: isUpdatingQuantity } =
    useUpdateCartQuantity();
  // is cart updating
  const isCartUpdating = isRemoving || isUpdatingQuantity;

  // cart store
  const guestCartItems = useCartStore((state) => state.items);
  const { isCartDrawerOpen, closeCartDrawer } = useCartStore();
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);

  // --- Close on Esc ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartDrawerOpen]);

  // Improvement: useSyncExternalStore to avoid Hydration Mismatch issues with createPortal
  // Instead of useState + useEffect to prevent cascading renders
  const isMounted = useSyncExternalStore(
    () => () => {}, // subscribe: no external subscriptions
    () => true, // getSnapshot (client): component is mounted
    () => false, // getServerSnapshot: always false during SSR
  );

  // get cart items if user is logged in or guest
  const cartItems = useMemo(() => {
    return user ? serverCart?.items || [] : guestCartItems || [];
  }, [user, serverCart?.items, guestCartItems]);

  // calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc: number, item: CartItem) => {
      // get price of item
      const { price } = resolveItemData(item);
      // check if price is valid
      return acc + (price || 0) * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  // --- Handlers ---
  // remove item from cart
  const handleRemove = useCallback(
    (productId: string, variantId?: string) => {
      if (!productId) return;
      if (user) {
        removeServerItem(productId);
      } else {
        removeGuestItem(productId, variantId);
      }
    },
    [user, removeServerItem, removeGuestItem],
  );

  // update item quantity in cart
  const handleUpdateQuantity = useCallback(
    (productId: string, variantId: string, newQty: number) => {
      if (!productId) return;
      const safeQty = Math.max(1, Number(newQty) || 1);
      if (!user) {
        updateGuestQuantity(productId, variantId, safeQty);
      } else {
        updateServerQuantity({ productId, variantId, quantity: safeQty });
      }
    },
    [user, updateGuestQuantity, updateServerQuantity],
  );

  //if user not logged in and guest checkout is disabled, redirect to login page
  const checkoutHref = useMemo(() => {
    if (!user && !settings.features.guestCheckout) {
      return "/login?redirect=/checkout";
    }
    return "/checkout";
  }, [user, settings.features.guestCheckout]);

  // prevent rendering if not mounted or drawer is closed
  if (!isMounted || !isCartDrawerOpen) return null;

  // drawer content
  const drawerContent = (
    <div className="fixed inset-0 z-50 flex " aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeCartDrawer}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 bottom-0 w-full sm:w-[400px] md:w-[450px] bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isAr ? "left-0" : "right-0"
        } animate-in slide-in-from-${isAr ? "left" : "right"} zoom-in-95`}
      >
        {/* Header */}
        <ScrollReveal  animation="fade">
          <div className="flex items-center justify-between px-6 py-5 bg-accent/40 border-b border-border/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-black title-gradient">
                  {t("title")}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {t("misc.number_of_products")}:
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full w-fit">
                  {cartItems.length}
                </span>
              </div>
            </div>
            <button
              onClick={closeCartDrawer}
              type="button"
              className="p-2 cursor-pointer hover:bg-accent rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close cart"
            >
              <XIcon className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </ScrollReveal>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 ">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <ScrollReveal
                animation="slide-up"
                className="flex items-center justify-center flex-col gap-3"
              >
                <div className="bg-accent p-4 rounded-full w-20 h-20 flex items-center justify-center">
                  <ShoppingCartIcon className=" w-full h-full text-muted-foreground " />
                </div>
                <p className="text-lg font-bold">{t("empty.title")}</p>
                <Link
                  href={"/products"}
                  onClick={closeCartDrawer}
                  className="mt-4 rounded-xl bg-primary text-white px-4 py-2 text-sm cursor-pointer hover:bg-primary/90 hover:ring-1 hover:ring-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  {t("empty.cta")}
                </Link>
              </ScrollReveal>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item: CartItem, idx: number) => {
                // generate unique key for each item
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
                    delay={idx * 200}
                    animation="slide-up"
                  >
                    <CartItemCard
                      item={item}
                      idx={idx}
                      isAr={isAr}
                      isRemoving={isCartUpdating}
                      isCompact={true}
                      formatCurrency={formatCurrency}
                      onRemove={handleRemove}
                      onUpdateQty={handleUpdateQuantity}
                    />
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <ScrollReveal animation="slide-up">
            <div className="p-6 border-t border-border/50 bg-accent/40 space-y-4 pb-28 sm:pb-6">
              <div className="flex items-center justify-between font-black text-md">
                <span>{t("summary.subtotal")} : </span>
                <span className="text-primary">{formatCurrency(subtotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={closeCartDrawer} className="block">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-bold border hover:bg-accent hover:text-primary"
                  >
                    {t("misc.view_cart")}
                  </Button>
                </Link>
                <Link
                  href={checkoutHref}
                  onClick={closeCartDrawer}
                  className="block"
                >
                  <Button
                    className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                    disabled={isCartUpdating}
                  >
                    {t("summary.checkout")}
                    {isAr ? (
                      <ArrowLeftIcon className="w-4 h-4" />
                    ) : (
                      <ArrowRightIcon className="w-4 h-4" />
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );

  // render drawer content
  return createPortal(drawerContent, document.body);
}
