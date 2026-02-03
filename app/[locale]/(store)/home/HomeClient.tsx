'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { Icons } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomeClient() {
  const t = useTranslations('home');

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
           <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
           <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               v2.0 Now Available
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 leading-[1.1] tracking-tight animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
               {t('hero.title').split(' ').map((word, i) => (
                  <span key={i} className={i > 3 ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600" : ""}> {word}</span>
               ))}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
               {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 rounded-full text-base shadow-xl shadow-primary/20">
                  {t('hero.cta_dashboard')}
                  <Icons.Menu className="w-4 h-4 ml-2 rtl:rotate-180" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-full text-base bg-background/50 backdrop-blur-sm">
                 {t('hero.cta_learn_more')}
              </Button>
            </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="mt-20 px-4 relative max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="rounded-xl border border-border/50 bg-secondary/20 p-2 backdrop-blur-sm shadow-2xl">
               <div className="rounded-lg bg-background border border-border/50 overflow-hidden aspect-[16/9] relative">
                  {/* Mock UI Elements */}
                  <div className="absolute inset-x-0 top-0 h-10 border-b border-border/50 bg-muted/20 flex items-center px-4 gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-400/80" />
                     <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                     <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="mt-10 p-8 grid grid-cols-4 gap-6">
                     <div className="col-span-1 space-y-4">
                        <div className="h-8 w-2/3 bg-muted/50 rounded-md" />
                        <div className="h-4 w-full bg-muted/30 rounded-md" />
                        <div className="h-4 w-5/6 bg-muted/30 rounded-md" />
                        <div className="h-40 w-full bg-primary/5 rounded-xl border border-primary/10 mt-8" />
                     </div>
                     <div className="col-span-3 grid grid-cols-3 gap-4">
                        {[1,2,3].map(i => (
                             <div key={i} className="h-32 bg-secondary/30 rounded-xl border border-border/50" />
                        ))}
                        <div className="col-span-3 h-64 bg-secondary/20 rounded-xl border border-border/50 mt-4" />
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { 
                   key: 'secure', 
                   icon: Icons.Users, 
                   class: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                 },
                 { 
                   key: 'stats', 
                   icon: Icons.Dashboard, 
                   class: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" 
                 },
                 { 
                   key: 'global', 
                   icon: Icons.Menu, 
                   class: "text-pink-600 bg-pink-50 dark:bg-pink-900/20" 
                 }
               ].map((feature) => (
                  <Card key={feature.key} className="p-8 border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-background">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.class}`}>
                        <feature.icon className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold mb-3">{t(`features.${feature.key}_title`)}</h3>
                     <p className="text-muted-foreground leading-relaxed">
                       {t(`features.${feature.key}_desc`)}
                     </p>
                  </Card>
               ))}
           </div>
        </div>
      </section>
      
      {/* Featured Products Teaser */}
      <section className="py-24">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-12">{t('featured_products')}</h2>
            <Link href="/products">
               <Button size="lg" variant="secondary" className="rounded-full px-8">
                  View All Products
               </Button>
            </Link>
         </div>
      </section>
    </>
  );
}
