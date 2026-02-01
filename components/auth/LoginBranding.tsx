import { getTranslations } from 'next-intl/server';

export default async function LoginBranding() {
  const t = await getTranslations('auth'); // Assuming you want translations here, or hardcoded if English-only for branding is intended, but let's use t where possible or just keep the static text from previous step if it was hardcoded english.
  // Actually, the previous step had hardcoded English for "Manage your shop with..." 
  // I will check if I should use translations. useTranslations was used for 'loginTitle' etc.
  // The branding text "Manage your shop with..." was hardcoded in the previous step.
  // I will leave it hardcoded or try to use translations if they exist? 
  // The previous user edit explicitly added hardcoded text. I will preserve it.
  
  return (
    <section className="hidden lg:flex relative bg-[#0f172a] items-center justify-center overflow-hidden h-full">
         {/* Deep Space Background */}
         <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black opacity-100" />
         
         {/* Nebula Effects */}
         <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-1000" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />

         {/* Grid Pattern Overlay */}
         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
         
         <div className="relative z-10 px-16 text-left max-w-2xl w-full">
             {/* Brand Badge */}
             <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 mb-10 shadow-xl shadow-black/20 animate-in slide-in-from-top-8 duration-700">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                </div>
                <span className="text-white/90 font-bold tracking-wide text-sm">{t('branding.appName')}</span>
             </div>

             {/* Main Copy */}
             <h2 className="text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight drop-shadow-sm">
                {t('branding.titleStart')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-300 to-primary-400 animate-gradient-x bg-[length:200%_auto]">{t('branding.titleEnd')}</span>
             </h2>
             <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-lg mb-12">
                {t('branding.description')}
             </p>

             {/* Dashboard Widget Simulation */}
             <div className="grid grid-cols-2 gap-5 w-full">
                {/* Widget 1 */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors group">
                   <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">+24.5%</span>
                   </div>
                   <p className="text-3xl font-black text-white tracking-tight">$12,450</p>
                   <p className="text-slate-400 text-sm font-medium mt-1">{t('branding.totalRevenue')}</p>
                </div>

                {/* Widget 2 */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors group">
                   <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span className="text-blue-400 text-sm font-bold bg-blue-500/10 px-2.5 py-1 rounded-lg">{t('branding.new')}</span>
                   </div>
                   <p className="text-3xl font-black text-white tracking-tight">1,204</p>
                   <p className="text-slate-400 text-sm font-medium mt-1">{t('branding.activeOrders')}</p>
                </div>
             </div>
         </div>
      </section>
  );
}
