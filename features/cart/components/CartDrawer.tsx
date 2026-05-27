"use client";

import { useEffect } from "react";
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
import { useTrans } from "@/shared/hooks/useTrans";
import { Button } from "@/shared/ui/Button";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { createPortal } from "react-dom";
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  OrdersIcon,
  ShoppingCartIcon,
} from "@/shared/ui/Icons";
import { CartItemCard } from "@/app/[locale]/(store)/cart/page";

import { resolveItemData } from "@/features/cart/utils/cartUtils";

export default function CartDrawer() {
  const { isCartDrawerOpen, closeCartDrawer } = useCartStore();
  const locale = useLocale();
  const t = useTranslations("cart");
  const formatCurrency = useFormatCurrency();
  const getTrans = useTrans();
  const { data: user } = useMe();
  const isAr = locale === "ar";

  // --- Data Fetching ---
  const { data: serverCart } = useCart();
  const guestCartItems = useCartStore((state) => state.items);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const { mutate: removeServerItem, isPending: isRemoving } =
    useRemoveFromCart();
  const { mutate: updateServerQuantity, isPending: isUpdatingQuantity } =
    useUpdateCartQuantity();

  // Use server cart if logged in, otherwise guest cart
  const cartItems = user ? serverCart?.items || [] : guestCartItems;

  // Subtotal calculation
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const { price } = resolveItemData(item);
    return acc + price * item.quantity;
  }, 0);

  // --- Handlers ---
  const handleRemove = (productId: string, variantId?: string) => {
    if (user) {
      removeServerItem(productId); // Assuming backend removes by productId for now
    } else {
      removeGuestItem(productId, variantId);
    }
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
          isAr ? "left-0" : "right-0"
        } animate-in slide-in-from-${isAr ? "left" : "right"} zoom-in-95`}
      >
        {/* Header */}
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
            className="p-2 cursor-pointer hover:bg-accent rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <div className="bg-accent p-4 rounded-full w-20 h-20 flex items-center justify-center">
                <ShoppingCartIcon className=" w-full h-full text-muted-foreground " />
              </div>
              <p className="text-lg font-bold">
                {t("empty.title")}
              </p>
              <Link
                href={"/products"}
                onClick={closeCartDrawer}
                className="mt-4 rounded-xl bg-primary text-white px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-primary hover:ring-1 hover:ring-primary transition-all duration-300  hover:scale-102 hover:shadow-lg"
              >
                {t("empty.cta")}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item: any, idx: number) => {

                return (
                  <CartItemCard
                    key={item.variant?._id || item.product?._id || idx}
                    item={item}
                    idx={idx}
                    isAr={isAr}
                    isRemoving={isRemoving || isUpdatingQuantity}
                    isCompact={true}
                    formatCurrency={formatCurrency}
                    onRemove={handleRemove}
                    onUpdateQty={handleUpdateQuantity}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-accent/40 space-y-2">
            <div className="flex items-center justify-between font-black text-md">
              <span>{t("summary.subtotal")} : </span>
              <span className="text-primary">{formatCurrency(subtotal)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/cart" onClick={closeCartDrawer}>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold border-2 hover:bg-accent"
                >
                  {t("misc.view_cart")}
                </Button>
              </Link>
              <Link href="/checkout" onClick={closeCartDrawer}>
                <Button className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
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
        )}
      </div>
    </div>
  );

  // Return via portal if client-side
  if (typeof document === "undefined") return null;
  return createPortal(drawerContent, document.body);
}
