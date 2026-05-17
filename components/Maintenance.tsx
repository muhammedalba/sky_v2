'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { useSettings } from '@/app/providers/SettingsProvider';
import { Icons } from '@/shared/ui/Icons';

export default function Maintenance() {
  const t = useTranslations('maintenance');
  const locale = useLocale();
  const settings = useSettings();

  const customMessage = settings.maintenanceMessage?.[locale as 'ar' | 'en'] || t('description');
  const storeName = settings.siteName?.[locale as 'ar' | 'en'] || 'SkyGalaxy';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-white flex items-center justify-center p-4 overflow-hidden relative selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/15 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/15 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700 pointer-events-none" />
      
      {/* Subtle High-Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <div className="max-w-3xl w-full text-center relative z-10 space-y-12 py-10">
        {/* Live System Status Ticker */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-bold shadow-lg shadow-amber-500/5 animate-fade-in backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span>{t('estimatedTime')}</span>
        </div>

        {/* Animated Icon Header */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl animate-pulse opacity-50" />
          <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-10 rounded-[3rem] shadow-2xl shadow-slate-300/40 dark:shadow-2xl flex items-center justify-center group hover:scale-105 transition-transform duration-500">
            <Icons.Settings className="w-24 h-24 text-primary animate-[spin_12s_linear_infinite]" />
            <div className="absolute -bottom-3 -right-3 bg-slate-900 dark:bg-primary text-white rounded-2xl p-3.5 border-4 border-white dark:border-slate-950 shadow-xl group-hover:rotate-12 transition-transform duration-300">
              <Icons.Warning className="w-8 h-8 text-amber-400 dark:text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-6 max-w-2xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            <span className=" title-gradient ">
              {t('title')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl mx-auto backdrop-blur-xs py-1">
            {customMessage}
          </p>
        </div>

        {/* Status & Support Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto px-4">
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-7 rounded-3xl flex items-center gap-5 text-start shadow-xl shadow-slate-200/40 dark:shadow-none hover:bg-white/90 dark:hover:bg-white/10 hover:translate-y-[-2px] transition-all duration-300 group">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icons.Clock className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">{t('status')}</p>
              <p className="text-base font-bold text-foreground/70">{t('estimatedTime')}</p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-7 rounded-3xl flex items-center gap-5 text-start shadow-xl shadow-slate-200/40 dark:shadow-none hover:bg-white/90 dark:hover:bg-white/10 hover:translate-y-[-2px] transition-all duration-300 group">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icons.MessageCircle className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">{t('support')}</p>
              <p className="text-base font-black text-foreground/70">{t('supportContact')}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-5 px-4">
          <Button 
            className="w-full sm:w-auto rounded-2xl h-16 px-10 font-black shadow-2xl shadow-primary/30 text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            <Icons.RefreshCw className="w-5 h-5 animate-spin-slow" />
            {t('retryBtn')}
          </Button>
          <a 
            href="mailto:support@skygalaxy.com" 
            className="w-full sm:w-auto h-16 px-9 rounded-2xl border border-slate-300 bg-white/60  backdrop-blur-md flex items-center justify-center gap-3 font-bold  text-primary  hover:border-slate-400  transition-all group shadow-lg shadow-slate-200/30"
          >
            <Icons.Mail className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
            {t('contactUs')}
          </a>
        </div>

        {/* Copyright Footer */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 max-w-md mx-auto text-slate-500 dark:text-slate-500 text-sm font-semibold tracking-wide">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </div>
  );
}
