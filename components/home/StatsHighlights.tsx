'use client';

import { useLocale } from 'next-intl';
import { Icons } from '@/shared/ui/Icons';
import { ScrollReveal } from '@/shared/ui/ScrollReveal';
import { cn } from '@/lib/utils';
import Badge from '@/shared/ui/Badge';

export default function StoreFeatures() {
   const locale = useLocale();

   const features = [
      {
         value: '+10',
         title: locale === 'ar' ? 'فروعنا المتعددة' : 'Multiple Branches',
         description: locale === 'ar'
            ? 'أكثر من 10 فروع منتشرة لضمان سرعة وصول طلباتك وتوفير الدعم لك أينما كنت.'
            : 'Over 10 branches nationwide ensuring fast delivery and support wherever you are.',
         icon: Icons.MapPin,
         iconStyle: " text-destructive",
      },
      {
         value: '+10',
         title: locale === 'ar' ? 'سنوات من الثقة' : 'Years of Trust',
         description: locale === 'ar'
            ? 'خبرة تتجاوز العقد في تقديم أفضل المنتجات وأجودها لتلبية تطلعات عملائنا.'
            : 'Over a decade of experience providing top-quality products to meet your expectations.',
         icon: Icons.Shield,
         iconStyle: " text-success",
      },
      {
         value: '24/7',
         title: locale === 'ar' ? 'دعم فني متواصل' : 'Customer Support',
         description: locale === 'ar'
            ? 'فريق خدمة العملاء متواجد على مدار الساعة للرد على استفساراتكم وتلبية احتياجاتكم.'
            : 'Our customer service team is available around the clock to answer your inquiries.',
         icon: Icons.Phone,
         iconStyle: " text-warning",
      },
   ];

   return (
      <section className="py-2 bg-accent/40 rounded-xl overflow-hidden pt-3  w-full m-auto">
         {/* تأثير إضاءة خفيف في الخلفية للمسة احترافية */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
         {/* why choose us */}
         <div className="relative pt-12 z-10 flex flex-col items-center justify-center">
            <Badge variant={"default"} className="flex items-center justify-center gap-2  ">
               <Icons.Star className="w-4 h-4 text-warning" />
               لماذا تثق بنا
            </Badge>
            <h1 className="text-3xl font-black text-center mb-10 title-gradient  p-4">لماذا تختار Sky Galaxy</h1>
         </div>
         <div className=" mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
               {features.map((feature, idx) => (
                  <ScrollReveal
                     key={idx}

                     delay={idx * 150} // تأخير متدرج لظهور الكروت بشكل متتابع
                     className="h-full"
                  >
                     <div className={cn(
                        "group flex flex-col h-full p-4 rounded-3xl",
                        "bg-background  backdrop-blur-sm",
                        " hover:border-primary/30",
                        "border border-border/40 ",
                        "transition-all duration-500 ease-out cursor-default"
                     )}>

                        {/* الجزء العلوي: الأيقونة + الرقم */}
                        <div className="flex items-center flex-wrap justify-between  gap-4">
                           <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center",
                              "bg-background  shadow-sm",
                              "text-muted-foreground group-hover:text-primary group-hover:bg-primary/5",
                              "transition-all duration-500 ease-out group-hover:scale-110"
                           )}>
                              <feature.icon className={`w-6 h-6 ${feature.iconStyle}`} />
                           </div>

                           <Badge variant={"success"} className="font-bold">
                              {feature.value}
                           </Badge>

                        </div>
                        {/* الجزء السفلي: العنوان + الوصف */}
                        <div className="flex-1 space-y-3 mt-5">
                           <h3 className="title-gradient  gap-2 text-xl font-bold  group-hover:text-primary">

                              {feature.title}
                           </h3>
                           <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                              {feature.description}
                           </p>
                        </div>

                     </div>
                  </ScrollReveal>
               ))}
            </div>
         </div>
      </section>
   );
}