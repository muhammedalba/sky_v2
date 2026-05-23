"use client";

import { useTranslations } from "next-intl";
import { BrandsIcon, CalendarIcon, PackageIcon, UsersIcon } from "@/shared/ui/Icons";
import { useState, useEffect, useRef, useMemo } from "react";

// CountUp component optimized for high performance
const CountUp = ({
  end,
  duration = 2000,
}: {
  end: number;
  duration?: number;
}) => {
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Intersection Observer remains the same, but disconnects properly
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Disconnect immediately once visible to save memory
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Use requestAnimationFrame and direct DOM updates instead of setInterval/useState
  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // Calculate current value based on progress and duration
      const percentage = Math.min(progress / duration, 1);
      const currentCount = Math.floor(end * percentage);

      // Update the DOM directly bypassing React's render cycle
      if (countRef.current) {
        countRef.current.textContent = currentCount.toString();
      }

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Ensure the final number is exact
        if (countRef.current) {
          countRef.current.textContent = end.toString();
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration, isVisible]);

  // Render static 0 initially, JS will update it smoothly
  return <span ref={countRef}>0</span>;
};

export default function StatsBar() {
  const t = useTranslations("home");

  // Parse values safely with defaults
  const productsVal = parseInt(t("stats_bar.products_val") || "500", 10);
  const brandsVal = parseInt(t("stats_bar.brands_val") || "15", 10);
  const yearsVal = parseInt(t("stats_bar.years_val") || "10", 10);
  const projectsVal = parseInt(t("stats_bar.projects_val") || "150", 10);

  // Memoize stats array to prevent recreation on re-renders (if any parent state changes)
  const stats = useMemo(() => [
    {
      icon: PackageIcon,
      val: productsVal,
      suffix: t("stats_bar.products_suffix") || "+",
      label: t("stats_bar.products_label"),
      colorClass:
        "text-primary bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground",
    },
    {
      icon: BrandsIcon,
      val: brandsVal,
      suffix: t("stats_bar.brands_suffix") || "+",
      label: t("stats_bar.brands_label"),
      colorClass:
        "text-success bg-success/10 group-hover:bg-success group-hover:text-success-foreground",
    },
    {
      icon: CalendarIcon,
      val: yearsVal,
      suffix: t("stats_bar.years_suffix") || "+",
      label: t("stats_bar.years_label"),
      colorClass:
        "text-warning bg-warning/10 group-hover:bg-warning group-hover:text-warning-foreground",
    },
    {
      icon: UsersIcon,
      val: projectsVal,
      suffix: t("stats_bar.projects_suffix") || "+",
      label: t("stats_bar.projects_label"),
      colorClass:
        "text-info bg-info/10 group-hover:bg-info group-hover:text-info-foreground",
    },
  ], [productsVal, brandsVal, yearsVal, projectsVal, t]);

  return (
    <section className="relative z-20 -mt-12 sm:-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-[90%] sm:w-full">
      <div className="bg-background/20 backdrop-blur-xl border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/5 transition-all duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-2 sm:gap-x-6 lg:gap-x-0 divide-y md:divide-y-0 lg:divide-x divide-border/80">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-2 p-4 lg:px-8 lg:first:pt-4 lg:divide-x-0 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Icon Container with Hover Animation */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:rotate-6 ${item.colorClass}`}
                >
                  <Icon className="w-6 h-6 transition-transform duration-500" />
                </div>

                {/* Stat Text */}
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-center justify-center sm:justify-start gap-0.5">
                    <CountUp end={item.val} />
                    <span className="text-primary font-black">
                      {item.suffix}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-black tracking-wide uppercase">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}