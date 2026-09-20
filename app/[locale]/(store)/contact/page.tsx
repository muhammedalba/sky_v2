import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ExternalLinkIcon,
} from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { getStoreSettings } from "@/shared/api/settings";
import { getImageUrl } from "@/shared/utils/image.util";
import { generatePageMetadata } from "@/lib/seo";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import ContactClient from "./ContactClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const settings = await getStoreSettings();

  return generatePageMetadata({
    locale,
    namespace: "contact",
    canonicalPath: "/contact",
    siteName: settings?.siteName?.[locale as "ar" | "en"],
    siteLogoUrl: getImageUrl(settings?.logo) || undefined,
  });
}

interface ContactInfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  title: string;
  children: React.ReactNode;
}

function ContactInfoCard({
  icon: Icon,
  iconClassName,
  title,
  children,
}: ContactInfoCardProps) {
  return (
    <Card className="p-5 border-border/60 bg-card rounded-2xl hover:border-primary/20 transition-all flex items-start gap-4">
      <div className={cn("p-2.5 rounded-xl shrink-0", iconClassName)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-bold text-sm mb-0.5 title-gradient">{title}</h3>
        {children}
      </div>
    </Card>
  );
}

export default async function ContactPage({ params }: Props) {
  const { locale } = (await params) as { locale: "ar" | "en" };
  const t = await getTranslations({ locale, namespace: "contact" });
  const settings = await getStoreSettings();
  const contactInfo = settings?.contactInfo;

  const email = contactInfo?.email || "hello@skygalaxy.com";
  const phone = contactInfo?.phones?.[0] || "+1 (555) 000-0000";
  const businessAddress = settings?.businessAddress;
  const addressParts = businessAddress
    ? [
        businessAddress.street?.[locale],
        businessAddress.area?.[locale],
        businessAddress.city?.[locale],
        businessAddress.country?.[locale],
      ].filter(Boolean)
    : [];
  const officeAddress =
    addressParts.length > 0
      ? addressParts.join(", ")
      : t("info.officeFallback");
  const workingDays =
    contactInfo?.workingDays?.[locale] || t("info.workingDaysFallback");
  const workingHours =
    contactInfo?.workingHours?.[locale] || "09:00 AM - 06:00 PM";
  const siteName = settings?.siteName?.[locale];

  const mapQuery = [siteName, officeAddress].filter(Boolean).join(", ");
  const mapsApiKey = settings?.googleMapsApiKey;
  const mapEmbedSrc = mapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(mapQuery)}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  // Structured data: ContactPage + Organization contactPoint, built from
  // real DB-driven settings so it stays correct as the office/phone/email change.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("meta.title"),
    url: `${env.APP_URL}/${locale}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: siteName || "Sky Galaxy",
      email,
      address: {
        "@type": "PostalAddress",
        streetAddress: businessAddress?.street?.[locale] || undefined,
        addressLocality: businessAddress?.city?.[locale] || undefined,
        addressRegion: businessAddress?.area?.[locale] || undefined,
        addressCountry: businessAddress?.country?.[locale] || undefined,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: phone,
        email,
        contactType: "customer service",
        areaServed: "SA",
        availableLanguage: ["ar", "en"],
      },
    },
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background text-foreground transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Premium Hero Title Section */}
      <div className="relative mb-16 overflow-hidden py-16 lg:py-20 text-center">
        <Image
          src="/assets/images/hero-poster.webp"
          alt={t("title")}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-50"
        />
        <div className="absolute right-0 top-0 h-full w-full bg-background/40  pointer-events-none" />
        <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <ScrollReveal
          animation="slide-up"
          className="max-w-4xl mx-auto px-4 relative z-10 space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black title-gradient mb-4 leading-tight tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-foreground max-w-xl mx-auto font-medium leading-relaxed">
            {t("subtitle")}
          </p>
        </ScrollReveal>
      </div>
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Info Panel (lg:col-span-4) */}
          <address className="lg:col-span-4 space-y-5 not-italic">
            {[
              {
                icon: MailIcon,
                iconClassName:
                  "bg-primary/10 text-primary border border-primary/25",
                title: t("info.email"),
                content: (
                  <>
                    <a
                      href={`mailto:${email}`}
                      className="text-xs text-muted-foreground/80 font-medium break-all hover:text-primary transition-colors"
                    >
                      {email}
                    </a>
                    <br />
                    <a
                      href={`mailto:${email}`}
                      className="text-[11px] text-primary font-semibold mt-1 hover:underline cursor-pointer"
                    >
                      {t("info.emailCta")} &rarr;
                    </a>
                  </>
                ),
              },
              {
                icon: PhoneIcon,
                iconClassName: "bg-destructive/10 text-destructive",
                title: t("info.phone"),
                content: (
                  <>
                    <a
                      href={`tel:${phone}`}
                      className="text-xs text-muted-foreground/80 font-medium hover:text-primary transition-colors"
                    >
                      {phone}
                    </a>
                    <p className="text-[11px] text-primary font-semibold mt-1">
                      {t("info.available")}
                    </p>
                  </>
                ),
              },
              {
                icon: MapPinIcon,
                iconClassName:
                  "bg-warning/10 text-warning border border-warning/25",
                title: t("info.office"),
                content: (
                  <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                    {officeAddress}
                  </p>
                ),
              },
              {
                icon: ClockIcon,
                iconClassName:
                  "bg-success/10 text-success border border-success/25",
                title: t("info.hoursTitle"),
                content: (
                  <>
                    <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                      {workingDays}
                    </p>
                    <p className="text-[11px] text-success font-semibold mt-1">
                      {workingHours}
                    </p>
                  </>
                ),
              },
            ].map((item, index) => (
              <ScrollReveal key={index} animation="slide-up" delay={0.1 * index}>
                <ContactInfoCard
                  icon={item.icon}
                  iconClassName={item.iconClassName}
                  title={item.title}
                >
                  {item.content}
                </ContactInfoCard>
              </ScrollReveal>
            ))}
          </address>

          {/* Right Form Card (lg:col-span-8) — interactive island */}
          <div className="lg:col-span-8">
            <ContactClient />
          </div>
        </div>
      </div>
      {/* Map Section */}
      <ScrollReveal
        animation="slide-up"
        className="mt-7 mx-3 lg:mx-5"
        duration={600}
      >
        <div className="space-y-5">
          <Card className="border-border/60 bg-card rounded-3xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 pb-4 sm:pb-6 bg-accent/50">
              <div className="min-w-0">
                <h2 className="text-lg font-bold title-gradient">
                  {t("map.title")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("map.subtitle")}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-10 px-4 rounded-xl font-semibold shrink-0 self-start sm:self-auto"
              >
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                  {t("map.directions")}
                </a>
              </Button>
            </div>
            <div className="w-full h-80 sm:h-105 bg-muted/30 border-t border-border/40">
              <iframe
                title={t("map.title")}
                src={mapEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Card>
        </div>
      </ScrollReveal>
    </div>
  );
}
