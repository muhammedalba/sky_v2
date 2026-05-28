import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Tag, Minus, Plus, Save } from "lucide-react";
import Link from "next/link";

import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { useTrans } from "@/shared/hooks/useTrans";
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { getAttributeLabel } from "@/shared/constants/product-constants";
import { StockBadge } from "./StockBadge";

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
  item: CartItem;
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
  // display qty
  const displayQty = isEditing ? localQty : item.quantity;
  // update qty
  const handleUpdate = () => {
    const qty = Math.max(1, localQty);
    if (isEditing) setIsEditing(false);
    onUpdateQty(
      item.productId || item.product?._id || "",
      item.variantId || item.variant?._id || "",
      qty,
    );
  };
  // product
  const product = item.product;
  if (!product) return null;
  // title
  const title = getTrans(product.title);
  // category name
  const categoryName = getTrans(
    typeof product.category === "object" ? product.category.name : "NA",
  );
  // price, stock, sku, attributes, image, isUnlimitedStock, isActive
  const { price, stock, sku, attributes, image, isUnlimitedStock, isActive } =
    resolveItemData(item);
  // line total
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
            <button
              onClick={() =>
                onRemove(
                  item.productId || product._id,
                  item.variantId || item.variant?._id,
                )
              }
              disabled={isRemoving}
              className={`flex items-center justify-center gap-2 font-bold text-sm text-destructive bg-destructive/10 border border-destructive/30 px-4 py-2 rounded-xl cursor-pointer transition-colors shrink-0 disabled:opacity-50 ${isCompact ? "p-1.5 rounded-lg" : "p-2 rounded-xl"}`}
              title={t("item.remove")}
            >  {t("item.out_of_stock")}
              <Trash2 className="w-4 h-4" />
            </button>
        </div>
      )}

      <div
        className={`flex ${isCompact ? "flex-row gap-3 items-center" : "flex-col sm:flex-row gap-0"} animate-in fade-in slide-in-from-bottom-2 fill-mode-both`}
      >
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
        <div
          className={`flex-1 flex flex-col justify-between ${isCompact ? "py-1 gap-2" : "p-4 sm:p-5 gap-3"}`}
        >
          {/* Top row: title + remove */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product.slug || product._id}`}>
                <h3
                  className={`${isCompact ? "text-sm" : "text-base sm:text-lg"} font-bold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug`}
                >
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
              className={`text-muted-foreground z-20 cursor-pointer hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50 ${isCompact ? "p-1.5 rounded-lg" : "p-2 rounded-xl"}`}
              title={t("item.remove")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Attributes + stock */}
          <div className="flex flex-wrap items-center gap-2">
            <StockBadge stock={stock} isUnlimitedStock={isUnlimitedStock} />
            {attributes &&
              Object.entries(attributes).map(([key, val]) => {
                const attrVal =
                  typeof val === "object" && val !== null
                    ? String((val as { value?: string | number }).value)
                    : String(val);
                const attrUnit =
                  typeof val === "object" && val !== null
                    ? (val as { unit?: string }).unit
                    : "";

                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1 font-medium bg-accent/60 text-muted-foreground border border-border/40 ${isCompact ? "text-[10px] px-2 py-0.5 rounded-md" : "text-xs px-2.5 py-1 rounded-full"}`}
                  >
                    <span className="opacity-60">
                      {getAttributeLabel(key, isAr)}:
                    </span>
                    <span className="font-bold text-foreground uppercase">
                      {attrVal} {attrUnit}
                    </span>
                  </span>
                );
              })}
          </div>

          {/* Bottom row: price + qty + line total */}
          <div
            className={`flex items-center justify-between flex-wrap gap-2 ${isCompact ? "mt-1" : "pt-1 border-t border-border/40"}`}
          >
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
              <div
                className={`flex items-center gap-1 bg-accent/40 border border-border/50 ${isCompact ? "rounded-lg p-1" : "rounded-xl p-1"}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLocalQty(Math.max(1, displayQty - 1));
                    setIsEditing(true);
                  }}
                  disabled={displayQty <= 1 || isRemoving}
                  className={`${isCompact ? "w-6 h-6 rounded" : "w-8 h-8 rounded-lg"} flex items-center justify-center hover:bg-background shadow-sm disabled:opacity-10 transition-all text-foreground cursor-pointer`}
                >
                  <Minus className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={displayQty}
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
                    setLocalQty(Math.max(1, displayQty + 1));
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
                  className={`${isCompact ? "w-6 h-6 rounded-md" : "w-8 h-8 rounded-xl"} cursor-pointer flex items-center justify-center bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-all disabled:opacity-50`}
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
              <p
                className={`${isCompact ? "text-base" : "text-lg"} font-black text-primary`}
              >
                {formatCurrency(isCompact ? price : lineTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
