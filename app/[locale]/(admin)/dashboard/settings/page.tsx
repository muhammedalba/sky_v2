'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
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
  MapPin,
  DollarSign,
  Percent,
  ShoppingCart,
  RefreshCcw,
  Search,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/store/toast-store';
import { useEffect } from 'react';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState('general');

  // --- States Mapped to Backend Schema ---
  const [storeInfo, setStoreInfo] = useState({
    siteName: { ar: '', en: '' },
    siteDescription: { ar: '', en: '' },
    logo: '',
    favicon: '',
  });

  const [region, setRegion] = useState({
    currencyCode: 'SAR',
    currencySymbol: 'ر.س',
  });

  const [seo, setSeo] = useState({
    metaTitle: { ar: '', en: '' },
    metaDescription: { ar: '', en: '' },
    googleAnalyticsId: '',
  });

  const [social, setSocial] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    whatsapp: '',
  });

  const [contact, setContact] = useState({
    email: '',
    phones: [''],
    addressAr: '',
    addressEn: '',
  });

  const [gateways, setGateways] = useState({
    stripe: true,
    paypal: false,
    bankTransfer: true,
    cod: true,
  });

  const [shipping, setShipping] = useState({
    freeShippingThreshold: "0",
  });

  const [taxes, setTaxes] = useState({
    vatRate: "15",
    taxesIncluded: false,
  });

  const [features, setFeatures] = useState({
    reviews: true,
    coupons: true,
    guestCheckout: true,
    wishlist: true,
  });

  const [advanced, setAdvanced] = useState({
    maintenance: {
      enabled: false,
      message: { ar: 'الموقع قيد الصيانة', en: 'Site under maintenance' }
    },
    minOrderAmount: "0",
    debugMode: false,
  });

  // --- Fetch Data ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/settings');
        const data = response.data;
        
        if (data) {
          setStoreInfo({
            siteName: data.siteName || { ar: '', en: '' },
            siteDescription: data.siteDescription || { ar: '', en: '' },
            logo: data.logo || '',
            favicon: data.favicon || '',
          });
          setRegion({
            currencyCode: data.currencyCode || 'SAR',
            currencySymbol: data.currencySymbol || 'ر.س',
          });
          setSeo({
            metaTitle: data.metaTitle || { ar: '', en: '' },
            metaDescription: data.metaDescription || { ar: '', en: '' },
            googleAnalyticsId: data.googleAnalyticsId || '',
          });
          setSocial(data.socialLinks || {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            youtube: '',
            tiktok: '',
            whatsapp: '',
          });
          setContact(data.contactInfo || {
            email: '',
            phones: data.contactInfo?.phones || [''],
            addressAr: data.contactInfo?.addressAr || '',
            addressEn: data.contactInfo?.addressEn || '',
          });
          setGateways(data.gateways || {
            stripe: true,
            paypal: false,
            bankTransfer: true,
            cod: true,
          });
          setShipping({
            freeShippingThreshold: String(data.freeShippingThreshold ?? 0),
          });
          setTaxes({
            vatRate: String(data.vatRate ?? 15),
            taxesIncluded: data.taxesIncluded ?? false,
          });
          setFeatures(data.features || {
            reviews: true,
            coupons: true,
            guestCheckout: true,
            wishlist: true,
          });
          setAdvanced({
            maintenance: data.maintenance || {
              enabled: false,
              message: { ar: 'الموقع قيد الصيانة', en: 'Site under maintenance' }
            },
            minOrderAmount: String(data.minOrderAmount ?? 0),
            debugMode: data.debugMode ?? false,
          });
        }
      } catch (error) {
        addToast({
          title: t('errors.fetchTitle') || 'Error',
          message: t('errors.fetchMessage') || 'Failed to load settings',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [addToast, t]);

  // --- Handlers ---
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...storeInfo,
        ...region,
        ...seo,
        socialLinks: social,
        contactInfo: contact,
        gateways,
        features,
        maintenance: advanced.maintenance,
        vatRate: Number(taxes.vatRate),
        taxesIncluded: taxes.taxesIncluded,
        minOrderAmount: Number(advanced.minOrderAmount),
        debugMode: advanced.debugMode,
        freeShippingThreshold: Number(shipping.freeShippingThreshold),
      };

      await apiClient.patch('/settings', payload);
      
      addToast({
        title: t('success.saveTitle') || 'Success',
        message: t('success.saveMessage') || 'Settings updated successfully',
        type: 'success',
      });
    } catch (error: any) {
      addToast({
        title: t('errors.saveTitle') || 'Error',
        message: error.message || 'Failed to update settings',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await apiClient.patch('/settings/clear-cache');
      addToast({
        title: t('success.cacheTitle') || 'Cache Cleared',
        message: t('success.cacheMessage') || 'System cache updated successfully',
        type: 'success',
      });
    } catch (error: any) {
      addToast({
        title: t('errors.cacheTitle') || 'Error',
        message: error.message || 'Failed to clear cache',
        type: 'error',
      });
    }
  };

  // --- Menu Definitions ---
  const tabs = [
    { id: 'general', label: t('tabs.general'), icon: Store, color: 'text-primary' },
    { id: 'seo', label: t('tabs.seo'), icon: Search, color: 'text-info' },
    { id: 'social', label: t('tabs.social'), icon: Share2, color: 'text-purple-500' },
    { id: 'contact', label: t('tabs.contact'), icon: MessageSquare, color: 'text-success' },
    { id: 'payments', label: t('tabs.payments'), icon: CreditCard, color: 'text-warning' },
    { id: 'shipping', label: t('tabs.shipping'), icon: Icons.Truck, color: 'text-blue-500' },
    { id: 'advanced', label: t('tabs.advanced'), icon: Icons.Settings, color: 'text-muted-foreground' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">{t('loading') || 'Loading Settings...'}</p>
      </div>
    );
  }

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
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-start font-bold transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : tab.color)} />
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
                  <Store className="w-5 h-5 text-primary" /> {t('general.title')}
                </CardTitle>
                <CardDescription>{t('general.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Logo & Favicon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-border/50">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center border-2 border-dashed border-border group cursor-pointer hover:border-primary transition-colors overflow-hidden">
                        {storeInfo.logo ? <img src={storeInfo.logo} className="w-full h-full object-contain" /> : <UploadCloud className="w-8 h-8 text-muted-foreground" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1">{t('general.logoTitle')}</h4>
                        <p className="text-xs text-muted-foreground">{t('general.logoDesc')}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center border-2 border-dashed border-border group cursor-pointer hover:border-primary transition-colors overflow-hidden">
                        {storeInfo.favicon ? <img src={storeInfo.favicon} className="w-full h-full object-contain" /> : <Icons.Settings className="w-6 h-6 text-muted-foreground" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1">{t('general.faviconTitle') || 'Favicon'}</h4>
                        <p className="text-xs text-muted-foreground">{t('general.faviconDesc') || 'Recommended: 32x32 pixels'}</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Site Name Localized */}
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-bold text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> {t('general.storeName')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={storeInfo.siteName.ar}
                        placeholder="Arabic Name"
                        onChange={(e) => setStoreInfo({ ...storeInfo, siteName: { ...storeInfo.siteName, ar: e.target.value } })}
                        className="rounded-xl h-11"
                        label="العربية"
                      />
                      <Input
                        value={storeInfo.siteName.en}
                        placeholder="English Name"
                        onChange={(e) => setStoreInfo({ ...storeInfo, siteName: { ...storeInfo.siteName, en: e.target.value } })}
                        className="rounded-xl h-11"
                        label="English"
                      />
                    </div>
                  </div>

                  {/* Site Description Localized */}
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-bold text-sm flex items-center gap-2"><Icons.Edit className="w-4 h-4" /> {t('general.storeDesc')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Textarea
                        value={storeInfo.siteDescription.ar}
                        onChange={(e) => setStoreInfo({ ...storeInfo, siteDescription: { ...storeInfo.siteDescription, ar: e.target.value } })}
                        className="rounded-xl min-h-[80px]"
                        label="العربية"
                      />
                      <Textarea
                        value={storeInfo.siteDescription.en}
                        onChange={(e) => setStoreInfo({ ...storeInfo, siteDescription: { ...storeInfo.siteDescription, en: e.target.value } })}
                        className="rounded-xl min-h-[80px]"
                        label="English"
                      />
                    </div>
                  </div>

                  {/* Currency Settings */}
                  <div className="space-y-4 md:col-span-2 pt-6 border-t border-border/50">
                    <h4 className="font-bold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> {t('region.currency')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={region.currencyCode}
                        onChange={(e) => setRegion({ ...region, currencyCode: e.target.value })}
                        label={t('region.currencyCode') || 'Currency Code (e.g. SAR)'}
                        className="rounded-xl h-11"
                      />
                      <Input
                        value={region.currencySymbol}
                        onChange={(e) => setRegion({ ...region, currencySymbol: e.target.value })}
                        label={t('region.currencySymbol') || 'Currency Symbol (e.g. ر.س)'}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SEO SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'seo' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <Search className="w-5 h-5 text-info" /> {t('seo.title') || 'Search Engine Optimization'}
                </CardTitle>
                <CardDescription>{t('seo.desc') || 'Improve your store visibility on search engines.'}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Meta Title */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">{t('seo.metaTitle') || 'Meta Title'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      value={seo.metaTitle.ar}
                      onChange={(e) => setSeo({ ...seo, metaTitle: { ...seo.metaTitle, ar: e.target.value } })}
                      className="rounded-xl h-11"
                      label="العربية"
                    />
                    <Input
                      value={seo.metaTitle.en}
                      onChange={(e) => setSeo({ ...seo, metaTitle: { ...seo.metaTitle, en: e.target.value } })}
                      className="rounded-xl h-11"
                      label="English"
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">{t('seo.metaDescription') || 'Meta Description'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea
                      value={seo.metaDescription.ar}
                      onChange={(e) => setSeo({ ...seo, metaDescription: { ...seo.metaDescription, ar: e.target.value } })}
                      className="rounded-xl min-h-[80px]"
                      label="العربية"
                    />
                    <Textarea
                      value={seo.metaDescription.en}
                      onChange={(e) => setSeo({ ...seo, metaDescription: { ...seo.metaDescription, en: e.target.value } })}
                      className="rounded-xl min-h-[80px]"
                      label="English"
                    />
                  </div>
                </div>

                {/* Analytics */}
                <div className="pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t('seo.analyticsTitle') || 'Google Analytics'}</h4>
                      <p className="text-xs text-muted-foreground">{t('seo.analyticsDesc') || 'Track visitors and sales using Google Analytics ID.'}</p>
                    </div>
                  </div>
                  <Input
                    value={seo.googleAnalyticsId}
                    placeholder="G-XXXXXXXXXX"
                    onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SOCIAL LINKS SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'social' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <Share2 className="w-5 h-5 text-purple-500" /> {t('social.title') || 'Social Media Links'}
                </CardTitle>
                <CardDescription>{t('social.desc') || 'Connect with your customers on social platforms.'}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Facebook"
                    icon={Facebook}
                    value={social.facebook}
                    placeholder="https://facebook.com/your-store"
                    onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                    className="rounded-xl h-11"
                  />
                  <Input
                    label="Instagram"
                    icon={Instagram}
                    value={social.instagram}
                    placeholder="https://instagram.com/your-store"
                    onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                    className="rounded-xl h-11"
                  />
                  <Input
                    label="X (Twitter)"
                    icon={Twitter}
                    value={social.twitter}
                    placeholder="https://x.com/your-store"
                    onChange={(e) => setSocial({ ...social, twitter: e.target.value })}
                    className="rounded-xl h-11"
                  />
                  <Input
                    label="LinkedIn"
                    icon={Linkedin}
                    value={social.linkedin}
                    placeholder="https://linkedin.com/company/your-store"
                    onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
                    className="rounded-xl h-11"
                  />
                  <Input
                    label="YouTube"
                    icon={Youtube}
                    value={social.youtube}
                    placeholder="https://youtube.com/c/your-store"
                    onChange={(e) => setSocial({ ...social, youtube: e.target.value })}
                    className="rounded-xl h-11"
                  />
                  <Input
                    label="TikTok"
                    icon={Icons.TikTok}
                    value={social.tiktok}
                    placeholder="https://tiktok.com/@your-store"
                    onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                    className="rounded-xl h-11"
                  />
                  <Input
                    label="WhatsApp"
                    icon={Icons.WhatsApp}
                    value={social.whatsapp}
                    placeholder="9665XXXXXXXX"
                    onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CONTACT INFO SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'contact' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <MessageSquare className="w-5 h-5 text-success" /> {t('contact.title') || 'Contact Information'}
                </CardTitle>
                <CardDescription>{t('contact.desc') || 'Your store official contact details.'}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Email"
                      icon={Icons.Mail}
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="rounded-xl h-11"
                    />
                    <Input
                      label="Phone"
                      icon={Icons.Phone}
                      value={contact.phones[0]}
                      onChange={(e) => setContact({ ...contact, phones: [e.target.value] })}
                      className="rounded-xl h-11"
                    />
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="font-bold text-sm">{t('contact.address') || 'Physical Address'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Textarea
                          label="العنوان (بالعربية)"
                          value={contact.addressAr}
                          onChange={(e) => setContact({ ...contact, addressAr: e.target.value })}
                          className="rounded-xl min-h-[80px]"
                        />
                        <Textarea
                          label="Address (English)"
                          value={contact.addressEn}
                          onChange={(e) => setContact({ ...contact, addressEn: e.target.value })}
                          className="rounded-xl min-h-[80px]"
                        />
                      </div>
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
                  <CreditCard className="w-5 h-5 text-warning" /> {t('payments.title')}
                </CardTitle>
                <CardDescription>{t('payments.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Gateways */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(gateways).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                           {key === 'stripe' && <CreditCard className="w-5 h-5 text-indigo-500" />}
                           {key === 'paypal' && <Icons.FileText className="w-5 h-5 text-blue-500" />}
                           {key === 'bankTransfer' && <Icons.Truck className="w-5 h-5 text-success" />}
                           {key === 'cod' && <MapPin className="w-5 h-5 text-red-500" />}
                        </div>
                        <span className="font-bold text-sm capitalize">{key}</span>
                      </div>
                      <Switch
                        checked={enabled}
                        onChange={(e) => setGateways({ ...gateways, [key]: e.target.checked })}
                      />
                    </div>
                  ))}
                </div>

                {/* Taxes Settings */}
                <div className="pt-8 border-t border-border/50 space-y-6">
                  <h4 className="font-bold text-sm flex items-center gap-2"><Percent className="w-4 h-4 text-primary" /> {t('taxes.title')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={t('taxes.vatRate')}
                      type="number"
                      icon={Percent}
                      value={taxes.vatRate}
                      onChange={(e) => setTaxes({ ...taxes, vatRate: e.target.value })}
                      className="rounded-xl h-11"
                    />
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background">
                      <div>
                        <h4 className="font-bold text-sm">{t('taxes.includeInPrice')}</h4>
                        <p className="text-xs text-muted-foreground">{t('taxes.includeInPriceDesc')}</p>
                      </div>
                      <Switch
                        checked={taxes.taxesIncluded}
                        onChange={(e) => setTaxes({ ...taxes, taxesIncluded: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SHIPPING SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'shipping' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <Icons.Truck className="w-5 h-5 text-blue-500" /> {t('shipping.title')}
                </CardTitle>
                <CardDescription>{t('shipping.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('shipping.threshold')}
                    type="number"
                    icon={DollarSign}
                    value={shipping.freeShippingThreshold}
                    onChange={(e) => setShipping({ ...shipping, freeShippingThreshold: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ADVANCED SECTION */}
          <div className={cn("space-y-6 animate-in slide-in-from-bottom-4 duration-500", activeTab !== 'advanced' && 'hidden')}>
            <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 title-gradient">
                  <Icons.Settings className="w-5 h-5 text-muted-foreground" /> {t('advanced.title')}
                </CardTitle>
                <CardDescription>{t('advanced.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Maintenance Object */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 rounded-2xl border border-destructive/20 bg-destructive/5">
                      <div>
                        <h4 className="font-bold text-sm text-destructive">{t('advanced.maintenance')}</h4>
                        <p className="text-xs text-destructive/70">{t('advanced.maintenanceDesc')}</p>
                      </div>
                      <Switch
                        checked={advanced.maintenance.enabled}
                        onChange={(e) => setAdvanced({ ...advanced, maintenance: { ...advanced.maintenance, enabled: e.target.checked } })}
                      />
                    </div>
                    {advanced.maintenance.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Input
                          label="رسالة الصيانة (بالعربية)"
                          value={advanced.maintenance.message.ar}
                          onChange={(e) => setAdvanced({ ...advanced, maintenance: { ...advanced.maintenance, message: { ...advanced.maintenance.message, ar: e.target.value } } })}
                          className="rounded-xl h-11"
                        />
                        <Input
                          label="Maintenance Message (English)"
                          value={advanced.maintenance.message.en}
                          onChange={(e) => setAdvanced({ ...advanced, maintenance: { ...advanced.maintenance, message: { ...advanced.maintenance.message, en: e.target.value } } })}
                          className="rounded-xl h-11"
                        />
                      </div>
                    )}
                </div>

                {/* Features Toggles */}
                <div className="pt-6 border-t border-border/50">
                  <h4 className="font-bold text-sm mb-4">{t('advanced.features') || 'Store Features'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(features).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background">
                         <span className="text-sm font-medium capitalize">{key}</span>
                         <Switch
                          checked={enabled}
                          onChange={(e) => setFeatures({ ...features, [key]: e.target.checked })}
                         />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                  <div className="space-y-2">
                    <Input
                      label={t('advanced.minOrderAmount')}
                      type="number"
                      icon={ShoppingCart}
                      value={advanced.minOrderAmount}
                      onChange={(e) => setAdvanced({ ...advanced, minOrderAmount: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background">
                    <div>
                      <h4 className="font-bold text-sm">{t('advanced.debugMode')}</h4>
                    </div>
                    <Switch
                      checked={advanced.debugMode}
                      onChange={(e) => setAdvanced({ ...advanced, debugMode: e.target.checked })}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{t('advanced.clearCache')}</h4>
                    <p className="text-xs text-muted-foreground">تحديث بيانات النظام المتزامنة.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-xl font-bold gap-2 group hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={handleClearCache}
                  >
                    <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    {t('advanced.clearCacheBtn')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
