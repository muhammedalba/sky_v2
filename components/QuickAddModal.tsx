"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Product, ProductVariant } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import Price from "@/shared/ui/Price";
import { VariantAttributes, formatAttributeValue } from "@/shared/ui/VariantAttributes";
import { getAttributeLabel } from "@/shared/constants/product-constants";
import { FileAsset } from "@/shared/types/file-asset";
import { useTrans } from "@/shared/hooks/useTrans";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import {
  XIcon as X,
  ShoppingBagIcon as ShoppingBag,
  MinusIcon as Minus,
  PlusIcon as Plus,
  AlertCircleIcon as AlertCircle,
  CheckCircle2Icon as CheckCircle2
} from "@/shared/ui/Icons";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

type Selection = Record<string, string>;

interface AttributeOption {
  value: string;
  label: string;
  available: boolean;
}

// Raw attribute value used for matching (unit excluded), e.g. { value: 100, unit: "ml" } -> "100"
const getAttrValue = (attr: unknown): string | null => {
  if (attr === undefined || attr === null) return null;
  return typeof attr === "object" ? String((attr as { value?: unknown }).value) : String(attr);
};

const toSelection = (variant: ProductVariant): Selection => {
  const selection: Selection = {};
  Object.entries(variant.attributes || {}).forEach(([key, attr]) => {
    const value = getAttrValue(attr);
    if (value !== null) selection[key] = value;
  });
  return selection;
};

const matchesSelection = (variant: ProductVariant, selection: Selection) =>
  Object.entries(selection).every(([key, value]) => getAttrValue(variant.attributes?.[key]) === value);

export default function QuickAddModal({ isOpen, onClose, product }: QuickAddModalProps) {
  const getTrans = useTrans();
  const locale = useLocale();
  const commonT = useTranslations("common");
  const productT = useTranslations("product");
  const { mutate: addToCart, isPending: adding } = useAddToCart();

  const isAr = locale === "ar";
  const isUnlimitedStock = !!product.isUnlimitedStock;

  const variants = useMemo(() => product?.variants || [], [product]);
  const hasVariants = variants.length > 0;

  const isVariantAvailable = useCallback(
    (v: ProductVariant) => v.isActive && (isUnlimitedStock || v.stock > 0),
    [isUnlimitedStock]
  );

  // --- States ---
  const [selectedImage, setSelectedImage] = useState<FileAsset | string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Selection>(() => {
    const firstAvailable = variants.find(isVariantAvailable) || variants[0];
    return firstAvailable ? toSelection(firstAvailable) : {};
  });

  // Attribute names: prefer product.allowedAttributes, fall back to keys found on variants
  const attributeNames = useMemo(() => {
    if (product.allowedAttributes?.length) return product.allowedAttributes.map((a) => a.name);
    const names = new Set<string>();
    variants.forEach((v) => Object.keys(v.attributes || {}).forEach((k) => names.add(k)));
    return Array.from(names);
  }, [product.allowedAttributes, variants]);

  // Unique options per attribute, computed once instead of on every render
  const attributeOptions = useMemo(() => {
    return attributeNames
      .map((name) => {
        const options = new Map<string, AttributeOption>();
        variants.forEach((v) => {
          const attr = v.attributes?.[name];
          const value = getAttrValue(attr);
          if (value === null) return;
          const prev = options.get(value);
          options.set(value, {
            value,
            label: formatAttributeValue(attr),
            available: (prev?.available ?? false) || isVariantAvailable(v),
          });
        });
        return { name, options: Array.from(options.values()) };
      })
      .filter((attr) => attr.options.length > 0);
  }, [attributeNames, variants, isVariantAvailable]);

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!hasVariants) return null;
    return variants.find((v) => matchesSelection(v, selectedAttributes)) || null;
  }, [hasVariants, variants, selectedAttributes]);

  const handleAttributeSelect = useCallback(
    (attributeName: string, value: string) => {
      setSelectedAttributes((prev) => {
        const next = { ...prev, [attributeName]: value };
        const exact = variants.find((v) => matchesSelection(v, next));
        if (exact && isVariantAvailable(exact)) return next;

        // Combination doesn't exist / out of stock: jump to an available variant with this value
        const fallback = variants.find(
          (v) => isVariantAvailable(v) && getAttrValue(v.attributes?.[attributeName]) === value
        );
        return fallback ? toSelection(fallback) : next;
      });
      setSelectedImage(null);
      setQuantity(1);
    },
    [variants, isVariantAvailable]
  );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // --- Display Values ---
  const title = getTrans(product.title);
  const description = getTrans(product.description);
  const categoryName = typeof product.category === "object" && product.category && "name" in product.category
    ? getTrans(product.category.name)
    : "";

  const brandName = typeof product.brand === "object" && product.brand && "name" in product.brand
    ? getTrans(product.brand.name)
    : "";

  const allImages = [product.imageCover, ...(product.images || [])].filter(Boolean) as (FileAsset | string)[];
  const currentDisplayImage = selectedImage || selectedVariant?.image || product.imageCover || "";

  const displayPrice = selectedVariant?.priceAfterDiscount || selectedVariant?.price || product.priceRange?.min || product.comparePrice || 0;
  const oldPrice = (selectedVariant?.priceAfterDiscount ? selectedVariant.price : product.comparePrice || product.priceRange?.max) || 0;
  const hasDiscount = oldPrice > displayPrice;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - displayPrice) / oldPrice) * 100) : 0;

  const currentStock = hasVariants ? (selectedVariant?.stock ?? 0) : (product.stockSummary ?? 0);
  const isOutOfStock = hasVariants
    ? !selectedVariant || !isVariantAvailable(selectedVariant)
    : currentStock <= 0 && !isUnlimitedStock;
  const maxQuantity = isUnlimitedStock ? Infinity : currentStock;

  const handleAddToCartClick = () => {
    if (isOutOfStock) return;

    addToCart(
      {
        productId: product._id,
        variantId: selectedVariant?._id ?? variants[0]?._id ?? "",
        quantity,
        product,
      },
      { onSuccess: onClose }
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const gallery = (
    <>
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden max-h-[30dvh] md:max-h-95">
        {hasDiscount && (
          <Badge className="absolute top-3 inset-s-3 z-10 bg-destructive text-white font-bold px-2 py-0.5 text-xs shadow-md">
            {productT("badges.discount", { percent: discountPercent })}
          </Badge>
        )}
        <ImageWithFallback
          src={currentDisplayImage}
          alt={title}
          fill
          className="object-contain transition-all duration-300"
          priority
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 md:mt-4 overflow-x-auto w-full max-w-xs no-scrollbar justify-center py-1">
          {allImages.map((img, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setSelectedImage(img)}
              aria-label={`${title} ${i + 1}`}
              aria-pressed={currentDisplayImage === img}
              className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 cursor-pointer ${
                currentDisplayImage === img ? "border-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <ImageWithFallback src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      // z-110: above MobileBottomNav (z-100) so the footer isn't hidden behind it
      className="fixed inset-0 z-110 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full max-w-4xl bg-background rounded-3xl overflow-hidden border border-border/50 shadow-2xl flex flex-col md:flex-row max-h-[92dvh] md:max-h-[85vh] animate-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 inset-e-4 z-40 w-10 h-10 bg-background/80 hover:bg-accent text-foreground hover:scale-105 rounded-full flex items-center justify-center border border-border/30 transition-all cursor-pointer"
          aria-label={commonT("buttons.close")}
        >
          <X className="w-5 h-5 text-destructive" />
        </button>

        {/* Gallery (desktop: side column — mobile: rendered inside the scroll area) */}
        <div className="hidden md:flex md:w-1/2 bg-accent/30 p-6 flex-col justify-center items-center relative overflow-hidden shrink-0 md:border-e border-border/40">
          {gallery}
        </div>

        {/* Product details & selection */}
        <div className="w-full md:w-1/2 flex-1 min-h-0 flex flex-col">
          {/* Fixed header: info & price */}
          <div className="shrink-0 p-4 pe-16 md:p-8 md:pe-16 md:pb-4 border-b border-border/30 bg-accent/50">
            <div className="space-y-1.5 md:space-y-2 min-w-0">
              <div className="flex flex-wrap gap-2">
                {brandName && (
                  <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
                    {brandName}
                  </Badge>
                )}
                {categoryName && (
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {categoryName}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg md:text-2xl font-black title-gradient leading-snug line-clamp-2">
                {title}
              </h2>
              {description && (
                <p className="text-xs md:text-sm text-foreground/60 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Scrollable variants attributes selector */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="md:hidden flex flex-col items-center px-4 pt-4 bg-accent/30">
              {gallery}
            </div>

            {attributeOptions.length > 0 && (
              <div className="space-y-4 px-4 md:px-8 py-4">
                {attributeOptions.map(({ name, options }) => (
                  <div key={name} className="space-y-2" role="group" aria-label={getAttributeLabel(name, isAr)}>
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                      {getAttributeLabel(name, isAr)}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {options.map(({ value, label, available }) => {
                        const isSelected = selectedAttributes[name] === value;
                        return (
                          <button
                            type="button"
                            key={value}
                            onClick={() => handleAttributeSelect(name, value)}
                            disabled={!available}
                            aria-pressed={isSelected}
                            className={`h-7 px-3 rounded-xl font-medium text-xs transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-sm font-semibold"
                                : "border-border/60 bg-background text-foreground/80 hover:border-primary/50"
                            } ${!available ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                          >
                            <span dir="ltr">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed footer: action area */}
          <div className="shrink-0 px-4 py-3 md:px-6 md:py-4 border-t border-border/30 space-y-3 bg-accent/50">

            {/* Selected variant summary */}
            {selectedVariant && (
              <VariantAttributes
                attributes={selectedVariant.attributes}
                getLabel={(key) => getAttributeLabel(key, isAr)}
                badgeClassName="text-[10px] px-2 py-0.5"
              />
            )}

            {/* Price & stock status */}
            <div className="flex items-end justify-between gap-1">
              <div className="flex items-baseline gap-1 flex-wrap">
                <Price amount={displayPrice} className="text-lg font-black text-primary tracking-tight" />
                {hasDiscount && (
                  // Price is inline-flex, so text-decoration doesn't propagate — draw the strike line manually
                  <s className="relative inline-flex items-center text-sm no-underline after:absolute after:inset-x-0 after:top-1/2 after:h-[1.5px] after:-translate-y-1/2 after:rounded-full after:bg-muted-foreground/70">
                    <Price
                      animate={false}
                      amount={oldPrice}
                      numberClassName="text-muted-foreground/70 font-semibold"
                      currencyClassName="text-muted-foreground/70"
                    />
                  </s>
                )}
              </div>

              <div
                className={`flex items-center gap-1.5 shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isOutOfStock ? "text-destructive bg-destructive/10" : "text-success bg-success/10"
                }`}
              >
                {isOutOfStock ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {isOutOfStock
                  ? commonT("stocks.out_of_stock")
                  : isUnlimitedStock
                  ? commonT("stocks.in_stock")
                  : commonT("stocks.only_left", { stock: currentStock })}
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* Quantity selector */}
              <div className="flex items-center border border-border/60 rounded-xl h-9 bg-accent/40 p-1 w-28 shrink-0">
                <button
                  type="button"
                  aria-label={commonT("buttons.decrease_quantity")}
                  className="w-8 h-full flex items-center justify-center hover:bg-accent rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center font-bold text-sm" aria-live="polite">{quantity}</div>
                <button
                  type="button"
                  aria-label={commonT("buttons.increase_quantity")}
                  className="w-8 h-full flex items-center justify-center hover:bg-accent rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={isOutOfStock || quantity >= maxQuantity}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart button */}
              <Button
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
                isLoading={adding}
                size="sm"
                className="flex-1 h-9 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? commonT("buttons.out_of_stock") : commonT("buttons.add_to_cart")}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
