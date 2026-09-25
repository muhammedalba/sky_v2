import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { ArrowRightIcon } from "@/shared/ui/Icons";
import { Category, LocalizedString } from "@/types";

import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/shared/utils/image.util";
import { env } from "@/lib/env";

// Bounds worst-case fetch latency, same convention as (store)/layout.tsx and
// TrustedBy.tsx — falls through to the empty-array fallback exactly like any
// other fetch failure.
const FETCH_TIMEOUT_MS = 5000;

async function getHomeCategories(locale: string): Promise<Category[]> {
  try {
    // limit=20 here matches (store)/layout.tsx's own categories fetch
    // (used for the navbar) byte-for-byte on purpose: Next.js's Data Cache
    // keys fetch() calls by their exact URL, so an identical URL means this
    // request reuses that same cache entry instead of firing a second,
    // separate network request for the same resource. Only the first 7
    // items are actually rendered below (unchanged from before), so this
    // is a pure cache-sharing optimization with zero visible effect.
    const res = await fetch(
      `${env.API_URL}${env.ENDPOINTS.CATEGORIES.BASE}?limit=20`,
      {
        next: { revalidate: 300 },
        headers: { "Content-Type": "application/json", "Accept-Language": locale },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    );

    if (!res.ok) return [];

    const json = await res.json();
    const data: Category[] = json?.data || [];
    if (!Array.isArray(data)) return [];

    return data;
  } catch {
    return [];
  }
}

function getTrans(content: LocalizedString | undefined | null, locale: string): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content[locale as "en" | "ar"] || content.en || content.ar || "";
}

export default async function CategoriesSection({
  locale,
}: {
  locale: "ar" | "en";
}) {
  const t = await getTranslations({ locale, namespace: "home" });
  const categories = await getHomeCategories(locale);

  if (categories.length === 0) return null;

  const hero = categories[0];
  const secondary = categories.slice(1, 3);
  const rest = categories.slice(3, 7);

  return (
    <section className="py-7 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal animation="fade" delay={100}>
          <h2 className="text-4xl md:text-5xl font-black title-gradient text-center mb-4 md:mb-6">
            {t("categories.title")}
          </h2>
        </ScrollReveal>
        <ScrollReveal animation="fade" delay={100}>
          <h2 className="text-lg  text-muted-foreground/80 text-center mb-12 md:mb-16">
            {t("categories.description")}
          </h2>
        </ScrollReveal>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Hero Category */}
          <ScrollReveal animation="slide-up" className="sm:col-span-2">
            <Link
              href={`/products?category=${hero._id}#all-products`}
              className="group block h-full"
            >
              <div className="relative h-full min-h-72 rounded-3xl bg-primary/5 border border-primary/10 overflow-hidden flex flex-col-reverse sm:flex-row items-stretch transition-colors duration-500 group-hover:bg-primary/10">
                <div className="relative z-10 flex-1 flex flex-col justify-center p-6 sm:p-8 md:p-10">
                  <span className="inline-block w-fit bg-background/80 text-muted-foreground text-xs font-bold tracking-wide uppercase px-3 py-1.5 rounded-md mb-4 shadow-sm">
                    {t("categories.new_product")}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-primary mb-3 line-clamp-1">
                    {getTrans(hero.name, locale)}
                  </h3>
                  <p className="text-muted-foreground font-medium mb-6 max-w-xs line-clamp-2">
                    {t("categories.items.waterproofing.desc")}
                  </p>
                  <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-background text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <ArrowRightIcon className="w-5 h-5 rtl:rotate-180" />
                  </span>
                </div>
                <div className="relative w-full h-40 sm:h-auto sm:w-2/5">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${getImageUrl(hero.image)})` }}
                  />
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Secondary Categories (overlay style) */}
          {secondary.map((cat: Category, i: number) => (
            <ScrollReveal
              key={cat._id}
              animation="slide-up"
              delay={150 + i * 100}
            >
              <Link
                href={`/products?category=${cat._id}#all-products`}
                className="group block h-full"
              >
                <div className="relative h-full min-h-72 rounded-3xl overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${getImageUrl(cat.image)})` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-1.5 line-clamp-1">
                      {getTrans(cat.name, locale)}
                    </h3>
                    <p className="text-white/75 text-sm font-medium mb-3 line-clamp-2">
                      {t("categories.items.waterproofing.desc")}
                    </p>
                    <ArrowRightIcon className="w-5 h-5 text-white rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* Remaining Categories (image on top, content below) */}
        {rest.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {rest.map((cat: Category, i: number) => (
              <ScrollReveal
                key={cat._id}
                animation="slide-up"
                delay={300 + i * 100}
              >
                <Link
                  href={`/products?category=${cat._id}#all-products`}
                  className="group block h-full"
                >
                  <div className="h-full flex flex-col rounded-3xl overflow-hidden bg-secondary/40 border border-border/50 hover:shadow-lg transition-shadow duration-300">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${getImageUrl(cat.image)})` }}
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-primary mb-1.5 line-clamp-1">
                        {getTrans(cat.name, locale)}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium mb-3 line-clamp-2 flex-1">
                        {t("categories.items.waterproofing.desc")}
                      </p>
                      <ArrowRightIcon className="w-5 h-5 text-primary rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* View All */}
        <ScrollReveal animation="fade" delay={200}>
          <div className="flex justify-center">
            <Link
              href="/products"
              className={cn(
                "inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all duration-300"
              )}
            >
              {t("categories.view_all")}
              <ArrowRightIcon className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
