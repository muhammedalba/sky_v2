'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { useSettings } from '@/app/providers/SettingsProvider';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { Icons } from '@/shared/ui/Icons';

export default function StoreFooter() {
  const t = useTranslations('store.footer');
  const navT = useTranslations('store.nav');
  const locale = useLocale();
  const settings = useSettings();
  const currentYear = new Date().getFullYear();

  const siteName = settings.siteName?.[locale as 'ar' | 'en'] || 'Sky Galaxy';

  const socialLinks = settings.socialLinks || {};

  return (
    <footer className="border-t border-border/40 bg-muted/30 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link href="/home" className="flex items-center gap-2">
              <ImageWithFallback
                src={settings.logo || "/assets/images/auth-logo.png"}
                alt={siteName}
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-black tracking-tighter text-foreground uppercase">{siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
               {settings.metaDescription?.[locale as 'ar' | 'en'] || "Premium industrial products and electronic components."}
            </p>
            {/* Social Icons */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
               {socialLinks.facebook && (
                 <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" className="p-2 rounded-lg bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all">
                   <Icons.Facebook className="size-4" />
                 </a>
               )}
               {socialLinks.instagram && (
                 <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" className="p-2 rounded-lg bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all">
                   <Icons.MetaBrand className="size-4" />
                 </a>
               )}
               {socialLinks.twitter && (
                 <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="p-2 rounded-lg bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all">
                   <Icons.X className="size-4" />
                 </a>
               )}
               {socialLinks.linkedin && (
                 <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="p-2 rounded-lg bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all">
                   <Icons.LinkedInBrand className="size-4" />
                 </a>
               )}
               {socialLinks.youtube && (
                 <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" className="p-2 rounded-lg bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all">
                   <Icons.Youtube className="size-4" />
                 </a>
               )}
               {socialLinks.tiktok && (
                 <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok" className="p-2 rounded-lg bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all">
                   <Icons.TikTokBrand className="size-4" />
                 </a>
               )}
               {socialLinks.whatsapp && (
                 <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 rounded-lg bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all">
                   <Icons.MessageCircle className="size-4" />
                 </a>
               )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-sm">{t('quickLinks')}</h4>
            <ul className="space-y-3">
              <li><Link href="/home" className="text-sm text-muted-foreground hover:text-primary transition-colors">{navT('home')}</Link></li>
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">{navT('products')}</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{navT('contact')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
             <h4 className="font-bold text-foreground uppercase tracking-wider text-sm">{t('support')}</h4>
             <ul className="space-y-3">
               {settings.contactInfo?.phones?.[0] && (
                 <li className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Icons.Phone className="size-4" />
                   <span>{settings.contactInfo.phones[0]}</span>
                 </li>
               )}
               {settings.contactInfo?.email && (
                 <li className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Icons.Mail className="size-4" />
                   <span className="truncate">{settings.contactInfo.email}</span>
                 </li>
               )}
               {(settings.contactInfo?.[locale === 'ar' ? 'addressAr' : 'addressEn']) && (
                 <li className="flex items-start gap-2 text-sm text-muted-foreground">
                   <Icons.MapPin className="size-4 mt-0.5 shrink-0" />
                   <span className="leading-tight">{settings.contactInfo[locale === 'ar' ? 'addressAr' : 'addressEn']}</span>
                 </li>
               )}
             </ul>
          </div>

          {/* Features / Currencies */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-sm">{t('shopInfo')}</h4>
            <div className="flex flex-wrap gap-2">
               <div className="px-3 py-1.5 rounded-full bg-accent/50 border border-border/50 text-[10px] font-bold text-muted-foreground uppercase">
                 {settings.currencyCode} ({settings.currencySymbol})
               </div>
               {settings.freeShippingThreshold > 0 && (
                 <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 uppercase">
                   Free over {settings.freeShippingThreshold} {settings.currencySymbol}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {siteName}. {t('rights')}
          </p>
          <div className="flex items-center gap-6">
             <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
             <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
