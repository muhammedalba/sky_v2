import { getTranslations } from "next-intl/server";
import { Card } from "@/shared/ui/Card";
import { ActivityIcon, ExternalLinkIcon, GoogleIcon } from "@/shared/ui/Icons"; // استبدل بـ QuoteIcon إن وجد
import { RatingStars } from "@/shared/ui/RatingStars";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { getStoreSettings } from "@/shared/api/settings";
import { getGoogleReviews } from "@/shared/api/googleReviews";
import { Avatar } from "@/shared/ui/CustomAvatar";

// Default testimonials — shown whenever real Google reviews are disabled or unavailable.
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

/** Shared shape for both static testimonials and Google reviews. */
interface TestimonialItem {
  key: string;
  author: string;
  subtitle: string;
  text: string;
  rating: number;
  photo?: string;
  authorUrl?: string;
}

const STATIC_ITEMS: TestimonialItem[] = TESTIMONIALS.map((testimonial) => ({
  key: String(testimonial.id),
  author: testimonial.name,
  subtitle: testimonial.role,
  text: testimonial.text,
  rating: 5,
}));

function TestimonialCard({
  item,
  isGoogle,
}: {
  item: TestimonialItem;
  isGoogle: boolean;
}) {


  return (
    <Card className="p-8 max-w-md  rounded-3xl border border-border/50  relative h-full flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      {/* Quote icon with background*/}
      <ActivityIcon className="absolute bottom-4 inset-e-7 w-12 h-12 text-primary/10 group-hover:text-primary/10 transition-colors rotate-180" />
 
      <p
        className={`text-foreground/80 font-medium max-w-xl mb-8 text-wrap ${isGoogle ? "line-clamp-5" : ""}`}
      >
        &ldquo;{item.text}&rdquo;
      </p>

      <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border/50">
        <Avatar
          src={item.photo}
          alt={item.author}
          fallback={item.author}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div>
          <h4 className="font-black text-foreground">
            {item.authorUrl ? (
              <a
                href={item.authorUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-primary transition-colors"
              >
                {item.author}
              </a>
            ) : (
              item.author
            )}
          </h4>
          <p className="text-xs font-bold text-muted-foreground">
            {item.subtitle}
          </p>
          <RatingStars rating={item.rating} starClassName="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
}

export default async function TestimonialsSection({
  locale,
}: {
  locale: "ar" | "en";
}) {
  // Settings are request-deduped & ISR-cached; reviews are fetched only when enabled.
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getStoreSettings(),
  ]);
  const googleReviews = settings?.googleReviews?.enabled
    ? await getGoogleReviews(locale)
    : null;

  const isGoogle = !!googleReviews;
  const items: TestimonialItem[] = googleReviews
    ? googleReviews.reviews.map((review, i) => ({
        key: `${review.author}-${i}`,
        author: review.author,
        subtitle: review.time,
        text: review.text,
        rating: review.rating,
        photo: review.photo || undefined,
        authorUrl: review.authorUrl || undefined,
      }))
    : STATIC_ITEMS;

  // use 6 groups instead of 7 (even number).
  // because the animation moves by 50%, the even number ensures that the movement ends at the beginning of a complete group, preventing interruption (Seamless Loop).
  const marqueeContent = Array.from({ length: 6 }, (_, index) => (
    <div
      key={index}
      className="flex gap-5 shrink-0 items-center"
      // 3.Accessibility: hide repeated groups from screen readers
      aria-hidden={index > 0 ? "true" : "false"}
    >
      {items.map((item, i) => (
        <ScrollReveal
          key={item.key}
          delay={i * 100}
          className="flex gap-5 shrink-0 items-center"
        >
          <TestimonialCard item={item} isGoogle={isGoogle} />
        </ScrollReveal>
      ))}
    </div>
  ));

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute inset-0  bg-primary/10">
        <svg
          className="absolute top-0 inset-x-0 w-full h-20 md:h-28 text-background"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,0 L0,40 Q720,150 1440,40 L1440,0 Z" fill="currentColor" />
        </svg>
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-20 md:h-15 text-background"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 L0,80 Q720,-30 1440,80 L1440,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
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

            {googleReviews && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <GoogleIcon className="w-6 h-6" />
                  <span className="text-2xl font-black text-foreground">
                    {googleReviews.rating.toFixed(1)}
                  </span>
                  <div className="flex flex-col items-start gap-0.5">
                    <RatingStars
                      rating={googleReviews.rating}
                      starClassName="w-4 h-4"
                    />
                    <span className="text-xs font-bold text-muted-foreground">
                      {t("testimonials.basedOn", {
                        count: googleReviews.total,
                      })}
                      {t("testimonials.fromGoogle")}
                    </span>
                  </div>
                </div>
                {googleReviews.url && (
                  <a
                    href={googleReviews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-5 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {t("testimonials.viewAll")}
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
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
