"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTrans } from "@/shared/hooks/useTrans";
import { Button } from "@/shared/ui/Button";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import QuickAddModal from "@/components/QuickAddModal";
import { Product } from "@/types";
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
  Share2Icon,
} from "@/shared/ui/Icons";
import Badge from "@/shared/ui/Badge";

interface SimilarProductsProps {
  product: Product;
}

export default function SimilarProducts({ product }: SimilarProductsProps) {
  const categoryId =
    (typeof product.category === "object"
      ? product.category?._id
      : product.category) || undefined;
  const brandId =
    (typeof product.brand === "object" ? product.brand?._id : product.brand) ||
    undefined;

  const { data: byBrand } = useProducts(
    { brand: brandId, limit: 8 },
    { enabled: !!brandId },
  );
  const { data: byCategory } = useProducts(
    { category: categoryId, limit: 8 },
    { enabled: !!categoryId },
  );

  const relatedProducts = useMemo(() => {
    const seen = new Set<string>(product._id ? [product._id] : []);
    const result: Product[] = [];
    [...(byBrand?.data || []), ...(byCategory?.data || [])].forEach((p) => {
      if (!seen.has(p._id)) {
        seen.add(p._id);
        result.push(p);
      }
    });
    return result.slice(0, 8);
  }, [byBrand, byCategory, product._id]);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-14 bg-background w-full p-7">
      <h2 className="text-2xl sm:text-3xl font-black text-center title-gradient mb-8">
        قد يعجبك أيضاً
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {relatedProducts.map((item) => (
          <SimilarProductCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SimilarProductCard({ item }: { item: Product }) {
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();
  const commonT = useTranslations("common.buttons");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { mutate: addToCart, isPending: adding } = useAddToCart();

  const title = getTrans(item.title);
  const description = getTrans(item.description);
  const price = item.priceRange?.min || 0;
  const oldPrice = item.priceRange?.max;
  const hasDiscount = !!(oldPrice && oldPrice > price);
  const locale = useLocale();
  // 2. تجميع منطق الماركي والمصفوفة في useMemo واحد وتقليل الـ overhead
  const marqueeContent = useMemo(() => {
    // استخراج مصفوفة الاستخدامات بناءً على اللغة الحالية
    // item.uses يمكن أن يكون { en: string[], ar: string[] } أو string[] أو undefined
    let uses: string[] = [];
    if (item?.uses) {
      if (Array.isArray(item.uses)) {
        // حالة قديمة: مصفوفة مباشرة
        uses = item.uses as string[];
      } else if (
        typeof item.uses === "object" &&
        ("en" in item.uses || "ar" in item.uses)
      ) {
        // حالة all_langs=true: كائن { en: string[], ar: string[] }
        const localizedUses = item.uses as { en?: string[]; ar?: string[] };
        uses =
          localizedUses[locale as "en" | "ar"] ??
          localizedUses.en ??
          localizedUses.ar ??
          [];
      }
    }

    if (!uses.length) return null;

    return Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className="flex gap-5 shrink-0 items-center"
        aria-hidden={index > 0 ? "true" : "false"}
      >
        {uses.map((text) => (
          <div
            // إصلاح الـ Key لضمان عدم تكراره في شجرة الـ DOM
            key={`${index}-${text}`}
            className="flex items-center justify-center min-w-30"
          >
            <Badge variant={"info"}>
              <span className="uppercase tracking-widest   transition-colors">
                {text}
              </span>
            </Badge>
          </div>
        ))}
      </div>
    ));
  }, [item.uses, locale]);

  const handleAddToCartClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.variantCount > 1) {
        setIsQuickAddOpen(true);
        return;
      }
      const variantId =
        item.variants && item.variants.length > 0 ? item.variants[0]._id : "";
      addToCart({
        productId: item._id,
        variantId,
        quantity: 1,
        product: item,
      });
    },
    [item, addToCart],
  );

  return (
    <div className="group relative bg-background rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
      <Link
        href={`/products/${item.slug}`}
        className="relative aspect-4/3 block overflow-hidden bg-secondary/10"
      >
        {item.isFeatured && (
          <span className="absolute top-3 rtl:right-3 ltr:left-3 z-10 bg-warning text-warning-foreground text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-sm">
            الأكثر مبيعاً
          </span>
        )}
        {item.imageCover?.url && (
          <ImageWithFallback
            src={item.imageCover.url}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </Link>

      <div className="absolute top-3 rtl:left-3 ltr:right-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          aria-label="إضافة للمفضلة"
          className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
        >
          <HeartIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          aria-label="مشاركة"
          className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
        >
          <Share2Icon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            className="font-bold text-sm text-foreground line-clamp-1 hover:text-primary transition-colors"
          >
            {title}
          </Link>
          {!!item.ratingsAverage && (
            <div className="flex items-center gap-1 shrink-0">
              <StarIcon className="w-3.5 h-3.5 text-warning fill-warning" />
              <span className="text-xs font-semibold text-foreground">
                {item.ratingsAverage.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        )}

           {marqueeContent && (
            <div className="w-full relative flex overflow-hidden mask-image-fade my-2">
              <div className="flex whitespace-nowrap animate-marquee items-center gap-5 hover:opacity-50 hover:grayscale grayscale-0 opacity-100 transition-all duration-500">
                {marqueeContent}
              </div>
            </div>
          )}

        <div className="flex items-end gap-2 pt-1">
          <span className="text-base font-bold text-primary">
            {formatCurrency(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(oldPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleAddToCartClick}
            isLoading={adding}
          >
            <ShoppingCartIcon className="w-3.5 h-3.5" />
            {item.variantCount > 1 ? commonT("select") : commonT("add_to_cart")}
          </Button>
          <Link
            href={`/products/${item.slug}`}
            aria-label="عرض التفاصيل"
            className="w-9 h-9 shrink-0 rounded-full border border-border/60 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            <ArrowRightIcon className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {isQuickAddOpen && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          product={item}
          t={commonT}
        />
      )}
    </div>
  );
}
