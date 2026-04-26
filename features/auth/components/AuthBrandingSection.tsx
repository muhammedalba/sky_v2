import { getTranslations } from 'next-intl/server';
import { Truck, Construction, ShieldCheck, Star, Package, Lock, Mail, Droplets, LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  BenefitItem, 
  FeaturePill, 
  PreviewStatCard 
} from './BrandingComponents';
import { AuthMobileLogo } from './AuthSharedComponents';

type AuthType = 'login' | 'signup' | 'forgot-password';

interface OrbConfig {
  className: string;
  duration: string;
  delay: string;
}

interface FeatureConfig {
  icon: LucideIcon;
  iconColor: string;
  label: string;
}

interface AuthBrandingConfig {
  bgGradient: string;
  orbs: OrbConfig[];
  badgeShadow: string;
  badgeSubtitle: string;
  heading: string;
  headingGradientText: string;
  headingGradient: string;
  description: string;
  features: FeatureConfig[];
}

interface AuthBrandingSectionProps {
  locale: string;
  isRTL: boolean;
  type: AuthType;
}

/**
 * AuthBrandingSection - A server-side component that renders the branding sidebar for authentication pages.
 * Improved for maintainability, type safety, and code clarity.
 */
export default async function AuthBrandingSection({ locale, isRTL, type }: AuthBrandingSectionProps) {
  const t = await getTranslations({ locale, namespace: 'auth' });

  // Configuration for different auth types
  const configs: Record<AuthType, AuthBrandingConfig> = {
    login: {
      bgGradient: "from-primary/10 to-secondary/10",
      orbs: [
        { className: "top-[-20%] left-[-10%] bg-gradient-to-br from-info/20 to-primary/40", duration: "8s", delay: "0s" },
        { className: "bottom-[-20%] right-[-10%] bg-gradient-to-tl from-secondary/20 to-info/20", duration: "10s", delay: "2s" },
        { className: "top-1/2 left-1/2 bg-gradient-to-r from-info/10 to-secondary/20", duration: "12s", delay: "4s" }
      ],
      badgeShadow: "shadow-primary/20",
      badgeSubtitle: t('constructionPortal') || "رواد حلول الإنشاء والعزل",
      heading: t('protectionThatLasts') || "حماية تدوم.",
      headingGradientText: t('confidenceInEveryLayer') || "ثقة في كل طبقة.",
      headingGradient: "from-info via-success/30 to-primary",
      description: t('constructionDescription') || "وجهتكم المتخصصة لأحدث حلول العوازل المائية، مواد الجدران، ومستلزمات الإنشاءات بأعلى معايير الجودة العالمية.",
      features: [
        { icon: Droplets, iconColor: "text-warning", label: t('waterproofing') || "عزل مائي متطور" },
        { icon: ShieldCheck, iconColor: "text-success", label: t('materialWarranty') || "ضمان المواد" },
        { icon: Truck, iconColor: "text-info", label: t('siteDelivery') || "توصيل للمواقع" }
      ]
    },
    signup: {
      bgGradient: "from-info/10 to-info/10",
      orbs: [
        { className: "top-[-20%] left-[-10%] bg-gradient-to-br from-success/10 to-info/10", duration: "8s", delay: "0s" },
        { className: "bottom-[-20%] right-[-10%] bg-gradient-to-tl from-success/10 to-secondary/20", duration: "10s", delay: "2s" },
        { className: "top-1/2 left-1/2 bg-gradient-to-r from-success/10 to-secondary/20", duration: "12s", delay: "4s" }
      ],
      badgeShadow: "shadow-success/20",
      badgeSubtitle: t('proNetwork') || "شبكة المحترفين",
      heading: t('projectPricing') || "أسعار خاصة.",
      headingGradientText: t('forContractors') || "للمقاولين والملاك.",
      headingGradient: "from-success/80 via-success to-info",
      description: t('signupConstructionDescription') || "انضم إلينا للحصول على عروض حصرية للمشاريع، استشارات فنية متخصصة، وتوريد مباشر لمواد الإنشاء.",
      features: [
        { icon: Construction, iconColor: "text-info", label: t('technicalSupport') || "دعم فني هندسي" },
        { icon: Package, iconColor: "text-success", label: t('bulkOrders') || "طلبيات الجملة" },
        { icon: Star, iconColor: "text-warning", label: t('premiumQuality') || "جودة معتمدة" }
      ]
    },
    'forgot-password': {
      bgGradient: "from-primary/10 to-secondary/10",
      orbs: [
        { className: "top-[-20%] left-[-10%] bg-gradient-to-br from-primary/30 to-primary/20", duration: "8s", delay: "0s" },
        { className: "bottom-[-20%] right-[-10%] bg-gradient-to-tl from-primary/30 to-primary/20", duration: "10s", delay: "2s" },
        { className: "top-1/2 left-1/2 bg-gradient-to-r from-primary/20 to-primary/20", duration: "12s", delay: "4s" }
      ],
      badgeShadow: "shadow-warning/20",
      badgeSubtitle: t('accountRecovery'),
      heading: t('secureYourAccount'),
      headingGradientText: t('restoringAccess'),
      headingGradient: "from-warning via-warning/80 to-warning/60",
      description: t('secureRecoveryDescription'),
      features: [
        { icon: ShieldCheck, iconColor: "text-warning", label: t('secureVerification') },
        { icon: Mail, iconColor: "text-info", label: t('emailProtected') },
        { icon: Lock, iconColor: "text-success", label: t('encryptedData') }
      ]
    }
  };

  const config = configs[type];

  return (
    <section className={cn(
      "hidden lg:flex relative items-center justify-center overflow-hidden bg-linear-to-br pb-5",
      config.bgGradient
    )}>
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {config.orbs.map((orb, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute w-[70%] h-[70%] rounded-full blur-[140px] animate-pulse",
              orb.className
            )}
            style={{ animationDuration: orb.duration, animationDelay: orb.delay }}
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

      <div className={cn(
        "relative z-10 px-12 mt-16 text-center max-w-2xl",
        isRTL ? "rtl" : "ltr"
      )}>
        {/* Logo Badge */}
        <div className={cn(
          "inline-flex flex-col items-center px-8 py-4 mb-5   transition-transform",
          config.badgeShadow
        )}>
          {/* auth logo image */}
          <AuthMobileLogo subtitle={config.badgeSubtitle} />

        </div>

        {/* Main Heading */}
        <h2 className="text-5xl lg:text-5xl font-black text-foreground/70 mb-8 leading-tight tracking-tight animate-in slide-in-from-bottom-6 duration-700 delay-100">
          {config.heading}
          <br />
          <span className={cn(
            "text-transparent bg-clip-text bg-linear-to-r animate-gradient py-4",
            config.headingGradient
          )}>
            {config.headingGradientText}
          </span>
        </h2>

        {/* Description */}
        <p className="text-secondary-300 text-lg lg:text-xl font-medium leading-relaxed mb-12 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          {config.description}
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-4 justify-center animate-in slide-in-from-bottom-10 duration-700 delay-300">
          {config.features.map((feature, idx) => (
            <FeaturePill 
              key={idx}
              icon={feature.icon}
              label={feature.label}
              iconColor={feature.iconColor}
              className="px-5 py-3 bg-foreground/5"
            />
          ))}
        </div>

        {/* Conditional Sections */}
        {type === 'login' && <DashboardPreviewCards t={t} />}
        {type === 'signup' && <SignupBenefits t={t} />}

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-10 w-20 h-20 border border-foreground/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-20 right-20 w-16 h-16 border border-foreground/10 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>
    </section>
  );
}

// Sub-components for specific page elements
function DashboardPreviewCards({ t }: { t: (key: string) => string }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-12 animate-in slide-in-from-bottom-12 duration-700 delay-400">
      <PreviewStatCard 
        icon={Truck}
        badgeText={t('express') || "سريع"}
        value="24h"
        label={t('averageDelivery') || "متوسط التوصيل"}
        color="success"
      />
      <PreviewStatCard 
        icon={Star}
        badgeText="4.9/5"
        value="+50k"
        label={t('happyCustomers') || "عميل سعيد"}
        color="info"
      />
    </div>
  );
}

function SignupBenefits({ t }: { t: (key: string) => string }) {
  return (
    <div className="mt-12 space-y-4 text-left max-w-md mx-auto animate-in slide-in-from-bottom-12 duration-700 delay-400">
      <BenefitItem text={t('benefit1')} />
      <BenefitItem text={t('benefit2')} />
      <BenefitItem text={t('benefit3')} />
    </div>
  );
}
