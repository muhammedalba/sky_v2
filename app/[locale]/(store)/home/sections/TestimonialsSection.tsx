"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/shared/ui/Card";
import { ActivityIcon, StarIcon } from "@/shared/ui/Icons"; // استبدل بـ QuoteIcon إن وجد
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { useMemo } from "react";

// 1. إخراج البيانات الثابتة خارج المكون لتحسين الأداء (تجنب إعادة الإنشاء مع كل ريندر)
// ملاحظة: من الأفضل مستقبلاً نقل هذه النصوص إلى ملفات الترجمة (ar.json / en.json)
const TESTIMONIALS = [
  {
    id: 1,
    text: "تعاملنا مع سكاي جالاكسي في توريد مواد العزل لمشروعنا السكني الأخير. التزام بالمواعيد وجودة المواد كانت ممتازة جداً. نوصي بالتعامل معهم بشدة.",
    name: "المهندس أحمد",
    role: "مدير مشروع - شركة مقاولات",
  },
  {
    id: 2,
    text: "أفضل أسعار الجملة في السوق بلا منازع، بالإضافة إلى التجاوب السريع من فريق المبيعات. منتجات الإيبوكسي لديهم ذات جودة استثنائية.",
    name: "محمد العتيبي",
    role: "مؤسسة تطوير عقاري",
  },
  {
    id: 3,
    text: "تجربة تسوق ممتازة، الكتالوج الفني ساعدنا كثيراً في اختيار المواد الصحيحة، وسرعة التوصيل أنقذت الجدول الزمني للمشروع.",
    name: "سالم الدوسري",
    role: "مهندس استشاري",
  },
];

export default function TestimonialsSection() {
  const t = useTranslations("home");
  const marqueeContent = useMemo(() => {
    if (!TESTIMONIALS.length) return null;

    // use 6 groups instead of 7 (even number).
    // because the animation moves by 50%, the even number ensures that the movement ends at the beginning of a complete group, preventing interruption (Seamless Loop).
    return  Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className="flex gap-5 shrink-0 items-center"
        // 3.Accessibility: hide repeated groups from screen readers
        aria-hidden={index > 0 ? "true" : "false"}
      >
         {TESTIMONIALS.map((testimonial, i) => {
            // حل ذكي لاستخراج أول حرف من الاسم وتجاهل الألقاب مثل "المهندس"
            const nameInitial = testimonial.name.replace('المهندس ', '').charAt(0);

            return (
              <ScrollReveal key={testimonial.id} delay={i * 100} className="flex gap-5 shrink-0 items-center">
                <Card className="p-8 max-w-md bg-secondary/30 rounded-3xl border border-border/50 shadow-sm relative h-full flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">  
                  {/* أيقونة الاقتباس بالخلفية */}
                  <ActivityIcon className="absolute top-6 left-6 w-12 h-12 text-primary/5 group-hover:text-primary/10 transition-colors rotate-180" />
                  
                  <div className="flex gap-1 text-warning mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-foreground/80 font-medium max-w-xl mb-8 text-wrap">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border/50">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {nameInitial}
                    </div>
                    <div>
                      <h4 className="font-black text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs font-bold text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
      </div>
    ));
  }, []);

  
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="slide-up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black title-gradient tracking-tight">
              {t("testimonials.title")}
            </h2>
             <div className="w-24 h-0.5 bg-primary/80 rounded-full mt-2.5 mx-auto" />
            <p className="text-lg text-muted-foreground font-medium">
              {t("testimonials.description")}
            </p>
          </div>
        </ScrollReveal>

          <div className="w-full relative flex overflow-hidden mask-image-fade">
            <div className="flex whitespace-nowrap animate-marquee items-center gap-5 hover:opacity-50 hover:grayscale grayscale-0 opacity-100 transition-all duration-500">
              {marqueeContent}
            </div>
          </div> 
      </div>
    </section>
  );
}