"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Icons } from "@/shared/ui/Icons";
import Badge from "@/shared/ui/Badge";

export default function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative `min-h-screenflex items-center pb-20 bg-background text-foreground">
      {/* Video Background — preload=none delays the 6.7 MB download until autoplay starts */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster="/assets/images/hero-poster.webp"
        className="absolute inset-0 z-0 w-full h-full object-cover"
      >
        <source src="/assets/video/banner-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-1 bg-linear-to-b from-background/70 via-primary/10 to-background/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-48 lg:mt-36">
        <div className="grid grid-cols-1 gap-12 items-center">
          <div className="space-y-8 text-center">
            <Badge
              variant="outline"
              className="tracking-widest inline-flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-white/80 text-xs font-black tracking-widest uppercase">
                {t("hero.badge_text")}
              </span>
            </Badge>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-lg">
                {t("brand.name")}
                <br />
                <span className="title-gradient max-w-2xl m-auto mt-2 block pb-2">
                  {t("brand.tagline")}
                </span>
              </h1>
              <p className="max-w-xl text-lg md:text-xl text-foreground/50 font-medium leading-relaxed mt-2 mx-auto">
                {t("hero.description")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              <Link href="/products" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-primary/80 hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 border-none font-black text-lg gap-3 transition-transform hover:scale-105">
                  {t("hero.cta_shop")}
                  <Icons.ShoppingCart className="w-6 h-6 rtl:ml-2" />
                </Button>
              </Link>
              <Link
                href="/assets/sky-galaxy-company-profile.pdf"
                target="_blank"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-16 px-10 text-white transition-all hover:scale-105 hover:text-white hover:bg-white/10 font-black text-lg gap-2 duration-500"
                >
                  {t("hero.cta_download_catalog")}
                  <Icons.Download className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
              {[
                { text: t("hero.trust_badges.certified"), icon: Icons.Check },
                { text: t("hero.trust_badges.delivery"), icon: Icons.Box },
                { text: t("hero.trust_badges.warranty"), icon: Icons.Shield },
              ].map((badge, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md"
                >
                  <badge.icon className="w-5 h-5 text-warning" />
                  <span className="text-sm font-black tracking-wide">
                    {badge.text}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
