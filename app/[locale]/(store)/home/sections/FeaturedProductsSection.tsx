import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { ChevronRightIcon } from "@/shared/ui/Icons";
import { Product } from "@/types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import Badge from "@/shared/ui/Badge";
import SimilarProductCard from "@/components/SimilarProductCard";
import { env } from "@/lib/env";

// Bounds worst-case fetch latency, same convention as (store)/layout.tsx,
// TrustedBy.tsx and CategoriesSection.tsx — falls through to the
// empty-array fallback exactly like any other fetch failure.
const FETCH_TIMEOUT_MS = 5000;

async function getFeaturedProducts(locale: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${env.API_URL}${env.ENDPOINTS.PRODUCTS.BASE}?limit=4&isFeatured=true`,
      {
        // matches useProducts()'s own staleTime comment: revalidate 60
        next: { revalidate: 60, tags: ["products"] },
        headers: { "Content-Type": "application/json", "Accept-Language": locale },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    );

    if (!res.ok) return [];

    const json = await res.json();
    const data: Product[] = json?.data || [];
    if (!Array.isArray(data)) return [];

    return data;
  } catch {
    return [];
  }
}

export default async function FeaturedProductsSection({
  locale,
}: {
  locale: "ar" | "en";
}) {
  const t = await getTranslations({ locale, namespace: "home" });
  const products = await getFeaturedProducts(locale);

  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-muted/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="slide-up">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-16">
            <div className="space-y-4 w-full">
              <Badge variant="success" className="px-3 py-1 text-xs font-black tracking-widest uppercase">
                {t("customer_favorite.featured")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black title-gradient tracking-tight">
                {t("customer_favorite.title")}
              </h2>
               <div className="w-24 h-0.5 bg-primary/80 rounded-full mt-2.5 me-auto" />
              <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                {t("customer_favorite.description")}
              </p>
            </div>

            <Link href="/products" className="shrink-0">
              <Button
                variant="outline"
                className="h-12 px-8 rounded-xl font-black gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
              >
                {t("customer_favorite.view_all")}
                <ChevronRightIcon className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item: Product, i: number) => (
            <ScrollReveal
              key={item._id || item.sku}
              animation="slide-up"
              delay={i * 100}
            >
              <SimilarProductCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
