"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Price } from "@/shared/ui/Price";
import {
  StarIcon,
  PackageIcon,
  ShoppingCartIcon,
  FileTextIcon,
  DownloadIcon,
} from "@/shared/ui/Icons";
import { Product } from "@/types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export interface ProductInfoProps {
  product: Product;
  title: string;
  description?: string;
  categoryName?: string;
  subCategoryName?: string;
  brandName?: string;
  unitLabel?: string;
  displayPrice: number;
  oldPrice?: number;
  hasDiscount: boolean;
  isOutOfStock: boolean;
  canOrder: boolean;
  isAddingToCart: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function ProductInfo({
  product,
  title,
  description,
  categoryName,
  subCategoryName,
  brandName,
  unitLabel,
  displayPrice,
  oldPrice,
  hasDiscount,
  isOutOfStock,
  canOrder,
  isAddingToCart,
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const t = useTranslations("product");
  const commonT = useTranslations("common");

  return (
    <div className="md:col-span-6 md:order-1 ps-3 relative">
      <div className="md:sticky md:top-28 space-y-5">
        {/* Tag Chips */}
        {(categoryName || subCategoryName || brandName) && (
          <ScrollReveal animation="slide-right" className="flex flex-wrap items-center gap-1">
            {categoryName && (
              <Badge variant="default" className="text-[9px] font-medium">
                {categoryName}
              </Badge>
            )}
            {subCategoryName && (
              <Badge variant="default" className="text-[9px] font-medium">
                {subCategoryName}
              </Badge>
            )}
            {brandName && (
              <Badge variant="default" className="text-[9px] font-medium">
                {brandName}
              </Badge>
            )}
          </ScrollReveal>
        )}

        {/* Header Info */}
        <div className="space-y-2">
          <ScrollReveal animation="slide-up">
            <h1 className="text-sm sm:text-md md:text-xl font-semibold tracking-tight title-gradient leading-tight">
              {title}
            </h1>
          </ScrollReveal>

          {/* Rating / Reviews / SKU */}
          {(Boolean(product.ratingsAverage) || Boolean(product.sku)) && (
            <ScrollReveal animation="slide-up" className="flex flex-wrap items-center gap-2.5 text-sm">
              {Boolean(product.ratingsAverage) && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center" dir="ltr">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(product.ratingsAverage ?? 0)
                            ? "text-warning fill-warning"
                            : "text-border fill-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-foreground">
                    {(product.ratingsAverage ?? 0).toFixed(1)}
                  </span>
                  {Boolean(product.ratingsQuantity) && (
                    <span className="text-muted-foreground">
                      {t("info.ratingsCount", {
                        count: product.ratingsQuantity ?? 0,
                      })}
                    </span>
                  )}
                </div>
              )}
              {Boolean(product.ratingsAverage) && Boolean(product.sku) && (
                <span className="text-border">|</span>
              )}
              {product.sku && (
                <span className="text-muted-foreground">
                  {t("info.sku")}:{" "}
                  <span dir="ltr" className="text-foreground font-medium">
                    {product.sku}
                  </span>
                </span>
              )}
            </ScrollReveal>
          )}
        </div>

        {description && (
          <ScrollReveal animation="slide-up">
            <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          </ScrollReveal>
        )}

        {/* Info Strip: Brand / Category / Sub-category */}
        {(brandName || categoryName || subCategoryName) && (
          <ScrollReveal  animation="slide-right" className="grid grid-cols-3 gap-4 py-3 border-b border-border/50">
            {brandName && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  {t("info.brand")}
                </p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {brandName}
                </p>
              </div>
            )}
            {categoryName && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  {t("info.category")}
                </p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {categoryName}
                </p>
              </div>
            )}
            {subCategoryName && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  {t("info.subCategory")}
                </p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {subCategoryName}
                </p>
              </div>
            )}
          </ScrollReveal>
        )}

        {/* Price */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {product.variantCount === 1 ? (
            <ScrollReveal animation="slide-up" className="flex items-baseline gap-2">
              <Price
                amount={displayPrice}
                className="text-xl sm:text-2xl font-bold text-primary tracking-tight"
              />

              {hasDiscount && Boolean(oldPrice) && (
                <Price
                  amount={oldPrice ?? 0}
                  className="text-base font-medium text-muted-foreground line-through"
                  currencyClassName="text-muted-foreground/60"
                />
              )}
              {unitLabel && (
                <span className="text-sm text-muted-foreground">
                  / {unitLabel}
                </span>
              )}
            </ScrollReveal>
          ) : (
            <ScrollReveal animation="slide-up" className="flex items-baseline gap-2">
              <span className="text-base text-muted-foreground">
                {t("info.startingFrom")}
              </span>
              <Price
                amount={product.priceRange?.min || displayPrice}
                className="text-xl font-semibold text-primary"
              />
              {unitLabel && (
                <span className="text-sm text-muted-foreground">
                  / {unitLabel}
                </span>
              )}
            </ScrollReveal>
          )}

          <ScrollReveal className="flex items-center gap-2" animation="slide-up" >
            <Badge
              variant={isOutOfStock ? "destructive" : "success"}
              className="rounded-full gap-1.5 px-3 py-1"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-destructive" : "bg-success"}`}
              />
              {isOutOfStock ? t("badges.outOfStock") : t("badges.inStock")}
            </Badge>
            {!isOutOfStock && (
              <Badge
                variant="info"
                className="rounded-full gap-1.5 px-3 py-1"
              >
                <PackageIcon className="w-3 h-3" />
                {t("badges.readyToShip")}
              </Badge>
            )}
          </ScrollReveal>
        </div>

        {/* Single variant Quick Actions */}
        {product.variantCount === 1 && (
          <ScrollReveal animation="fade" className="space-y-2.5 pt-1">
            <Button
              onClick={onAddToCart}
              disabled={!canOrder}
              isLoading={isAddingToCart}
              className="w-full gap-2"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              {isOutOfStock
                ? commonT("buttons.out_of_stock")
                : commonT("buttons.add_to_cart")}
            </Button>
            <Button
              onClick={onBuyNow}
              disabled={!canOrder}
              isLoading={isAddingToCart}
              variant={"outline2"}
              className="w-full bg-background border border-primary/30 text-primary"
            >
              {t("actions.buyNow")}
            </Button>
          </ScrollReveal>
        )}

        {/* Technical Documentation PDF */}
        {product.infoProductPdf?.url && (
          <ScrollReveal animation="fade" delay={500} className="pt-1 space-y-2.5">
            <h3 className="font-bold text-base title-gradient">
              {t("documentation.title")}
            </h3>
            <a
              href={product.infoProductPdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-border hover:border-primary/40 hover:bg-secondary/20 transition-colors group/doc"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <FileTextIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {t("documentation.pdfLabel")}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t("documentation.pdfDesc")}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground group-hover/doc:text-primary transition-colors shrink-0">
                <DownloadIcon className="w-4 h-4" />
              </div>
            </a>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
