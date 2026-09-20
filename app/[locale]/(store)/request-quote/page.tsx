import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Card } from "@/shared/ui/Card";
import {
  ActivityIcon,
  BoxIcon,
  CheckIcon,
  ShieldIcon,
  TagIcon,
  TrendingUpIcon,
  ClockIcon,
} from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { getStoreSettings } from "@/shared/api/settings";
import { getImageUrl } from "@/shared/utils/image.util";
import { generatePageMetadata } from "@/lib/seo";
import { env } from "@/lib/env";
import QuoteFormClient from "./QuoteFormClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const settings = await getStoreSettings();

  return generatePageMetadata({
    locale,
    namespace: "quote",
    canonicalPath: "/request-quote",
    siteName: settings?.siteName?.[locale as "ar" | "en"],
    siteLogoUrl: getImageUrl(settings?.logo) || undefined,
  });
}

export default async function RequestQuotePage({ params }: Props) {
  const { locale } = (await params) as { locale: "ar" | "en" };
  const t = await getTranslations({ locale, namespace: "quote" });
  const settings = await getStoreSettings();
  const siteName = settings?.siteName?.[locale];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("meta.title"),
    url: `${env.APP_URL}/${locale}/request-quote`,
    about: {
      "@type": "Service",
      name: t("title"),
      provider: {
        "@type": "Organization",
        name: siteName || "Sky Galaxy",
      },
      areaServed: "SA",
    },
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-32 pb-24 bg-background selection:bg-primary/20 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section with Ambient Backdrop */}
      <section className="relative overflow-hidden border-b border-border/40 py-16 sm:py-20 lg:py-24">
        {/* Background Ambient Glows & Image */}
        <div className="absolute inset-0  pointer-events-none ">
          <Image
            src="/assets/images/hero-poster.webp"
            alt= {t("title")}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40 "
          />
          
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal animation="slide-up">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide shadow-xs">
                <TagIcon className="w-3.5 h-3.5" />
                <span>{t("info.competitive_prices")}</span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black title-gradient tracking-tight leading-tight">
                {t("title")}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto">
                {t("subtitle")}
              </p>

              {/* Quick Trust Highlights */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 border border-border/50">
                  <ClockIcon className="w-3.5 h-3.5 text-primary" />
                  {t("hero.badge1")}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 border border-border/50">
                  <ShieldIcon className="w-3.5 h-3.5 text-primary" />
                  {t("hero.badge2")}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 border border-border/50">
                  <BoxIcon className="w-3.5 h-3.5 text-primary" />
                  {t("hero.badge3")}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Side Info Cards */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <ScrollReveal animation="slide-right">
              <div className="space-y-4">
                {[
                  {
                    icon: ActivityIcon,
                    title: t("info.fast_response"),
                    desc: t("info.fast_response_desc"),
                    badgeClass:
                      "bg-blue-500/10 text-primary border-primary/40",
                  },
                  {
                    icon: ShieldIcon,
                    title: t("info.technical_support"),
                    desc: t("info.technical_support_desc"),
                    badgeClass:
                      "bg-success/10 text-success border-success/40",
                  },
                  {
                    icon: TrendingUpIcon,
                    title: t("info.competitive_prices"),
                    desc: t("info.competitive_prices_desc"),
                    badgeClass:
                      "bg-warning/10 text-warning border-warning/40",
                  },
                ].map((item, i) => (
                  <Card
                    key={i}
                    className="p-5 sm:p-6 border-border/60 bg-card/80 backdrop-blur-md rounded-2xl shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${item.badgeClass}`}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-foreground/70 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Prestige Trust Card */}
              <Card className="mt-6 p-7 rounded-3xl border border-primary/20 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <BoxIcon className="absolute -right-8 -bottom-8 w-36 h-36 text-white/5 rotate-12 transition-transform duration-500 group-hover:rotate-45" />

                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-widest text-primary">
                    Sky Galaxy Industrial
                  </div>
                  <h4 className="text-xl font-black tracking-tight text-white">
                    {t("prestige.tagline")}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic">
                    &ldquo;{t("prestige.quote")}&rdquo;
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs text-white/70">
                    <span className="font-semibold">
                      {t("prestige.certifiedLabel")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary font-bold">
                      <CheckIcon className="w-4 h-4" /> ISO Standards
                    </span>
                  </div>
                </div>
              </Card>

              {/* Direct Assistance Card */}
              <div className="mt-4 p-4 rounded-2xl bg-secondary/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                  ℹ
                </div>
                <p className="leading-normal">{t("assistance.text")}</p>
              </div>
            </ScrollReveal>
          </aside>

          {/* Form Area — interactive island */}
          <main className="lg:col-span-8">
            <ScrollReveal animation="slide-left" delay={150}>
              <QuoteFormClient />
            </ScrollReveal>
          </main>
        </div>
      </div>
    </div>
  );
}
