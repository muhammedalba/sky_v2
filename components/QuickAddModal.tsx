"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Product, ProductVariant } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTrans } from "@/shared/hooks/useTrans";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { 
  X, 
  ShoppingBag, 
  Minus, 
  Plus, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  t: (key: string) => string;
}

export default function QuickAddModal({ isOpen, onClose, product, t }: QuickAddModalProps) {
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const locale = useLocale();
  const commonT = useTranslations("common");
  const { mutate: addToCart, isPending: adding } = useAddToCart();

  const isAr = locale === "ar";

  // Memoize variants to ensure stable references
  const variants = useMemo(() => product?.variants || [], [product]);
  const hasVariants = variants.length > 0;

  // --- States ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Initialize selectedAttributes directly to avoid synchronous useEffect setState calling
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initialSelections: Record<string, string> = {};
    if (variants.length > 0) {
      const firstAvailable = variants.find((v) => v.isActive && v.stock > 0) || variants[0];
      if (firstAvailable?.attributes) {
        Object.keys(firstAvailable.attributes).forEach((key) => {
          initialSelections[key] = String(firstAvailable.attributes[key].value);
        });
      }
    }
    return initialSelections;
  });

  // --- Selected Variant Selector Logic ---
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!hasVariants) return null;

    return variants.find((v) => {
      if (!v.attributes) return false;
      return Object.entries(selectedAttributes).every(([attrName, selectedValue]) => {
        const variantAttr = v.attributes?.[attrName];
        return String(variantAttr?.value) === String(selectedValue);
      });
    }) || null;
  }, [hasVariants, variants, selectedAttributes]);

  const handleAttributeSelect = useCallback((attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [attributeName]: value }));
    setQuantity(1); // Reset quantity when attribute changes
  }, []);

  const handleAddToCartClick = () => {
    if (!product) return;

    const variantId = selectedVariant ? selectedVariant._id : (variants[0]?._id || "");
    
    if (hasVariants && !selectedVariant) {
      return;
    }

    addToCart(
      {
        productId: product._id,
        variantId,
        quantity,
        product,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
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

  const allImages = [product.imageCover, ...(product.images || [])].filter(Boolean) as string[];
  const currentDisplayImage = selectedVariant?.image || selectedImage || product.imageCover || "";

  const displayPrice = selectedVariant?.priceAfterDiscount || selectedVariant?.price || product.priceRange?.min || product.comparePrice || 0;
  const oldPrice = selectedVariant?.priceAfterDiscount ? selectedVariant.price : product.comparePrice || product.priceRange?.max;
  const hasDiscount = !!(oldPrice && oldPrice > displayPrice);

  const currentStock = hasVariants ? (selectedVariant?.stock ?? 0) : (product.stockSummary ?? 0);
  const isOutOfStock = currentStock <= 0 && !product.isUnlimitedStock;

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-background rounded-3xl overflow-hidden border border-border/50 shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-10 h-10 bg-background/80 hover:bg-accent text-foreground hover:scale-105 rounded-full flex items-center justify-center border border-border/30 transition-all cursor-pointer"
          aria-label={commonT("buttons.close") || "Close"}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery / Image Container */}
        <div className="w-full md:w-1/2 bg-accent/30 p-6 flex flex-col justify-center items-center relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-e border-border/40">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden max-h-[300px] md:max-h-[380px]">
            {hasDiscount && (
              <Badge className="absolute top-3 left-3 z-10 bg-destructive text-white font-bold px-2 py-0.5 text-xs shadow-md">
                {isAr ? "خصم" : "Discount"} {Math.round(((oldPrice - displayPrice) / oldPrice) * 100)}%
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
            <div className="flex gap-2 mt-4 overflow-x-auto w-full max-w-xs no-scrollbar justify-center py-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 cursor-pointer ${
                    currentDisplayImage === img ? "border-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <ImageWithFallback src={img} alt={`Thumb ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product details & selection */}
        <div className="w-full md:w-1/2  flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6  p-6 md:p-8 pb-0">
            
            {/* Header info */}
            <div className="space-y-2">
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
              <h2 className="text-2xl font-black title-gradient leading-snug line-clamp-2">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-foreground/60 line-clamp-3 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Price display */}
            <div className="flex items-end gap-3 p-4 rounded-2xl bg-accent/40 border border-border/20 w-fit">
              <span className="text-lg font-black text-primary tracking-tight">
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg font-semibold text-muted-foreground/70 line-through mb-0.5">
                  {formatCurrency(oldPrice)}
                </span>
              )}
            </div>

            {/* Variants attributes selector */}
            {hasVariants && product.allowedAttributes && (
              <div className="space-y-4 pt-4 border-t border-border/30">
                {product.allowedAttributes.map((attr) => {
                  const optionsMap = new Map();
                  variants.forEach((v) => {
                    const attrData = v.attributes?.[attr.name];
                    if (attrData && attrData.value) {
                      optionsMap.set(String(attrData.value), attrData.unit || "");
                    }
                  });

                  const uniqueValues = Array.from(optionsMap.keys());

                  return (
                    <div key={attr.name} className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                        {attr.name}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {uniqueValues.map((val) => {
                          const isSelected = selectedAttributes[attr.name] === val;
                          const unit = optionsMap.get(val);

                          const isAvailable = variants.some(
                            (v) =>
                              String(v.attributes[attr.name]?.value) === val &&
                              (v.stock > 0 || product.isUnlimitedStock)
                          );

                          return (
                            <button
                              key={val}
                              onClick={() => handleAttributeSelect(attr.name, val)}
                              disabled={!isAvailable}
                              className={`h-10 px-4 rounded-xl font-medium text-xs transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm font-semibold"
                                  : "border-border/60 bg-background text-foreground/80 hover:border-primary/50"
                              } ${!isAvailable ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                            >
                              <span dir="ltr">
                                {val} {unit}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action area */}
          <div className="p-6 pt-0 md:p-8 border-t border-border/30  space-y-4 bg-accent/40">
            
            {/* Stock status */}
            <div className={`flex items-center gap-2 text-xs font-bold ${isOutOfStock ? "text-destructive" : "text-success"}`}>
              {isOutOfStock ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {isOutOfStock
                ? (isAr ? "المنتج غير متوفر حالياً" : "Out of stock")
                : product.isUnlimitedStock
                ? (isAr ? "متوفر بالمخزون" : "In stock")
                : isAr
                ? `متبقي ${currentStock} قطع فقط`
                : `Only ${currentStock} left`}
            </div>

            <div className="flex items-center gap-3 ">
              
              {/* Quantity selector */}
              <div className="flex items-center border border-border/60 rounded-xl h-11 bg-accent/40 p-1 w-28 shrink-0">
                <button
                  className="w-8 h-full flex items-center justify-center hover:bg-accent rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center font-bold text-sm">{quantity}</div>
                <button
                  className="w-8 h-full flex items-center justify-center hover:bg-accent rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                  onClick={() => setQuantity(product.isUnlimitedStock ? quantity + 1 : Math.min(currentStock, quantity + 1))}
                  disabled={isOutOfStock || (!product.isUnlimitedStock && quantity >= currentStock)}
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
                className="flex-1 h-11 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? commonT("buttons.out_of_stock") || "Out of Stock" : commonT("buttons.add_to_cart") || "Add to Cart"}
              </Button>
            </div>
          </div> 
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
