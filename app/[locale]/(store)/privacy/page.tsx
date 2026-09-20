import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  DatabaseIcon,
  TargetIcon,
  LockIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  ScaleIcon,
  HeartIcon,
  RefreshCwIcon,
  MailIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
} from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { getStoreSettings } from "@/shared/api/settings";
import { getImageUrl } from "@/shared/utils/image.util";
import { generatePageMetadata } from "@/lib/seo";
import { env } from "@/lib/env";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const settings = await getStoreSettings();

  return generatePageMetadata({
    locale,
    namespace: "privacy",
    canonicalPath: "/privacy",
    siteName: settings?.siteName?.[locale as "ar" | "en"],
    siteLogoUrl: getImageUrl(settings?.logo) || undefined,
  });
}

interface PrivacySection {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
}

// Icons are matched to section ids from messages/privacy/*.json — keep both in sync.
const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  collect: DatabaseIcon,
  use: TargetIcon,
  confidentiality: LockIcon,
  security: ShieldCheckIcon,
  cookies: SlidersHorizontalIcon,
  sharing: UsersIcon,
  rights: ScaleIcon,
  children: HeartIcon,
  changes: RefreshCwIcon,
};

const LAST_UPDATED = new Date("2026-09-20T00:00:00Z");

export default async function PrivacyPage({ params }: Props) {
  const { locale } = (await params) as { locale: "ar" | "en" };
  const t = await getTranslations({ locale, namespace: "privacy" });
  const settings = await getStoreSettings();
  const siteName = settings?.siteName?.[locale];
  const email = settings?.contactInfo?.email || "hello@skygalaxy.com";

  const sections = t.raw("sections") as PrivacySection[];
  const lastUpdatedLabel = t("hero.lastUpdated", {
    date: new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(LAST_UPDATED),
  });

  // Structured data so search engines can surface this as the site's canonical privacy page.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("meta.title"),
    description: t("meta.description"),
    url: `${env.APP_URL}/${locale}/privacy`,
    dateModified: LAST_UPDATED.toISOString(),
    isPartOf: {
      "@type": "WebSite",
      name: siteName || "Sky Galaxy",
      url: env.APP_URL,
    },
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background text-foreground transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <div className="relative mb-14 overflow-hidden py-16 lg:py-20 text-center">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <ScrollReveal
          animation="slide-up"
          className="max-w-3xl mx-auto px-4 relative z-10 space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black title-gradient mb-2 leading-tight tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="text-base sm:text-lg text-foreground max-w-xl mx-auto font-medium leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-2">
            <ClockIcon className="w-3.5 h-3.5" />
            {lastUpdatedLabel}
          </p>
        </ScrollReveal>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-10">
        {/* Table of contents */}
        <ScrollReveal animation="fade">
          <Card className="border-border/60 bg-card rounded-2xl p-5">
            <h2 className="text-sm font-bold title-gradient mb-3">
              {t("toc.title")}
            </h2>
            <nav className="flex flex-wrap gap-2" aria-label={t("toc.title")}>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </Card>
        </ScrollReveal>

        {/* Policy sections — native <details> keeps this fully server-rendered
            (no client JS) while still giving an accordion interaction. */}
        <div className="space-y-4">
          {sections.map((section, index) => {
            const Icon = SECTION_ICONS[section.id] ?? ShieldCheckIcon;
            return (
              <ScrollReveal
                key={section.id}
                animation="slide-up"
                delay={Math.min(index, 4) * 60}
              >
                <details
                  id={section.id}
                  className="group border border-border/60 bg-card rounded-2xl overflow-hidden scroll-mt-28"
                  open={index === 0}
                >
                  <summary className="p-4 sm:p-5 flex items-center gap-4 cursor-pointer bg-accent/50 select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="p-2.5 rounded-xl shrink-0 bg-primary/10 text-primary border border-primary/25">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="flex-1 font-bold text-sm sm:text-base title-gradient">
                      {section.title}
                    </span>
                    <PlusIcon className="w-4 h-4 text-muted-foreground shrink-0 group-open:hidden" />
                    <MinusIcon className="w-4 h-4 text-primary shrink-0 hidden group-open:block" />
                  </summary>
                  <div className="px-4 sm:px-5 pb-5 sm:pb-6 ps-16 sm:ps-19 space-y-3">
                    {section.paragraphs.map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-sm text-muted-foreground leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {!!section.list?.length && (
                      <ul className="space-y-2 pt-1">
                        {section.list.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Contact CTA */}
        <ScrollReveal animation="slide-up">
          <Card className="border-border/60 bg-card rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/25 mx-auto">
              <MailIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold title-gradient">
                {t("contact.title")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {t("contact.description")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button asChild className="rounded-xl font-semibold">
                <a href={`mailto:${email}`}>{t("contact.emailCta")}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl font-semibold"
              >
                <Link href="/contact">{t("contact.contactCta")}</Link>
              </Button>
            </div>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
