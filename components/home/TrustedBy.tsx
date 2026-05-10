'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { getLocalizedValue } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';
import { useTrans } from '@/shared/hooks/useTrans';

export default function TrustedBy() {
  const t = useTranslations('home');
  const getTrans = useTrans();
  const { data: brandsResponse, isLoading } = useBrands({ all_langs: false });
  const brands = brandsResponse?.data || [];
  console.log(brands);

  if (isLoading || brands.length === 0) return null;

  return (
    <section className="py-2 bg-background border-b border-border/50">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        [dir="rtl"] .animate-marquee {
          animation: marquee-rtl 40s linear infinite;
        }
        @keyframes marquee-rtl {
          0% { transform: translateX(0%); }
          100% { transform: translateX(50%); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <p className="title-gradient text-sm font-black uppercase tracking-[0.2em] shrink-0 text-center md:text-start">
            {t('trust.label')}
          </p>
          <div className="w-full relative flex overflow-hidden mask-image-fade">
            <div className="flex whitespace-nowrap animate-marquee items-center gap-5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {[1, 2, 3, 4, 5, 6, 7].map((group) => (
                <div key={group} className="flex gap-5 shrink-0 items-center">
                  {brands?.map((brand) => (
                    <div key={brand._id} className="flex items-center justify-center min-w-[120px]">
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={getTrans(brand.name)}
                          className="h-12 w-auto object-contain max-w-[150px]"
                        />
                      ) : (
                        <span className="text-2xl font-black text-foreground opacity-60 hover:opacity-100 transition-opacity">
                          {getTrans(brand.name)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
