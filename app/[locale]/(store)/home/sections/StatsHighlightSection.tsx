import { getTranslations } from "next-intl/server";
import { CalendarIcon, CheckCircle2Icon, ShieldCheckIcon, UsersIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import CountUp from "@/components/CountUp";

const STATS = [
  { icon: CalendarIcon, value: 10, suffix: "+", labelKey: "years" },
  { icon: CheckCircle2Icon, value: 500, suffix: "+", labelKey: "projects" },
  { icon: UsersIcon, value: 50, suffix: "+", labelKey: "partners" },
  { icon: ShieldCheckIcon, value: 100, suffix: "%", labelKey: "quality" },
] as const;

export default async function StatsHighlightSection({
  locale,
}: {
  locale: "ar" | "en";
}) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <section className="py-4 md:py-6 bg-background">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 ">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <ScrollReveal
                key={stat.labelKey}
                animation="slide-up"
                delay={i * 100}
                className="flex items-center justify-center gap-4"
              >
                <div className="w-16 h-16 rounded-e-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    <CountUp end={stat.value} />
                    {stat.suffix}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                    {t(`stats.${stat.labelKey}`)}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
