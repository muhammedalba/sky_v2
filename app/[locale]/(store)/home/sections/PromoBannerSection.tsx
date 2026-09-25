import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/navigation";
import { Button } from "@/shared/ui/Button";
import { DownloadIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export default async function PromoBannerSection({
  locale,
}: {
  locale: "ar" | "en";
}) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    // dir="ltr": the background artwork (mobile.webp / Desktop.webp) has a fixed
    // dark-to-light gradient baked in from left to right, so the layout stays
    // physically left/right regardless of locale instead of mirroring for RTL.
    <section dir="ltr" className="p-7 ">
      <div className="relative rounded-lg overflow-hidden bg-[#c9dbf5] bg-[url('/assets/images/mobile.webp')] md:bg-[url('/assets/images/Desktop.webp')] bg-cover bg-top md:bg-center bg-no-repeat max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20 md:py-28 flex flex-col md:flex-row md:items-center gap-12 md:gap-10">
        <ScrollReveal
          delay={100}
          animation="slide-right"
          className="w-full md:w-1/2 text-left space-y-6 text-white"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {t("promo.title")}
          </h2>
          <p className="text-base md:text-lg text-white/80 font-medium max-w-md">
            {t("promo.description")}
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <Link href="/request-quote">
              <Button className="h-14 px-8 rounded-xl bg-linear-to-b from-blue-500 to-blue-600 hover:brightness-110 text-white font-bold text-base shadow-xl shadow-blue-950/30">
                {t("promo.cta_quote")}
              </Button>
            </Link>
            {/* Static file, not a route — plain <a> (no locale prefix, no RSC prefetch) */}
            <a
              href="/assets/sky-galaxy-company-profile.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold underline-offset-4 hover:underline"
            >
              {t("promo.cta_catalog")}
              <DownloadIcon className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal
          delay={300}
          animation="slide-left"
          className="w-full md:w-1/2 flex justify-center md:justify-end"
        >
          <div className="relative w-full max-w-sm md:max-w-none aspect-4/3 rounded-[1.75rem] overflow-hidden shadow-2xl">
            <Image
              src="/assets/images/wholesale-building.webp"
              alt={t("promo.title")}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 45vw, 90vw"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
