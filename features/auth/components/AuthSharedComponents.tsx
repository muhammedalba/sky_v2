import { getTranslations } from 'next-intl/server';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { FeaturePill } from './BrandingComponents';
import Image from 'next/image';

export function AuthMobileLogo({ subtitle, className = "" }: { subtitle: string, className?: string }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SkyGalaxy';
  return (
    <div className={` text-center mb-1 flex flex-col items-center py-4 ${className}`}>
      <div className="rounded-2xl">
        <Image
          src="/images/auth-logo.png"
          alt={`${appName} Logo`}
          width={200}
          height={150}
          className="object-contain m-auto h-32 w-32 md:h-40 md:w-40 lg:h-56 lg:w-56"
          priority  
        />
        <span className="text-foreground/70 font-black tracking-wider text-lg block mt-2">
          {appName}
        </span>
        <FeaturePill
          label={subtitle}
          className="justify-center p-1 px-2 my-2 bg-success/10"
        />
      </div>
    </div>
  );
}

export async function AuthTrustIndicators({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
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
