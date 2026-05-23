"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { ShieldIcon, TrendingUpIcon, TruckIcon } from "@/shared/ui/Icons";
import { Card } from "@/shared/ui/Card";
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

const CountUp = ({ end, duration = 2000 }: { end: number; duration?: number; }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => { start += increment; if (start >= end) { setCount(end); clearInterval(timer); } else { setCount(Math.floor(start)); } }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isVisible]);
  return <span ref={countRef}>{count}</span>;
};

export default function WhyChooseUsSection() {
  const t = useTranslations("home");

  return (
    <section className="py-24 bg-secondary/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <ScrollReveal direction="right">
            <div className="space-y-8">
              <div className="space-y-4 text-center md:text-start">
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{t("why.title")}</h2>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">{t("why.description")}</p>
              </div>
              <div className="space-y-4 pt-4">
                {[
                  { title: t("why.features.quality.title"), desc: t("why.features.quality.desc"), icon: ShieldIcon },
                  { title: t("why.features.pricing.title"), desc: t("why.features.pricing.desc"), icon: TrendingUpIcon },
                  { title: t("why.features.logistics.title"), desc: t("why.features.logistics.desc"), icon: TruckIcon },
                ].map((feature, i) => (
                  <div key={i} className="flex flex-col sm:flex-row text-center sm:text-start items-center sm:items-start gap-6 group bg-card p-6 rounded-3xl border border-border/50 hover:shadow-xl transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                      <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-foreground mb-2">{feature.title}</h4>
                      <p className="text-muted-foreground font-medium text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={200}>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-card border-border/50 shadow-lg text-center flex flex-col items-center justify-center aspect-square hover:border-primary/50 transition-colors">
                  <p className="text-4xl sm:text-5xl font-black text-primary mb-2"><CountUp end={15} />+</p>
                  <p className="font-black text-muted-foreground uppercase tracking-widest text-xs sm:text-sm">{t("stats.years")}</p>
                </Card>
                <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-warning border-none shadow-lg text-center flex flex-col items-center justify-center aspect-square text-warning-foreground hover:scale-105 transition-transform">
                  <p className="text-4xl sm:text-5xl font-black mb-2"><CountUp end={500} />+</p>
                  <p className="font-black opacity-80 uppercase tracking-widest text-xs sm:text-sm">{t("stats.projects")}</p>
                </Card>
              </div>
              <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-12">
                <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-foreground border-none shadow-lg text-center flex flex-col items-center justify-center aspect-square text-background hover:scale-105 transition-transform">
                  <p className="text-4xl sm:text-5xl font-black mb-2"><CountUp end={50} />+</p>
                  <p className="font-black opacity-80 uppercase tracking-widest text-xs sm:text-sm">{t("stats.partners")}</p>
                </Card>
                <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-card border-border/50 shadow-lg text-center flex flex-col items-center justify-center aspect-square hover:border-primary/50 transition-colors">
                  <p className="text-4xl sm:text-5xl font-black text-primary mb-2"><CountUp end={100} />%</p>
                  <p className="font-black text-muted-foreground uppercase tracking-widest text-xs sm:text-sm">{t("stats.quality")}</p>
                </Card>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
