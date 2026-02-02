import { getTranslations } from 'next-intl/server';
import { Shield, Lock } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  locale: string;
  isRTL: boolean;
  children: React.ReactNode;
}

export async function AuthMobileLogo({ 
  locale, 
  gradient 
}: { 
  locale: string; 
  gradient: string;
}) {
  const t = await getTranslations({ locale, namespace: 'auth' });
  const subtitle = gradient.includes('emerald') ? t('joinToday') : t('dashboardPortal');

  return (
    <div className="lg:hidden text-center mb-8 flex flex-col items-center animate-in zoom-in-50 duration-500">
      <div className={`w-20 h-20 ${gradient} rounded-[2rem] flex items-center justify-center shadow-2xl mb-4 hover:scale-105 transition-transform`}>
        <span className="text-white font-black text-3xl">S</span>
      </div>
      <h1 className="text-xl font-black text-foreground tracking-tight">Sky Galaxy</h1>
      <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
    </div>
  );
}

export async function AuthTrustIndicators({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'auth' });
  
  return (
    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="font-medium">{t('secureConnection')}</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-2">
        <Lock className="w-3 h-3" />
        <span className="font-medium">{t('dataEncrypted')}</span>
      </div>
    </div>
  );
}

export function AuthFormContainer({ 
  children,
  shadowColor = 'shadow-primary/5'
}: { 
  children: React.ReactNode;
  shadowColor?: string;
}) {
  return (
    <div className={`bg-card/50 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-border/50 shadow-2xl ${shadowColor}`}>
      {children}
    </div>
  );
}

export function AuthBackgroundDecorations({ colors }: { colors: { top: string; bottom: string } }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute top-[5%] right-[5%] w-[35%] h-[35%] ${colors.top} rounded-full blur-[100px]`} />
      <div className={`absolute bottom-[5%] left-[5%] w-[30%] h-[30%] ${colors.bottom} rounded-full blur-[80px]`} />
    </div>
  );
}

export function AuthHeader({ 
  title, 
  description,
  className = "" 
}: { 
  title: string; 
  description: string;
  className?: string;
}) {
  return (
    <div className={`text-center space-y-2 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">{title}</h1>
      <p className="text-muted-foreground text-base">{description}</p>
    </div>
  );
}

export function AuthFooter({ 
  text, 
  linkText, 
  linkHref,
  className = "" 
}: { 
  text: string; 
  linkText: string; 
  linkHref: string;
  className?: string;
}) {
  return (
    <footer className={`text-center pt-4 border-t border-border/50 ${className}`}>
      <p className="text-muted-foreground/80 text-sm font-medium">
        {text}{' '}
        <Link
          href={linkHref}
          className="text-primary font-bold hover:underline underline-offset-4 transition-all"
        >
          {linkText}
        </Link>
      </p>
    </footer>
  );
}
