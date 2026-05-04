'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Switch } from '@/shared/ui/Switch';
import { 
  Store, 
  Globe, 
  CreditCard, 
  Bell, 
  UploadCloud, 
  Save, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';

export default function SettingsPage() {
  const t = useTranslations('settings'); // Translated keys
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // --- Mocked States ---
  const [storeInfo, setStoreInfo] = useState({
    name: 'SkyGalaxy Superstore',
    description: 'The best place to buy electronic gadgets and accessories online.',
    email: 'support@skygalaxy.com',
    phone: '+1 (555) 123-4567',
  });

  const [gateways, setGateways] = useState({
    stripe: true,
    paypal: false,
    cod: true,
  });

  const [notifications, setNotifications] = useState({
    emailNewOrder: true,
    smsLowStock: false,
    dailyReport: true,
  });

  // --- Handlers ---
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  // --- Menu Definitions ---
  const tabs = [
    { id: 'general', label: t('tabs.general'), icon: Store,activeClass:'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]',inactiveClass:'bg-transparent text-primary hover:bg-accent/50 hover:text-primary/70' },
    { id: 'region', label: t('tabs.region'), icon: Globe,activeClass:'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]',inactiveClass:'bg-transparent text-success hover:bg-accent/50 hover:text-success/70' },
    { id: 'payments', label: t('tabs.payments'), icon: CreditCard,activeClass:'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]',inactiveClass:'bg-transparent text-warning hover:bg-accent/50 hover:text-warning' },
    { id: 'notifications', label: t('tabs.notifications'), icon: Bell,activeClass:'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]',inactiveClass:'bg-transparent text-destructive hover:bg-accent/50 hover:text-destructive' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background p-6 rounded-3xl border border-border/50 shadow-xs ">
        <div>
          <h1 className="text-3xl font-black tracking-tight title-gradient">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t('description')}
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 me-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 me-2" />
          )}
          {isSaving ? t('savingBtn') : t('saveBtn')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Vertical Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-start font-bold transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" 
                    : "bg-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? tab.activeClass : tab.inactiveClass)} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* 3. Settings Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* GENERAL INFO SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'general' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <Store className="w-5 h-5 text-success" /> {t('general.title')}
                </CardTitle>
                <CardDescription>{t('general.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-border/50">
                  <div className="w-24 h-24 rounded-2xl bg-accent flex items-center justify-center border-2 border-dashed border-border text-muted-foreground shrink-0 overflow-hidden relative group cursor-pointer hover:border-primary transition-colors">
                    <UploadCloud className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">{t('general.upload')}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{t('general.logoTitle')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{t('general.logoDesc')}</p>
                    <Button variant="outline" size="sm" className="rounded-lg font-bold">{t('general.logoBtn')}</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Input 
                      value={storeInfo.name} 
                      label={t('general.storeName')}
                      icon={Icons.Edit}
                      onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})}
                      className="rounded-xl h-11 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                      <Input 
                        type="email"
                        label={t('general.contactEmail')}
                        icon={Icons.Mail}
                        value={storeInfo.email}
                        onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})}
                        className="rounded-xl h-11 ps-10 focus-visible:ring-primary"
                      />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                      <Input 
                        value={storeInfo.phone}
                        label={t('general.supportPhone')}
                        icon={Icons.Phone}
                        onChange={(e) => setStoreInfo({...storeInfo, phone: e.target.value})}
                        className="rounded-xl h-11 ps-10 focus-visible:ring-primary"
                      />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                      <Textarea 
                        label={t('general.storeDesc')}
                        icon={Icons.Edit}
                        value={storeInfo.description}
                        onChange={(e) => setStoreInfo({...storeInfo, description: e.target.value})}
                        className="rounded-xl min-h-[100px] focus-visible:ring-primary"
                      />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* REGION & CURRENCY SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'region' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <Globe className="w-5 h-5 text-success" /> {t('region.title')}
                </CardTitle>
                <CardDescription>{t('region.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">{t('region.country')}</label>
                    <select className="flex h-11 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all">
                      <option value="sa">{t('region.countries.sa')}</option>
                      <option value="ae">{t('region.countries.ae')}</option>
                      <option value="eg">{t('region.countries.eg')}</option>
                      <option value="us">{t('region.countries.us')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">{t('region.timezone')}</label>
                    <select className="flex h-11 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all">
                      <option value="ast">{t('region.timezones.ast')}</option>
                      <option value="gst">{t('region.timezones.gst')}</option>
                      <option value="utc">{t('region.timezones.utc')}</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold">{t('region.currency')}</label>
                    <select className="flex h-11 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all">
                      <option value="sar">{t('region.currencies.sar')}</option>
                      <option value="aed">{t('region.currencies.aed')}</option>
                      <option value="usd">{t('region.currencies.usd')}</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">{t('region.currencyDesc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PAYMENT GATEWAYS SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'payments' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <CreditCard className="w-5 h-5 text-success" /> {t('payments.title')}
                </CardTitle>
                <CardDescription>{t('payments.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted text-primary ">
                      <CreditCard className="w-6 h-6 rtl:-scale-x-100" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t('payments.stripe')}</h4>
                      <p className="text-xs text-muted-foreground">{t('payments.stripeDesc')}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={gateways.stripe} 
                    onChange={(e) => setGateways({...gateways, stripe: e.target.checked})} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted  flex items-center justify-center text-blue-600 ">
                      <Globe className="w-6 h-6" />
                    </div> 
                    <div>
                      <h4 className="font-bold text-sm">{t('payments.paypal')}</h4>
                      <p className="text-xs text-muted-foreground">{t('payments.paypalDesc')}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={gateways.paypal} 
                    onChange={(e) => setGateways({...gateways, paypal: e.target.checked})} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted  flex items-center justify-center text-red-600 ">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t('payments.cod')}</h4>
                      <p className="text-xs text-muted-foreground">{t('payments.codDesc')}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={gateways.cod} 
                    onChange={(e) => setGateways({...gateways, cod: e.target.checked})} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NOTIFICATIONS SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'notifications' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <Bell className="w-5 h-5 text-success" /> {t('notifications.title')}
                </CardTitle>
                <CardDescription>{t('notifications.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                <label className="flex items-start gap-4 p-4 rounded-2xl border border-border/50 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="mt-0.5">
                    <Switch 
                      checked={notifications.emailNewOrder} 
                      onChange={(e) => setNotifications({...notifications, emailNewOrder: e.target.checked})} 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t('notifications.emailNewOrder')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t('notifications.emailNewOrderDesc')}</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-2xl border border-border/50 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="mt-0.5">
                    <Switch 
                      checked={notifications.smsLowStock} 
                      onChange={(e) => setNotifications({...notifications, smsLowStock: e.target.checked})} 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t('notifications.smsLowStock')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t('notifications.smsLowStockDesc')}</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-2xl border border-border/50 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="mt-0.5">
                    <Switch 
                      checked={notifications.dailyReport} 
                      onChange={(e) => setNotifications({...notifications, dailyReport: e.target.checked})} 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t('notifications.dailyReport')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t('notifications.dailyReportDesc')}</p>
                  </div>
                </label>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
