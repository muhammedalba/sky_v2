"use client";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import {
  EyeIcon,
  HeartIcon,
  PackageIcon,
  ShoppingCartIcon,
  StarIcon,
} from "@/shared/ui/Icons";
import { Card } from "@/shared/ui/Card";
import { Product } from "@/types";
import { truncate } from "@/lib/utils";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import Badge from "@/shared/ui/Badge";
import { Tooltip } from "@/shared/ui/Tooltip";
import { ArrowLeftIcon } from "lucide-react";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { useTrans } from "@/shared/hooks/useTrans";
import { memo, useMemo, useCallback } from "react";

interface Props {
  item: Product;
  t: (key: string) => string;
}

// 1. إخراج الثوابت خارج المكون لتجنب إعادة إنشائها في الذاكرة
const STARS_ARRAY = [1, 2, 3, 4, 5];

const ProductCard = ({ item, t }: Props) => {
  const getTrans = useTrans();
  const formatCurrency = useFormatCurrency();

  // 2. تجميع منطق الماركي والمصفوفة في useMemo واحد وتقليل الـ overhead
  const marqueeContent = useMemo(() => {
    // تجهيز المصفوفة مباشرة
    const uses = Array.isArray(item.uses) 
      ? item.uses 
      : item.uses ? [item.uses] : [];

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
            <Badge variant={"secondary"}>
              <span className="uppercase tracking-widest text-muted-foreground/80 hover:text-primary transition-colors">
                {text}
              </span>
            </Badge>
          </div>
        ))}
      </div>
    ));
  }, [item.uses]);

  // 3. تجهيز اسم التصنيف مسبقاً لتنظيف الـ JSX ومنع العمليات المنطقية داخله
  const categoryName = useMemo(() => {
    if (typeof item.category === "object" && item.category && "name" in item.category) {
      return getTrans(item.category.name);
    }
    return "";
  }, [item.category, getTrans]);

  // 4. استخدام useCallback لمنع إعادة إنشاء دالة الحدث
  const handleWishlistClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Logic for wishlist here
  }, []);

  return (
    <Card className="group flex flex-col bg-accent/40 hover:shadow-xl transition-all duration-500 rounded-4xl overflow-hidden border-border/50 h-full relative hover:scale-[1.01]">
      <div className="aspect-square relative overflow-hidden flex items-center justify-center">
        <div
          dir={"ltr"}
          className="absolute top-4 inset-s-4 z-30 flex flex-col gap-2 md:-translate-x-24 md:group-hover:translate-x-4 transition-all duration-300"
        >
          <button
            type="button"
            onClick={handleWishlistClick}
            title="add to wishlist"
            aria-label="add to wishlist"
            className="cursor-pointer border border-border/50 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-primary/70 hover:text-primary-foreground transition-colors duration-300"
          >
            <Tooltip position="inset" content={t("common.add_to_wishlist")}>
              <HeartIcon className="w-4 h-4" />
            </Tooltip>
          </button>
          <Link
            href={`/products/${item.sku}`}
            title="quick view"
            aria-label="quick view"
            className="cursor-pointer border border-border/50 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-primary/70 hover:text-primary-foreground transition-colors duration-300"
          >
            <Tooltip position="inset" content={t("common.quick_view")}>
              <EyeIcon className="w-5 h-5" />
            </Tooltip>
          </Link>
        </div>

        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Badge
            variant={"warning"}
            className="text-[10px] bg-warning text-warning-foreground font-black tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm"
          >
            {item.isFeatured ? t("customer_favorite.featured") : " "}
          </Badge>
        </div>

        {item.imageCover ? (
          <ImageWithFallback
            src={item.imageCover}
            alt={getTrans(item.title)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain group-hover:scale-110 transition-transform duration-500 "
            loading="lazy"
          />
        ) : (
          <PackageIcon className="w-24 h-24 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
        )}
      </div>
      
      {/* product details */}
      <div className=" flex flex-col grow justify-between">
        <div className="w-full px-6 flex-1 bg-background flex-col flex justify-between">
          {/* category badges */}
          <div className="border-b border-border/40 flex flex-wrap items-center pb-3 gap-2">
            <Badge
              variant="default"
              className="text-xs mt-3 bg-primary/5 text-primary/70 uppercase tracking-wider w-fit"
            >
              {categoryName}
            </Badge>
          </div>
          
          {/* product title */}
          <h3 className="text-lg font-semibold text-foreground/90 my-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
            {truncate(getTrans(item.title), 30)}
          </h3>

          <p className="text-sm font-normal text-foreground/60 mb-3">
            {truncate(getTrans(item.description), 50)}
          </p>

          {marqueeContent && (
            <div className="w-full relative flex overflow-hidden mask-image-fade my-2">
              <div className="flex whitespace-nowrap animate-marquee items-center gap-5 hover:opacity-50 hover:grayscale grayscale-0 opacity-100 transition-all duration-500">
                {marqueeContent}
              </div>
            </div>
          )}
        </div>
        
        {/* footer */}
        <div className="w-full p-6 pt-0 bg-accent/70">
          {/* price and rating */}
          <div className="border-t border-border/40 pt-4 flex items-end justify-between">
            <div className="text-md font-black text-primary tracking-tight">
              {formatCurrency(item.priceRange?.min || 0)}
            </div>
            
            {/* star rating */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-0.5">
                {/* تم استخدام المصفوفة الثابتة هنا */}
                {STARS_ARRAY.map((starIndex) => (
                  <StarIcon
                    key={starIndex}
                    className={`w-3 h-3 ${
                      starIndex <= Math.round(item.ratingsAverage || 0)
                        ? "text-amber-400"
                        : "text-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">
                {item.ratingsQuantity ? `${item.ratingsQuantity} reviews` : "0 reviews"}
              </span>
            </div>
          </div>
          
          {/* buy button */}
          <div className="pt-4 flex items-center justify-between gap-2">
            <Link
              href={`/products/${item.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-primary hover:scale-105 group-hover:gap-2.5 transition-all"
            >
              {t("common.details")}
              <ArrowLeftIcon size={16} />
            </Link>
            <span className="block w-full">
              <Button
                variant={"default"}
                size="sm"
                className="w-full hover:bg-background/80 hover:text-primary font-black hover:border-primary border border-border shadow-sm hover:shadow-lg"
              >
                <ShoppingCartIcon className="w-4 h-4" />
                {t("common.add_to_cart")}
              </Button>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// 5. استخدام Custom Compare function لضمان عمل الـ memo بكفاءة عالية
// حتى لو تغيرت مرجعية دالة الـ t أو بعض الـ props الأب التي لا تهم المكون
export default memo(ProductCard, (prevProps, nextProps) => {
  return prevProps.item.slug === nextProps.item.slug; // Assuming slug is a unique identifier for the product
});