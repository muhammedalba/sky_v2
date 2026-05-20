"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/shared/ui/Card";
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

export default function TestimonialsSection() {
  const t = useTranslations("home");

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              {t("testimonials.title")}
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              {t("testimonials.description")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              text: "تعاملنا مع سكاي جالاكسي في توريد مواد العزل لمشروعنا السكني الأخير. التزام بالمواعيد وجودة المواد كانت ممتازة جداً. نوصي بالتعامل معهم بشدة.",
              name: "المهندس أحمد",
              role: "مدير مشروع - شركة مقاولات",
            },
            {
              text: "أفضل أسعار الجملة في السوق بلا منازع، بالإضافة إلى التجاوب السريع من فريق المبيعات. منتجات الإيبوكسي لديهم ذات جودة استثنائية.",
              name: "محمد العتيبي",
              role: "مؤسسة تطوير عقاري",
            },
            {
              text: "تجربة تسوق ممتازة، الكتالوج الفني ساعدنا كثيراً في اختيار المواد الصحيحة، وسرعة التوصيل أنقذت الجدول الزمني للمشروع.",
              name: "سالم الدوسري",
              role: "مهندس استشاري",
            },
          ].map((testimonial, i) => (
            <ScrollReveal key={i} delay={i * 100} className="h-full">
              <Card className="p-8 bg-secondary/50 rounded-3xl border border-border/50 shadow-sm relative h-full flex flex-col hover:shadow-xl transition-shadow">
                <Icons.Activity className="absolute top-6 left-6 w-10 h-10 text-muted-foreground/10 rotate-180" />
                <div className="flex gap-1 text-warning mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icons.Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground/80 font-medium leading-relaxed mb-8 italic grow">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border/50">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs font-black text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
