"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Icons } from "@/shared/ui/Icons";
import { useState, useRef, useEffect } from "react";

const ScrollReveal = ({ children, className = "", delay = 0, direction = "up" }: { children: React.ReactNode; className?: string; delay?: number; direction?: "up" | "down" | "left" | "right" | "none"; }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } }, { threshold: 0.1, rootMargin: "50px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const getTranslate = () => { if (direction === "up") return "translate-y-12"; if (direction === "down") return "-translate-y-12"; if (direction === "left") return "translate-x-12"; if (direction === "right") return "-translate-x-12"; return ""; };
  return <div ref={ref} className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${getTranslate()}`} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

export default function PromoBannerSection() {
  const t = useTranslations("home");

  return (
    <section className="py-10 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative rounded-[3rem] bg-foreground text-background overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <Icons.Box className="absolute -left-20 -top-20 w-[400px] h-[400px] text-background/5 -rotate-12 pointer-events-none" />

            <div className="relative p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-start">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 border border-background/20 font-black text-sm backdrop-blur-md mx-auto md:mx-0">
                  <Icons.Activity className="w-4 h-4 text-warning" />
                  {t("promo.badge")}
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                  {t("promo.title")}
                </h2>
                <p className="text-xl text-background/80 font-medium">
                  {t("promo.description")}
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button className="w-full h-16 px-10 rounded-2xl bg-warning hover:bg-warning/90 text-warning-foreground font-black text-lg gap-3 shadow-xl">
                    {t("promo.cta_quote")}
                    <Icons.FileText className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full h-16 px-10 rounded-2xl border-background/20 hover:bg-background/10 text-background font-black text-lg gap-3"
                  >
                    {t("promo.cta_catalog")}
                    <Icons.Download className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
