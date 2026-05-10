'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import TrustedBy from '@/components/home/TrustedBy';
import StatsHighlights from '@/components/home/StatsHighlights';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Card } from '@/shared/ui/Card';
import { useEffect, useState, useRef } from 'react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Product, Category } from '@/types';

import { getLocalizedValue, formatCurrency } from '@/lib/utils';
import Badge from '@/shared/ui/Badge';


// --- Premium Industrial Helper Components ---

/**
 * ScrollReveal for high-performance viewport animations
 */
const ScrollReveal = ({ children, className = '', delay = 0, direction = 'up' }: { children: React.ReactNode, className?: string, delay?: number, direction?: 'up' | 'down' | 'left' | 'right' | 'none' }) => {
   const [isVisible, setIsVisible] = useState(false);
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
         if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
         }
      }, { threshold: 0.1, rootMargin: '50px' });

      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
   }, []);

   const getTranslate = () => {
      if (direction === 'up') return 'translate-y-12';
      if (direction === 'down') return '-translate-y-12';
      if (direction === 'left') return 'translate-x-12';
      if (direction === 'right') return '-translate-x-12';
      return '';
   };

   return (
      <div
         ref={ref}
         className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${getTranslate()}`} ${className}`}
         style={{ transitionDelay: `${delay}ms` }}
      >
         {children}
      </div>
   );
};

/**
 * GlowCard for interactive mouse-tracking gradients (Bento Grid)
 */
const GlowCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
   const ref = useRef<HTMLDivElement>(null);
   const [position, setPosition] = useState({ x: 0, y: 0 });
   const [opacity, setOpacity] = useState(0);

   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
   };

   return (
      <div
         ref={ref}
         onMouseMove={handleMouseMove}
         onMouseEnter={() => setOpacity(1)}
         onMouseLeave={() => setOpacity(0)}
         className={`relative overflow-hidden ${className}`}
      >
         <div
            className="pointer-events-none absolute -inset-px z-10 transition-opacity duration-300"
            style={{
               opacity,
               background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.08), transparent 40%)`
            }}
         />
         {children}
      </div>
   );
};




/**
 * CountUp component for animating statistics when they enter the viewport.
 */
const CountUp = ({ end, duration = 2000 }: { end: number, duration?: number }) => {
   const [count, setCount] = useState(0);
   const countRef = useRef(null);
   const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
         if (entry.isIntersecting) setIsVisible(true);
      }, { threshold: 0.1 });
      if (countRef.current) observer.observe(countRef.current);
      return () => observer.disconnect();
   }, []);

   useEffect(() => {
      if (!isVisible) return;
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
         start += increment;
         if (start >= end) {
            setCount(end);
            clearInterval(timer);
         } else {
            setCount(Math.floor(start));
         }
      }, 16);
      return () => clearInterval(timer);
   }, [end, duration, isVisible]);

   return <span ref={countRef}>{count}</span>;
};

/**
 * Section divider with architectural diagonal clip paths.
 */
const SectionDivider = ({ inverted = false }: { inverted?: boolean }) => (
   <div className="relative h-24 w-full bg-background overflow-hidden -mt-px">
      <div
         className="absolute inset-0 bg-secondary"
         style={{ clipPath: inverted ? 'polygon(0 0, 100% 100%, 100% 0, 0 0)' : 'polygon(0 0, 100% 0, 0 100%, 0 0)' }}
      />
   </div>
);

export default function HomeClient({ locale }: { locale: string }) {
   const t = useTranslations('home');

   // Data fetching
   const { data: categoriesData } = useCategories({ limit: 4 });
   const { data: productsData } = useProducts({ limit: 4 });

   const categories = categoriesData?.data || [];
   const products = productsData?.data || [];

   return (
      <div className="flex flex-col   relative bg-background text-foreground overflow-x-hidden">
         <style>{`
            @keyframes marquee {
               0% { transform: translateX(0%); }
               100% { transform: translateX(-50%); }
            }
            .animate-marquee { animation: marquee 30s linear infinite; }
            [dir="rtl"] .animate-marquee { animation-direction: reverse; }
            .mask-image-fade { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
            
            /* Custom Scrollbar for horizontal lists if needed */
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
         `}</style>

         {/* 1. HERO SECTION (Conversion Optimized) */}
         <section className=" relative `min-h-screenflex items-center  pb-20  bg-background text-foreground">
            {/* Video Background */}
            <video autoPlay loop muted playsInline className="absolute inset-0 z-0 w-full h-full object-cover  ">
               <source src="/assets/video/banner-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 z-1 bg-linear-to-b from-background/70 via-primary/10 to-background/60" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-48 lg:mt-36">
               <div className="grid grid-cols-1 gap-12 items-center">

                  {/* Left: Branding & CTAs */}
                  <div className="space-y-8 text-center ">
                     <Badge variant="outline" className="tracking-widest  inline-flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                        </span>
                        <span className="text-white/80 text-xs font-black tracking-widest uppercase">{t('hero.badge_text')}</span>
                     </Badge>

                     <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-lg">
                           {t('brand.name')}
                           <br />
                           <span className="title-gradient max-w-2xl m-auto mt-2 block pb-2">
                              {t('brand.tagline')}
                           </span>
                        </h1>
                        <p className="max-w-xl text-lg  md:text-xl text-foreground/50 font-medium leading-relaxed mt-2 mx-auto ">
                           {t('hero.description')}
                        </p>
                     </div>

                     <div className="flex flex-col sm:flex-row items-center justify-center gap-4  animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        <Link href="/products" className="w-full sm:w-auto">
                           <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-primary/80 hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 border-none font-black text-lg gap-3 transition-transform hover:scale-105">
                              {t('hero.cta_shop')}
                              <Icons.ShoppingCart className="w-6 h-6 rtl:ml-2" />
                           </Button>
                        </Link>
                        <Link href="/assets/sky-galaxy-company-profile.pdf" target="_blank" className="w-full sm:w-auto">
                           <Button variant="outline"
                              className="w-full sm:w-auto h-16 px-10  text-white transition-all hover:scale-105 hover:text-white hover:bg-white/10 font-black text-lg  gap-2  duration-500"
                           >
                              {t('hero.cta_download_catalog')}

                              <Icons.Download className="w-5 h-5" />
                           </Button>
                        </Link>
                     </div>

                     {/* Trust Signals */}
                     <div className="flex flex-wrap justify-center  items-center gap-6  mt-8">
                        {[
                           { text: t('hero.trust_badges.certified'), icon: Icons.Check },
                           { text: t('hero.trust_badges.delivery'), icon: Icons.Box },
                           { text: t('hero.trust_badges.warranty'), icon: Icons.Shield },
                        ].map((badge, idx) => (
                           <Badge key={idx} variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-full  border backdrop-blur-md ">
                              <badge.icon className="w-5 h-5 text-warning" />
                              <span className="text-sm font-black tracking-wide">{badge.text}</span>
                           </Badge>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

         </section>

         {/* Trusted by 
         <TrustedBy />*/}

         {/* 2.5 STATS HIGHLIGHTS */}

         <StatsHighlights />

         {/* 3. SHOP BY CATEGORY (Bento Grid) */}
         <section className="py-24   bg-secondary/30 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <ScrollReveal>
                  <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
                     <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{t('categories.title')}</h2>
                        <p className="text-lg text-muted-foreground font-medium max-w-2xl">{t('categories.description')}</p>
                     </div>
                     <Link href="/products">
                        <Button variant="ghost" className="font-black text-primary hover:bg-primary/10 gap-2">
                           {t('categories.view_all')} <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
                        </Button>
                     </Link>
                  </div>
               </ScrollReveal>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                  {/* Main Category */}
                  {categories.length > 0 ? (
                     <>
                        <ScrollReveal delay={100} className="md:col-span-2 h-full">
                           <Link href={`/products?category=${categories[0]._id}`} className="block h-full">
                              <GlowCard className="h-full group rounded-[2.5rem] bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden">
                                 <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700 z-10" />
                                 <div className="absolute top-8 right-8 z-20 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 text-sm font-black shadow-sm flex items-center gap-2">
                                    <Icons.Star className="w-4 h-4 text-warning" /> {t('categories.featured_label')}
                                 </div>
                                 <div className="absolute inset-0 flex flex-col justify-end p-10 z-20 bg-linear-to-t from-background via-background/80 to-transparent">
                                    <h3 className="text-4xl md:text-5xl font-black text-foreground mb-4">{getLocalizedValue(categories[0].name, locale)}</h3>
                                    <p className="text-muted-foreground font-medium max-w-md mb-6">{t('categories.items.waterproofing.desc')}</p>
                                    <div className="flex items-center gap-4 text-primary font-black group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform">
                                       {t('categories.shop_category')} <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
                                    </div>
                                 </div>
                                 <Icons.Package className="absolute left-10 top-1/2 -translate-y-1/2 w-64 h-64 text-muted/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />
                              </GlowCard>
                           </Link>
                        </ScrollReveal>

                        <div className="flex flex-col gap-6 h-full">
                           {categories.slice(1, 3).map((cat: Category, i: number) => (
                              <ScrollReveal key={cat._id} delay={200 + i * 100} className="h-full">
                                 <Link href={`/products?category=${cat._id}`} className="block h-full">
                                    <GlowCard className="h-full group rounded-[2.5rem] bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden">
                                       <div className={`absolute inset-0 bg-linear-to-br ${i === 0 ? 'from-warning/5' : 'from-blue-500/5'} to-transparent z-10`} />
                                       <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                                          <h3 className="text-2xl font-black text-foreground mb-2">{getLocalizedValue(cat.name, locale)}</h3>
                                          <div className="flex items-center justify-between mt-4">
                                             <span className="text-muted-foreground font-medium text-sm">{cat.productsCount || 0} {t('best_sellers.badge')}</span>
                                             <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                                                <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
                                             </div>
                                          </div>
                                       </div>
                                    </GlowCard>
                                 </Link>
                              </ScrollReveal>
                           ))}
                        </div>
                     </>
                  ) : (
                     <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground font-black">
                        {t('categories.title')}...
                     </div>
                  )}
               </div>
            </div>
         </section>

         {/* 4. BEST SELLERS (Conversion Optimized Products) */}
         <section className="py-24 bg-background relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <ScrollReveal>
                  <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                     <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest uppercase">{t('best_sellers.badge')}</div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{t('best_sellers.title')}</h2>
                        <p className="text-lg text-muted-foreground font-medium max-w-2xl">{t('best_sellers.description')}</p>
                     </div>
                     <Link href="/products" className="shrink-0">
                        <Button variant="outline" className="h-12 px-8 rounded-xl font-black gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                           {t('best_sellers.view_all')}
                           <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
                        </Button>
                     </Link>
                  </div>
               </ScrollReveal>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.length > 0 ? products.map((item: Product, i: number) => (
                     <ScrollReveal key={item._id} direction="up" delay={i * 100}>
                        <Card className="group flex flex-col bg-card hover:shadow-2xl hover:border-primary/50 transition-all duration-500 rounded-3xl overflow-hidden border-border/50 h-full relative cursor-pointer">
                           <button className="absolute top-4 left-4 z-20 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                              <Icons.Star className="w-4 h-4" />
                           </button>

                           <div className="aspect-square bg-secondary relative overflow-hidden flex items-center justify-center p-8">
                              {item.imageCover ? (
                                 <img src={item.imageCover} alt={getLocalizedValue(item.title, locale)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                 <Icons.Package className="w-24 h-24 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                              )}
                              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                                 <Link href={`/products/${item._id}`}>
                                    <Button className="w-full bg-foreground text-background hover:bg-primary font-black shadow-xl">
                                       <Icons.ShoppingCart className="w-4 h-4 ml-2" /> {t('common.add_to_cart')}
                                    </Button>
                                 </Link>
                              </div>
                           </div>

                           <div className="p-6 flex flex-col grow">
                              <div className="text-xs font-black text-muted-foreground mb-2">
                                 {typeof item.category === 'object' && item.category && 'name' in item.category ? getLocalizedValue((item.category as any).name, locale) : ''}
                              </div>
                              <h3 className="text-lg font-black text-foreground mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                 {getLocalizedValue(item.title, locale)}
                              </h3>

                              <div className="mt-auto flex items-end justify-between pt-4 border-t border-border/50">
                                 <div className="flex flex-col gap-1">
                                    <div className="flex text-warning">
                                       {[1, 2, 3, 4, 5].map(s => <Icons.Star key={s} className="w-3 h-3 fill-current" />)}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">{t('best_sellers.reviews_label')}</span>
                                 </div>
                                 <div className="text-xl font-black text-foreground">
                                    {item.priceRange?.min || 0} <span className="text-sm text-muted-foreground">{t('common.currency')}</span>
                                 </div>
                              </div>
                           </div>
                        </Card>
                     </ScrollReveal>
                  )) : (
                     [1, 2, 3, 4].map((i: number) => (
                        <div key={i} className="aspect-square bg-secondary animate-pulse rounded-3xl" />
                     ))
                  )}
               </div>
            </div>
         </section>

         {/* 5. PROMOTIONAL BANNER */}
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
                              {t('promo.badge')}
                           </div>
                           <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                              {t('promo.title')}
                           </h2>
                           <p className="text-xl text-background/80 font-medium">
                              {t('promo.description')}
                           </p>
                        </div>
                        <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                           <Link href="/contact" className="w-full sm:w-auto">
                              <Button className="w-full h-16 px-10 rounded-2xl bg-warning hover:bg-warning/90 text-warning-foreground font-black text-lg gap-3 shadow-xl">
                                 {t('promo.cta_quote')}
                                 <Icons.FileText className="w-5 h-5" />
                              </Button>
                           </Link>
                           <Link href="/contact" className="w-full sm:w-auto">
                              <Button variant="outline" className="w-full h-16 px-10 rounded-2xl border-background/20 hover:bg-background/10 text-background font-black text-lg gap-3">
                                 {t('promo.cta_catalog')}
                                 <Icons.Download className="w-5 h-5" />
                              </Button>
                           </Link>
                        </div>
                     </div>
                  </div>
               </ScrollReveal>
            </div>
         </section>

         {/* 6. WHY CHOOSE US & STATS */}
         <section className="py-24 bg-secondary/50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <ScrollReveal direction="right">
                     <div className="space-y-8">
                        <div className="space-y-4 text-center md:text-start">
                           <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{t('why.title')}</h2>
                           <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                              {t('why.description')}
                           </p>
                        </div>

                        <div className="space-y-4 pt-4">
                           {[
                              { title: t('why.features.quality.title'), desc: t('why.features.quality.desc'), icon: Icons.Shield },
                              { title: t('why.features.pricing.title'), desc: t('why.features.pricing.desc'), icon: Icons.TrendingUp },
                              { title: t('why.features.logistics.title'), desc: t('why.features.logistics.desc'), icon: Icons.Truck },
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
                              <p className="font-black text-muted-foreground uppercase tracking-widest text-xs sm:text-sm">{t('stats.years')}</p>
                           </Card>
                           <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-warning border-none shadow-lg text-center flex flex-col items-center justify-center aspect-square text-warning-foreground hover:scale-105 transition-transform">
                              <p className="text-4xl sm:text-5xl font-black mb-2"><CountUp end={500} />+</p>
                              <p className="font-black opacity-80 uppercase tracking-widest text-xs sm:text-sm">{t('stats.projects')}</p>
                           </Card>
                        </div>
                        <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-12">
                           <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-foreground border-none shadow-lg text-center flex flex-col items-center justify-center aspect-square text-background hover:scale-105 transition-transform">
                              <p className="text-4xl sm:text-5xl font-black mb-2"><CountUp end={50} />+</p>
                              <p className="font-black opacity-80 uppercase tracking-widest text-xs sm:text-sm">{t('stats.partners')}</p>
                           </Card>
                           <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-card border-border/50 shadow-lg text-center flex flex-col items-center justify-center aspect-square hover:border-primary/50 transition-colors">
                              <p className="text-4xl sm:text-5xl font-black text-primary mb-2"><CountUp end={100} />%</p>
                              <p className="font-black text-muted-foreground uppercase tracking-widest text-xs sm:text-sm">{t('stats.quality')}</p>
                           </Card>
                        </div>
                     </div>
                  </ScrollReveal>
               </div>
            </div>
         </section>

         {/* 7. CUSTOMER TESTIMONIALS */}
         <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <ScrollReveal>
                  <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                     <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{t('testimonials.title')}</h2>
                     <p className="text-lg text-muted-foreground font-medium">{t('testimonials.description')}</p>
                  </div>
               </ScrollReveal>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                     { text: "تعاملنا مع سكاي جالاكسي في توريد مواد العزل لمشروعنا السكني الأخير. التزام بالمواعيد وجودة المواد كانت ممتازة جداً. نوصي بالتعامل معهم بشدة.", name: "المهندس أحمد", role: "مدير مشروع - شركة مقاولات" },
                     { text: "أفضل أسعار الجملة في السوق بلا منازع، بالإضافة إلى التجاوب السريع من فريق المبيعات. منتجات الإيبوكسي لديهم ذات جودة استثنائية.", name: "محمد العتيبي", role: "مؤسسة تطوير عقاري" },
                     { text: "تجربة تسوق ممتازة، الكتالوج الفني ساعدنا كثيراً في اختيار المواد الصحيحة، وسرعة التوصيل أنقذت الجدول الزمني للمشروع.", name: "سالم الدوسري", role: "مهندس استشاري" }
                  ].map((testimonial, i) => (
                     <ScrollReveal key={i} delay={i * 100} className="h-full">
                        <Card className="p-8 bg-secondary/50 rounded-3xl border border-border/50 shadow-sm relative h-full flex flex-col hover:shadow-xl transition-shadow">
                           <Icons.Activity className="absolute top-6 left-6 w-10 h-10 text-muted-foreground/10 rotate-180" />
                           <div className="flex gap-1 text-warning mb-6">
                              {[1, 2, 3, 4, 5].map(s => <Icons.Star key={s} className="w-4 h-4 fill-current" />)}
                           </div>
                           <p className="text-foreground/80 font-medium leading-relaxed mb-8 italic grow">
                              "{testimonial.text}"
                           </p>
                           <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border/50">
                              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-lg">
                                 {testimonial.name.charAt(0)}
                              </div>
                              <div>
                                 <h4 className="font-black text-foreground">{testimonial.name}</h4>
                                 <p className="text-xs font-black text-muted-foreground">{testimonial.role}</p>
                              </div>
                           </div>
                        </Card>
                     </ScrollReveal>
                  ))}
               </div>
            </div>
         </section>

         {/* 8. FEATURED PROJECTS (Dark Mode) */}
         <SectionDivider inverted />
         <section className="dark py-24 bg-background text-foreground overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-16 text-center md:text-start">
                  <div className="space-y-4">
                     <p className="text-warning font-black text-sm tracking-[0.2em] uppercase">{t('projects.badge')}</p>
                     <h2 className="text-4xl md:text-5xl font-black tracking-tight">{t('projects.title')}</h2>
                  </div>
                  <Link href="/projects" className="group flex items-center gap-4 text-white hover:text-primary transition-colors font-black">
                     {t('projects.view_all')} <div className="w-12 h-px bg-border group-hover:w-20 group-hover:bg-primary transition-all hidden md:block" />
                  </Link>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                     { name: 'تطوير أبراج العليا', desc: 'توريد مواد العزل الحراري لكامل الواجهات.', year: '2024' },
                     { name: 'مشروع البحر الأحمر', desc: 'توريد أنظمة العزل المائي للأساسات والمطاعم.', year: '2023' },
                     { name: 'مستشفى الملك فهد', desc: 'تجهيز الأرضيات بالإيبوكسي المقاوم للبكتيريا.', year: '2023' },
                  ].map((project, i) => (
                     <ScrollReveal key={i} delay={i * 100}>
                        <Card className="p-4 border-white/10 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500 rounded-4xl overflow-hidden group bg-white/5 backdrop-blur-md cursor-pointer">
                           <div className="aspect-video bg-white/5 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center">
                              <Icons.Package className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           </div>
                           <div className="px-4 pb-4 text-center md:text-start">
                              <h3 className="text-xl font-black text-white mb-2">{project.name}</h3>
                              <p className="text-white/60 text-sm font-medium mb-6">{project.desc}</p>
                              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full">{project.year}</span>
                                 <Icons.ChevronRight className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors rtl:rotate-180" />
                              </div>
                           </div>
                        </Card>
                     </ScrollReveal>
                  ))}
               </div>
            </div>
         </section>
      </div>
   );
}
