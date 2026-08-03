'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { useSettings } from '@/app/providers/SettingsProvider';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { FacebookIcon, HeadphoneIcon, InstagramIcon, LinkedInBrandIcon, MailIcon, MapPinIcon, PhoneIcon, ShieldIcon, TikTokBrandIcon, TruckIcon, WhatsAppIcon, XIcon, YoutubeIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from '@/shared/ui/ScrollReveal';




export default function StoreFooter() {
  const t = useTranslations('store.footer');
  const navT = useTranslations('store.nav');
  const locale = useLocale();
  const settings = useSettings();
  const currentYear = new Date().getFullYear();

  const siteName = settings.siteName?.[locale as 'ar' | 'en'] || 'Sky Galaxy';
  const socialLinks = settings.socialLinks || {};

  return (
    <footer className="relative border-t border-border/40 bg-linear-to-b from-background to-muted/20 text-foreground pt-16 pb-4 overflow-hidden transition-all duration-300">
      
      {/* Visual background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <ScrollReveal animation='fade' className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Step 1: Premium Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 mb-12 border-b border-border/50">
          
          <ScrollReveal animation='slide-left' className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-xl bg-warning/10 text-warning border border-warning/20">
              <TruckIcon className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                {locale === 'ar' ? 'شحن سريع وموثوق' : 'Fast & Secure Shipping'}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">
                {locale === 'ar' ? 'توصيل سريع وآمن لجميع المناطق' : 'Express delivery to your doorstep'}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation='slide-up' className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldIcon  className="h-6 w-6 text-success" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                {locale === 'ar' ? 'ضمان وأمان 100%' : '100% Secure Checkout'}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">
                {locale === 'ar' ? 'بياناتك مشفرة وحقوقك محفوظة بالكامل' : 'Encrypted transactions & buyers protection'}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation='slide-right' className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <HeadphoneIcon  className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                {locale === 'ar' ? 'دعم فني متواصل 24/7' : 'Premium Support 24/7'}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">
                {locale === 'ar' ? 'مستعدون لمساعدتك بأي وقت' : 'Dedicated team to assist you anytime'}
              </p>
            </div>
          </ScrollReveal>

        </div>

        {/* Step 2: Main Footer Link Grid */}
        <ScrollReveal  animation='slide-up' className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-12">
          
          {/* Brand Info (col-span-4) */}
          <ScrollReveal  animation='slide-up' className="md:col-span-4 flex flex-col gap-5">
            <Link href="/home" className="flex items-center gap-3 w-fit group">
              <div className="relative p-1 rounded-xl bg-card border border-border/60 shadow-sm group-hover:border-primary/30 transition-all duration-300">
                <ImageWithFallback
                  src={settings.logo || "/assets/images/auth-logo.png"}
                  alt={siteName}
                  width={42}
                  height={42}
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-500 pointer-events-none" />
              </div>
              <span className="text-xl font-black tracking-tight title-gradient group-hover:text-primary transition-colors duration-300">
                {siteName}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
               {settings.metaDescription?.[locale as 'ar' | 'en'] || "Premium industrial products and electronic components."}
            </p>
            
            {/* Social Icons with hover glow effects */}
            <div className="flex flex-wrap items-center gap-2.5 mt-2">
               {socialLinks.facebook && (
                 <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                   <FacebookIcon className="w-4 h-4 text-primary" />
                 </a>
               )}
               {socialLinks.instagram && (
                 <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                   <InstagramIcon className="w-4 h-4 text-destructive" />
                 </a>
               )}
               {socialLinks.twitter && (
                 <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                   <XIcon className="w-4 h-4 text-primary" />
                 </a>
               )}
               {socialLinks.linkedin && (
                 <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                   <LinkedInBrandIcon className="w-4 h-4 text-primary" />
                 </a>
               )}
               {socialLinks.youtube && (
                 <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                   <YoutubeIcon className="w-4 h-4 text-destructive" />
                 </a>
               )}
               {socialLinks.tiktok && (
                 <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok" className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                   <TikTokBrandIcon className="w-4 h-4 " />
                 </a>
               )}
               {socialLinks.whatsapp && (
                 <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                   <WhatsAppIcon className="w-4 h-4 text-success" />
                 </a>
               )}
            </div>
          </ScrollReveal>

          {/* Quick Links (col-span-2) */}
          <ScrollReveal  animation='slide-up' className="md:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider relative pb-2 w-fit">
              {t('quickLinks')}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <Link href="/home" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-300">
                  &middot; {navT('home')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-300">
                  &middot; {navT('products')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-300">
                  &middot; {navT('contact')}
                </Link>
              </li>
            </ul>
          </ScrollReveal>

          {/* Support Info (col-span-3) */}
          <ScrollReveal  animation='slide-up' className="md:col-span-3 flex flex-col gap-4">
             <h4 className="font-bold text-foreground text-xs uppercase tracking-wider relative pb-2 w-fit">
               {t('support')}
               <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
             </h4>
             <ul className="space-y-3 font-medium">
               {settings.contactInfo?.phones?.[0] && (
                 <li className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground group">
                   <div className="p-1.5 rounded-lg bg-card border border-border group-hover:border-primary/35 transition-colors">
                     <PhoneIcon className="w-3.5 h-3.5 text-primary" />
                   </div>
                   <span>{settings.contactInfo.phones[0]}</span>
                 </li>
               )}
               {settings.contactInfo?.email && (
                 <li className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground group min-w-0">
                   <div className="p-1.5 rounded-lg bg-card border border-border group-hover:border-primary/35 transition-colors shrink-0">
                     <MailIcon className="w-3.5 h-3.5 text-primary" />
                   </div>
                   <span className="truncate">{settings.contactInfo.email}</span>
                 </li>
               )}
                {settings.businessAddress && (
                  <li className="flex items-center  gap-3 text-xs sm:text-sm text-muted-foreground group">
                    <div className="p-1.5 rounded-lg bg-card border border-border group-hover:border-primary/35 transition-colors shrink-0 mt-0.5">
                      <MapPinIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="leading-tight">
                      {[
                        settings.businessAddress.street?.[locale as 'ar' | 'en'],
                        settings.businessAddress.area?.[locale as 'ar' | 'en'],
                        settings.businessAddress.city?.[locale as 'ar' | 'en'],
                        settings.businessAddress.country?.[locale as 'ar' | 'en']
                      ].filter(Boolean).join(', ')}
                    </span>
                  </li>
                )}
             </ul>
          </ScrollReveal>

          {/* Shop Information & Active Settings (col-span-3) */}
          <ScrollReveal  animation='slide-up' className="md:col-span-3 flex flex-col gap-4">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider relative pb-2 w-fit">
              {t('shopInfo')}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            </h4>
            
            <div className="space-y-3 font-medium">
              <div className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'العملة المفعلة' : 'Active Currency'}</span>
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                  {settings.currencySymbol} ({settings.currencyCode})
                </span>
              </div>
              
              {settings.freeShippingThreshold > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">{locale === 'ar' ? 'الشحن المجاني' : 'Free Shipping'}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    &ge; {settings.freeShippingThreshold} {settings.currencySymbol}
                  </span>
                </div>
              )}
            </div>
          </ScrollReveal>

        </ScrollReveal>

        {/* Step 3: Bottom Copyright & Policies Bar */}

        <div className="pt-3 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {currentYear} <span className="font-black text-foreground">{siteName}</span>. {t('rights')}
          </p>
          <div className="flex items-center gap-6 font-semibold">
             <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all">
               {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
             </Link>
             <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all">
               {locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}
             </Link>
          </div>
        </div>

      </ScrollReveal>
    </footer>
  );
}
