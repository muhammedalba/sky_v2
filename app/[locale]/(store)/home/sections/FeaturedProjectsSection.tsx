"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { ChevronRightIcon, MapPinIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { GlowCard } from "@/shared/ui/GlowCard";
import Badge from "@/shared/ui/Badge";

// Placeholder photos until real project photography is supplied.
const PROJECTS = [
  { key: "residences", image: "/assets/images/Project-1.webp" },
  { key: "logistics", image: "/assets/images/Project-2.webp" },
  { key: "towers", image: "/assets/images/Project-3.webp" },
] as const;

export default function FeaturedProjectsSection() {
  const t = useTranslations("home");

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal
          animation="fade"
          className="flex flex-col items-center text-center gap-4 mb-16"
        >
          <Badge
            variant="default"
            className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
          >
            {t("projects.badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight title-gradient">
            {t("projects.title")}
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-xl">
            {t("projects.description")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project, i) => (
            <ScrollReveal
              key={project.key}
              delay={i * 100}
              animation="slide-up"
            >
              <GlowCard className="relative aspect-5/5 rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src={project.image}
                  alt={t(`projects.items.${project.key}.title`)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />

                <div className="absolute top-5 inset-s-5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {t(`projects.items.${project.key}.location`)}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-2xl font-black text-white mb-1">
                    {t(`projects.items.${project.key}.title`)}
                  </h3>
                  <p className="text-white/80 text-sm font-medium">
                    {t(`projects.items.${project.key}.desc`)}
                  </p>
                </div>
              </GlowCard>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
