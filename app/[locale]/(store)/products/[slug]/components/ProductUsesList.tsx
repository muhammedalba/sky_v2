"use client";

import { useTranslations } from "next-intl";
import { StarIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export interface ProductUsesListProps {
  uses: string[];
}

export default function ProductUsesList({ uses }: ProductUsesListProps) {
  const t = useTranslations("product");

  if (!uses || uses.length === 0) return null;

  return (
    <div className="pt-5 space-y-3 px-5">
      <ScrollReveal animation="fade" className="bg-secondary/30 rounded-2xl p-5">
        <h3 className="font-bold text-base mb-3 flex items-center gap-2 title-gradient">
          <StarIcon className="w-4 h-4 text-primary" />
          {t("uses.title")}
        </h3>
        <ul className="space-y-2.5">
          {uses.map((useStr, idx) => (
            <ScrollReveal
              animation="fade"
              delay={idx * 200}
              key={idx}
              className="flex items-start gap-2.5 text-sm text-muted-foreground"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span className="leading-relaxed">{useStr}</span>
            </ScrollReveal>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  );
}
