"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Product } from "@/types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import SimilarProductCard from "@/components/SimilarProductCard";

interface SimilarProductsProps {
  product: Product;
}

export default function SimilarProducts({ product }: SimilarProductsProps) {
  const t = useTranslations("product");
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
    <ScrollReveal
      animation="slide-up"
      className="mt-14 bg-background w-full p-7"
    >
      <h2 className="text-2xl sm:text-3xl font-black text-center title-gradient mb-8">
        {t("similar.title")}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {relatedProducts.map((item, i) => (
          <ScrollReveal key={item._id} animation="fade" delay={i * 100}>
            <SimilarProductCard key={item._id} item={item} />
          </ScrollReveal>
        ))}
      </div>
    </ScrollReveal>
  );
}
