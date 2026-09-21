import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/types";
import Badge from "@/shared/ui/Badge";
import { ShieldIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { env } from "@/lib/env";

const EMPTY_BRANDS: Brand[] = [];

// Bounds worst-case fetch latency, same convention as (store)/layout.tsx and
// shared/api/settings.ts — falls through to the empty-array fallback exactly
// like any other fetch failure.
const FETCH_TIMEOUT_MS = 5000;

async function getBrands(locale: string): Promise<Brand[]> {
  try {
    const res = await fetch(
      `${env.API_URL}${env.ENDPOINTS.BRANDS.BASE}?all_langs=false`,
      {
        next: { revalidate: 300 },
        headers: { "Content-Type": "application/json", "Accept-Language": locale },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    );

    if (!res.ok) return EMPTY_BRANDS;

    const json = await res.json();
    const data: Brand[] = json?.data || [];
    if (!Array.isArray(data)) return EMPTY_BRANDS;

    return data;
  } catch {
    return EMPTY_BRANDS;
  }
}

function getTrans(content: string | { en?: string; ar?: string; [key: string]: string | undefined } | undefined | null, locale: string): string {
  if (!content) return "-";
  if (typeof content === "string") return content;
  return content[locale] || content.en || content.ar || "";
}

interface TrustedByProps {
  locale: "ar" | "en";
  mode?: "text" | "image";
  duration?: string;
}

export default async function TrustedBy({
  locale,
  mode = "image",
  duration = "90s",
}: TrustedByProps) {
  const t = await getTranslations({ locale, namespace: "home" });
  const brands = await getBrands(locale);

  if (brands.length === 0) return null;

  // 6 groups instead of 7 (even number). Because the animation moves by 50%,
  // the even number ensures that the movement ends at the beginning of a
  // complete group, preventing interruption (Seamless Loop).
  const marqueeContent = Array.from({ length: 6 }, (_, index) => (
    <div
      key={index}
      className="flex gap-5 shrink-0 items-center"
      // Accessibility: hide repeated groups from screen readers
      aria-hidden={index > 0 ? "true" : "false"}
    >
      {brands.map((brand) => (
        <Link
          href={`/products?brand=${brand._id}#all-products`}
          key={brand._id}
          className="flex items-center justify-center min-w-30"
        >
          {mode === "image" && brand.image ? (
            <Image
              src={
                typeof brand.image === "string"
                  ? brand.image
                  : brand.image?.url
              }
              alt={getTrans(brand.name, locale)}
              width={200}
              height={200}
              className="h-20 object-contain max-w-37.5"
              loading="lazy"
            />
          ) : (
            <div className="px-8 py-5 rounded-2xl bg-card border border-border/40 shadow-2xs hover:border-primary/25 hover:shadow-md transition-all shrink-0 flex items-center justify-center min-w-40 h-20">
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-muted-foreground/80 hover:text-primary transition-colors">
                {getTrans(brand.name, locale)}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  ));

  return (
    <section className="py-16 sm:py-24  bg-background overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal
          animation="slide-up"
          className="flex flex-col items-center gap-8"
        >
          <Badge
            variant={"success"}
            className="p-1 px-4 rounded-full text-xs sm:text-sm md:text-md font-black   shrink-0 text-center hover:bg-success/10 hover:text-success "
          >
            <ShieldIcon className="w-5 h-5 text-success me-1" />
            {t("trust.approved_distributors")}
          </Badge>
          <div className="w-full relative flex overflow-hidden mask-image-fade">
            <div
              style={{ animationDuration: duration }}
              className="flex whitespace-nowrap animate-marquee items-center gap-5 hover:opacity-50 hover:grayscale grayscale-0 opacity-100 transition-all duration-500"
            >
              {marqueeContent}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
