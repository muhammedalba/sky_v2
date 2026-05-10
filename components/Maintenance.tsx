'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Settings, Hammer, Clock, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useSettings } from '@/app/providers/SettingsProvider';

export default function Maintenance() {
  const t = useTranslations('maintenance');
  const locale = useLocale();
  const settings = useSettings();

  const customMessage = settings.maintenance?.message?.[locale as 'ar' | 'en'] || t('description');

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="max-w-2xl w-full text-center relative z-10 space-y-12">
        {/* Animated Icon Header */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-ping opacity-20" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            <Settings className="w-20 h-20 text-primary animate-[spin_8s_linear_infinite]" />
            <Hammer className="w-10 h-10 text-white absolute -bottom-2 -right-2 bg-primary rounded-2xl p-2 border-4 border-slate-950 shadow-xl" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-white to-white/40">
              {t('title')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            {customMessage}
          </p>
        </div>

        {/* Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex items-center gap-4 text-start hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('status')}</p>
              <p className="text-sm font-semibold">{t('estimatedTime')}</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex items-center gap-4 text-start hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('support')}</p>
              <p className="text-sm font-semibold">{t('supportContact')}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            className="rounded-2xl h-14 px-10 font-bold shadow-2xl shadow-primary/40 text-lg hover:scale-105 active:scale-95 transition-all"
            onClick={() => window.location.reload()}
          >
            {t('retryBtn')}
          </Button>
          <a 
            href="mailto:support@skygalaxy.com" 
            className="h-14 px-8 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-3 font-bold hover:bg-white/10 transition-all group"
          >
            <Mail className="w-5 h-5 text-slate-400 group-hover:text-white" />
            {t('contactUs')}
          </a>
        </div>

        <div className="text-slate-600 text-sm font-medium">
          © {new Date().getFullYear()} SkyGalaxy. All rights reserved.
        </div>
      </div>
    </div>
  );
}
