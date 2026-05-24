"use client";

import { useTranslations } from "next-intl";
import { ShieldIcon, TrendingUpIcon, TruckIcon } from "@/shared/ui/Icons"; // الاعتماد على المسار الخاص بك
import { Card } from "@/shared/ui/Card";
import CountUp from "@/components/CountUp";
import { cn } from "@/lib/utils";

export default function WhyChooseUsSection() {
  const t = useTranslations("home");

  // تعريف الميزات مع ربط الأيقونات مباشرة وتحديد الألوان ككلاسات ثابتة
  const features = [
    { 
      title: t("why.features.quality.title"), 
      desc: t("why.features.quality.desc"), 
      icon: ShieldIcon, 
      iconClass: "text-emerald-500", 
      bgClass: "bg-emerald-500/10" 
    },
    { 
      title: t("why.features.pricing.title"), 
      desc: t("why.features.pricing.desc"), 
      icon: TrendingUpIcon, 
      iconClass: "text-amber-500", 
      bgClass: "bg-amber-500/10" 
    },
    { 
      title: t("why.features.logistics.title"), 
      desc: t("why.features.logistics.desc"), 
      icon: TruckIcon, 
      iconClass: "text-blue-500", 
      bgClass: "bg-blue-500/10" 
    },
  ];

  return (
    <section className="py-24 bg-secondary/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* الجانب النصي */}
          <div className="space-y-8">
            <div className="space-y-4 text-center lg:text-start">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight title-gradient">{t("why.title")}</h2>
             <div className="w-24 h-0.5 bg-primary/80 rounded-full mt-2.5 mx-auto" />
              <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0">{t("why.description")}</p>
            </div>
            
            <div className="space-y-4 pt-4">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col sm:flex-row text-center sm:text-start items-center sm:items-start gap-6 group bg-card p-6 rounded-3xl border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary", feature.bgClass)}>
                    <feature.icon className={cn("w-6 h-6 transition-colors group-hover:text-white", feature.iconClass)} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-foreground/70 mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground font-medium text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <StatCard value={15} label={t("stats.years")} className="bg-card" textColor="text-primary" />
            <StatCard value={500} label={t("stats.projects")} className="bg-primary text-primary-foreground" />
            <StatCard value={50} label={t("stats.partners")} className="bg-foreground text-background" />
            <StatCard value={100} label={t("stats.quality")} isPercent={true} className="bg-card" textColor="text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}

// مكون فرعي للإحصائيات
function StatCard({ value, label, isPercent = false, className, textColor = "" }: { value: number, label: string, isPercent?: boolean, className?: string, textColor?: string }) {
  return (
    <Card className={cn("p-8 rounded-[2.5rem] border-none shadow-sm text-center flex flex-col items-center justify-center aspect-square transition-transform hover:scale-105", className)}>
      <p className={cn("text-4xl md:text-5xl font-black mb-2", textColor)}>
        <CountUp end={value} />{isPercent ? '%' : '+'}
      </p>
      <p className="font-black opacity-70 uppercase tracking-widest text-xs">{label}</p>
    </Card>
  );
}