"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { ChevronRightIcon, PackageIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import Badge from "@/shared/ui/Badge";



const SectionDivider = ({ inverted = false }: { inverted?: boolean }) => (
  <div className="relative h-24 w-full bg-background overflow-hidden -mt-px">
    <div
      className="absolute inset-0 bg-secondary"
      style={{
        clipPath:inverted
          ? "polygon(0 0, 100% 100%, 100% 0, 0 0)"
          : "polygon(0 0, 100% 0, 0 100%, 0 0)",
      }}
    />
  </div>
);

export default function FeaturedProjectsSection() {
  const t = useTranslations("home");

  return (
    <>
      <SectionDivider inverted />
      <section className="dark py-24 bg-background text-foreground overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-16 text-center md:text-start">
            <div className="space-y-4">
              <Badge variant="warning" className=" text-sm hover:bg-warning/20 hover:text-warning uppercase">
                {t("projects.badge")}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight title-gradient">
                {t("projects.title")}
              </h2>
               <div className="w-24 h-0.5 bg-primary/80 rounded-full mt-2.5 me-auto" />
            </div>
            <Link
              href="/projects"
              className="group flex items-center gap-4 text-white hover:text-primary transition-colors font-black"
            >
              {t("projects.view_all")}{" "}
              <div className="w-12 h-px bg-border group-hover:w-20 group-hover:bg-primary transition-all hidden md:block" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "تطوير أبراج العليا",
                desc: "توريد مواد العزل الحراري لكامل الواجهات.",
                year: "2024",
              },
              {
                name: "مشروع البحر الأحمر",
                desc: "توريد أنظمة العزل المائي للأساسات والمطاعم.",
                year: "2023",
              },
              {
                name: "مستشفى الملك فهد",
                desc: "تجهيز الأرضيات بالإيبوكسي المقاوم للبكتيريا.",
                year: "2023",
              },
            ].map((project, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <Card className="p-4 border-white/10 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500 rounded-4xl overflow-hidden group bg-white/5 backdrop-blur-md cursor-pointer">
                  <div className="aspect-video bg-accent rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center">
                    <PackageIcon className="w-16 h-16 text-foreground/20 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="px-4 pb-4 text-center md:text-start">
                    <h3 className="text-xl font-black text-foreground mb-2">
                      {project.name}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium mb-6">
                      {project.desc}
                    </p>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full">
                        {project.year}
                      </span>
                      <ChevronRightIcon className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors rtl:rotate-180" />
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
