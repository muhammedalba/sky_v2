"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { ActivityIcon, BoxIcon, DownloadIcon, FileTextIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";



export default function PromoBannerSection() {
  const t = useTranslations("home");

  return (
    <section className="py-24 bg-accent/30  relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={100} animation="slide-up">
          <div className="relative rounded-[3rem] bg-foreground/80 text-background overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent" />
            <BoxIcon className="absolute -left-20 -top-20 w-100 h-100 text-background/5 -rotate-12 pointer-events-none" />

            <div className="relative p-12 flex-wrap md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-start">
               <ScrollReveal delay={400} animation="slide-right" className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 border border-background/20 font-black text-sm backdrop-blur-md mx-auto md:mx-0">
                  <ActivityIcon className="w-4 h-4 text-warning" />
                  {t("promo.badge")}
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight title-gradient">
                  {t("promo.title")}
                </h2>
                <p className="text-xl text-background/80 font-medium">
                  {t("promo.description")}
                </p>
              </ScrollReveal> 
              <ScrollReveal delay={400} animation="slide-left"  className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button className="w-full h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg gap-3 shadow-xl">
                    {t("promo.cta_quote")}
                    <FileTextIcon className="w-5 h-5" />
                  </Button>
                </Link>
                <Link    
                href="/assets/sky-galaxy-company-profile.pdf"
                target="_blank" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full h-16 px-10 rounded-2xl border-background/20 bg-background/10 hover:bg-background/20 hover:text-background font-black text-lg gap-3"
                  >
                    {t("promo.cta_catalog")}
                    <DownloadIcon className="w-5 h-5" />
                  </Button>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
