import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import Price from "@/shared/ui/Price";
import { VariantAttributes } from "@/shared/ui/VariantAttributes";
import { useFormatVariantAttributes } from "@/shared/hooks/useFormatVariantAttributes";
import { useTrans } from "@/shared/hooks/useTrans";
import { CartItem, resolveItemData } from "@/features/cart/utils/cartUtils";
import { StockBadge } from "./StockBadge";
import { CheckIcon, MinusIcon, PlusIcon, XIcon } from "@/shared/ui/Icons";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";

export function CartItemCard({
  item,
  idx,
  isRemoving,
  isCompact = false,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  idx: number;
  isRemoving: boolean;
  isCompact?: boolean;
  onRemove: (productId: string, variantId?: string) => void;
  onUpdateQty: (productId: string, variantId: string, newQty: number) => void;
}) {
  const [localQty, setLocalQty] = useState(item.quantity);
  const [isEditing, setIsEditing] = useState(false);
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const formatAttrs = useFormatVariantAttributes();
  const t = useTranslations("cart");

  const displayQty = isEditing ? localQty : item.quantity;

  const handleUpdate = () => {
    const qty = clampQty(localQty);
    if (isEditing) setIsEditing(false);
    onUpdateQty(
      item.productId || item.product?._id || "",
      item.variantId || item.variant?._id || "",
      qty,
    );
  };

  const product = item.product;
  if (!product) return null;

  const title = getTrans(product.title);
  const {
    price,
    stock,
    attributes,
    components,
    image,
    isUnlimitedStock,
    isActive,
  } = resolveItemData(item);
  const attrsText = formatAttrs(attributes, " · ", components);
  const lineTotal = price * item.quantity;

  // Max allowed quantity — unlimited when stock is untracked/unknown
  const maxQty =
    !isUnlimitedStock && stock !== null ? Math.max(1, stock) : Infinity;
  const clampQty = (qty: number) => Math.min(maxQty, Math.max(1, qty));

  const isOutOfStock = !isUnlimitedStock && stock === 0;
  const isUnavailable = !isActive;

  /* ── Compact variant (used in CartDrawer) ── */
  if (isCompact) {
    return (
      <div
        className="group relative flex items-center gap-3 py-3 border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors px-1"
        style={{ animationDelay: `${idx * 60}ms` }}
      >
        {/* Image */}
        <Link
          href={`/products/${product.slug || product._id}`}
          className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-accent/30"
        >
          <ImageWithFallback
            src={image}
            alt={(title as string) || "Product"}
            fill
            className="object-cover"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <Link href={`/products/${product.slug || product._id}`}>
            <p className="text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
              {title as string}
            </p>
          </Link>
          {attrsText && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {attrsText}
            </p>
          )}
          <p className="text-xs font-bold text-primary tabular-nums inline-flex items-baseline gap-1">
            <Price amount={price} animate={false} />
            <span className="text-muted-foreground font-normal">
              × {item.quantity}
            </span>
          </p>
        </div>

        {/* Remove */}
        <button
          onClick={() =>
            onRemove(
              item.productId || product._id,
              item.variantId || item.variant?._id,
            )
          }
          disabled={isRemoving}
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 cursor-pointer"
          title={t("item.remove")}
        >
          <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  /* ── Full cart row layout ── */
  return (
    <div
      className="group relative bg-background/50 border border-border rounded-lg overflow-hidden"
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      {/* Unavailable overlay */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
          <span className="text-sm font-bold text-muted-foreground bg-accent border border-border px-5 py-2 rounded-xl">
            {t("item.product_unavailable")}
          </span>
        </div>
      )}

      {/* Out-of-stock overlay */}
      {!isUnavailable && isOutOfStock && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
          <button
            onClick={() =>
              onRemove(
                item.productId || product._id,
                item.variantId || item.variant?._id,
              )
            }
            disabled={isRemoving}
            className="flex items-center gap-2 text-sm font-bold text-destructive bg-destructive/10 border border-destructive/30 px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50"
          >
            {t("item.out_of_stock")}
          </button>
        </div>
      )}

      <div className="flex gap-4 p-4">
        {/* ── Image ── */}
        <Link
          href={`/products/${product.slug || product._id}`}
          className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-accent/40 block"
        >
          <ImageWithFallback
            src={image}
            alt={(title as string) || "Product"}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </Link>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Row 1: Title + Remove */}
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/products/${product.slug || product._id}`}
              className="flex-1 min-w-0"
            >
              <h3 className="text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
                {title as string}
              </h3>
            </Link>
            <button
              onClick={() =>
                onRemove(
                  item.productId || product._id,
                  item.variantId || item.variant?._id,
                )
              }
              disabled={isRemoving}
              className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 cursor-pointer z-20"
              title={t("item.remove")}
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2: Attributes + Stock */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {/* Only show stock if it's low/out */}
            {!isUnlimitedStock && stock !== null && stock <= 10 && (
              <StockBadge stock={stock} isUnlimitedStock={isUnlimitedStock} />
            )}
            <VariantAttributes
              attributes={attributes}
              components={components}
              badgeClassName="text-xs"
            />
          </div>

          {/* Row 3: Unit price + Qty + Line total */}
          <div className="flex items-center justify-between flex-wrap gap-3 mt-auto pt-1">
            {/* Quantity selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border/50 rounded-sm overflow-hidden bg-accent/50">
                <button
                  type="button"
                  onClick={() => {
                    setLocalQty(Math.max(1, displayQty - 1));
                    setIsEditing(true);
                  }}
                  disabled={displayQty <= 1 || isRemoving}
                  className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <MinusIcon className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  min="1"
                  max={Number.isFinite(maxQty) ? maxQty : undefined}
                  value={displayQty}
                  onChange={(e) => {
                    setLocalQty(clampQty(parseInt(e.target.value) || 1));
                    setIsEditing(true);
                  }}
                  className="w-fit max-w-12 h-7 text-center text-sm font-semibold tabular-nums bg-transparent border-none focus:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={displayQty >= maxQty || isRemoving}
                  onClick={() => {
                    setLocalQty(clampQty(displayQty + 1));
                    setIsEditing(true);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isRemoving}
                  className="w-9 h-9 flex items-center justify-center disabled:opacity-50 cursor-pointer border rounded-full"
                  title={t("item.update_quantity")}
                >
                  <CheckIcon className="w-4 h-4 text-primary" />
                </button>
              )}
            </div>

            {/* Line total */}
            <div className="flex flex-col items-end">
              <Price
                amount={lineTotal}
                className="text-base text-foreground tabular-nums"
                animate={false}
              />
              {/* Unit price */}

              <span className="text-sm text-muted-foreground tabular-nums">
                {formatCurrency(price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
