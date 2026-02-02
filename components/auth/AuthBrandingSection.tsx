import { getTranslations } from 'next-intl/server';
import { Zap, ShieldCheck, Lock, UserPlus, Sparkles, Mail } from 'lucide-react';

type AuthType = 'login' | 'signup' | 'forgot-password';

interface AuthBrandingSectionProps {
  locale: string;
  isRTL: boolean;
  type: AuthType;
}

export default async function AuthBrandingSection({ locale, isRTL, type }: AuthBrandingSectionProps) {
  const t = await getTranslations({ locale, namespace: 'auth' });

  // Configuration for different auth types
  const configs = {
    login: {
      bgGradient: "from-primary-950 via-primary-900 to-secondary-950",
      orbs: [
        { className: "top-[-20%] left-[-10%] bg-gradient-to-br from-blue-500/30 to-indigo-600/20", duration: "8s", delay: "0s" },
        { className: "bottom-[-20%] right-[-10%] bg-gradient-to-tl from-primary-500/30 to-purple-600/20", duration: "10s", delay: "2s" },
        { className: "top-1/2 left-1/2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20", duration: "12s", delay: "4s" }
      ],
      badgeGradient: "from-blue-400 to-primary-500",
      badgeShadow: "shadow-primary/20",
      badgeSubtitle: t('dashboardPortal'),
      heading: t('unlockYourPotential'),
      headingGradientText: t('startManaging'),
      headingGradient: "from-blue-300 via-indigo-300 to-primary-300",
      description: t('platformDescription'),
      features: [
        { icon: Zap, iconColor: "text-yellow-400", label: t('instantAccess') },
        { icon: ShieldCheck, iconColor: "text-green-400", label: t('secureLogin') },
        { icon: Lock, iconColor: "text-blue-400", label: t('dataProtected') }
      ]
    },
    signup: {
      bgGradient: "from-emerald-950 via-green-900 to-secondary-950",
      orbs: [
        { className: "top-[-20%] left-[-10%] bg-gradient-to-br from-emerald-500/30 to-green-600/20", duration: "8s", delay: "0s" },
        { className: "bottom-[-20%] right-[-10%] bg-gradient-to-tl from-teal-500/30 to-cyan-600/20", duration: "10s", delay: "2s" },
        { className: "top-1/2 left-1/2 bg-gradient-to-r from-lime-500/20 to-green-500/20", duration: "12s", delay: "4s" }
      ],
      badgeGradient: "from-emerald-400 to-green-500",
      badgeShadow: "shadow-emerald-500/20",
      badgeSubtitle: t('joinToday'),
      heading: t('joinOurCommunity'),
      headingGradientText: t('growYourBusiness'),
      headingGradient: "from-emerald-300 via-green-300 to-teal-300",
      description: t('signupPlatformDescription'),
      features: [
        { icon: UserPlus, iconColor: "text-emerald-400", label: t('freeToStart') },
        { icon: ShieldCheck, iconColor: "text-green-400", label: t('secureSetup') },
        { icon: Sparkles, iconColor: "text-teal-400", label: t('noCredit') }
      ]
    },
    'forgot-password': {
      bgGradient: "from-primary-950 via-primary-900 to-secondary-950",
      orbs: [
        { className: "top-[-20%] left-[-10%] bg-gradient-to-br from-amber-500/30 to-orange-600/20", duration: "8s", delay: "0s" },
        { className: "bottom-[-20%] right-[-10%] bg-gradient-to-tl from-orange-500/30 to-red-600/20", duration: "10s", delay: "2s" },
        { className: "top-1/2 left-1/2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20", duration: "12s", delay: "4s" }
      ],
      badgeGradient: "from-amber-400 to-orange-500",
      badgeShadow: "shadow-amber-500/20",
      badgeSubtitle: t('accountRecovery'),
      heading: t('secureYourAccount'),
      headingGradientText: t('restoringAccess'),
      headingGradient: "from-amber-300 via-orange-300 to-yellow-300",
      description: t('secureRecoveryDescription'),
      features: [
        { icon: ShieldCheck, iconColor: "text-amber-400", label: t('secureVerification') },
        { icon: Mail, iconColor: "text-orange-400", label: t('emailProtected') },
        { icon: Lock, iconColor: "text-yellow-400", label: t('encryptedData') }
      ]
    }
  };

  const config = configs[type];

  return (
    <section className={`hidden lg:flex relative bg-gradient-to-br ${config.bgGradient} items-center justify-center overflow-hidden`}>
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {config.orbs.map((orb, idx) => (
          <div 
            key={idx}
            className={`absolute w-[70%] h-[70%] rounded-full blur-[140px] animate-pulse ${orb.className}`} 
            style={{ animationDuration: orb.duration, animationDelay: orb.delay }} 
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />
      
      <div className={`relative z-10 px-12 text-center max-w-2xl ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Logo Badge */}
        <div className={`inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/20 mb-12 shadow-2xl ${config.badgeShadow} animate-in slide-in-from-top-4 duration-700 hover:scale-105 transition-transform`}>
          <div className={`w-12 h-12 bg-gradient-to-br ${config.badgeGradient} rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-white/20 text-xl`}>
            S
          </div>
          <div className="text-left">
            <span className="text-white font-black tracking-wider text-lg block">Sky Galaxy</span>
            <span className="text-white/70 text-xs font-medium">{config.badgeSubtitle}</span>
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight animate-in slide-in-from-bottom-6 duration-700 delay-100">
          {config.heading}
          <br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${config.headingGradient} animate-gradient`}>
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
            <div key={idx} className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-5 py-3 rounded-full border border-white/10 hover:bg-white/10 transition-all group">
              <feature.icon className={`w-5 h-5 ${feature.iconColor} group-hover:scale-110 transition-transform`} />
              <span className="text-white/90 text-sm font-semibold">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Conditional Sections */}
        {type === 'login' && <DashboardPreviewCards t={t} />}
        {type === 'signup' && <SignupBenefits t={t} />}

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-10 w-20 h-20 border-2 border-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-20 right-20 w-16 h-16 border-2 border-white/10 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>
    </section>
  );
}

// Sub-components for specific page elements
function DashboardPreviewCards({ t }: { t: any }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-12 animate-in slide-in-from-bottom-12 duration-700 delay-400">
      <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">+24.5%</span>
        </div>
        <p className="text-2xl font-black text-white tracking-tight">$12,450</p>
        <p className="text-slate-400 text-xs font-medium mt-1">{t('branding.totalRevenue')}</p>
      </div>

      <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-blue-400 text-xs font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg">New</span>
        </div>
        <p className="text-2xl font-black text-white tracking-tight">1,204</p>
        <p className="text-slate-400 text-xs font-medium mt-1">{t('branding.activeOrders')}</p>
      </div>
    </div>
  );
}

function SignupBenefits({ t }: { t: any }) {
  return (
    <div className="mt-12 space-y-4 text-left max-w-md mx-auto animate-in slide-in-from-bottom-12 duration-700 delay-400">
      <BenefitItem text={t('benefit1')} />
      <BenefitItem text={t('benefit2')} />
      <BenefitItem text={t('benefit3')} />
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 text-white/90">
      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
        ✓
      </span>
      <span className="text-sm font-medium leading-relaxed">{text}</span>
    </div>
  );
}
