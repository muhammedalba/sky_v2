'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider, SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

import { SettingsInput, settingsSchema } from '../settings.schema';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import SettingsSidebar from './SettingsSidebar';
import FormStickyHeader from '@/shared/ui/dashboard/FormStickyHeader';
import { useToast } from '@/shared/hooks/useToast';

// Axis 1: Lazy Loading للأقسام (باستثناء الأول)
import GeneralSection from './sections/GeneralSection';
const SEOSection = dynamic(() => import('./sections/SEOSection'), { loading: () => <SectionSkeleton /> });
const SocialSection = dynamic(() => import('./sections/SocialSection'), { loading: () => <SectionSkeleton /> });
const ContactSection = dynamic(() => import('./sections/ContactSection'), { loading: () => <SectionSkeleton /> });
const PaymentsSection = dynamic(() => import('./sections/PaymentsSection'), { loading: () => <SectionSkeleton /> });
const ShippingSection = dynamic(() => import('./sections/ShippingSection'), { loading: () => <SectionSkeleton /> });
const AdvancedSection = dynamic(() => import('./sections/AdvancedSection'), { loading: () => <SectionSkeleton /> });
const FeaturesSection = dynamic(() => import('./sections/FeaturesSection'), { loading: () => <SectionSkeleton /> });

function SectionSkeleton() {
  return <div className="h-96 w-full bg-muted/20 animate-pulse rounded-3xl border border-border/50" />;
}

// Axis 5: ثابت المراجع الافتراضية
const SETTINGS_DEFAULTS: SettingsInput = {
  siteName: { ar: '', en: '' },
  siteDescription: { ar: '', en: '' },
  currencyCode: 'SAR',
  currencySymbol: 'ر.س',
  exchangeRate: 1,
  metaTitle: { ar: '', en: '' },
  metaDescription: { ar: '', en: '' },
  googleAnalyticsId: '',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    whatsapp: '',
  },
  contactInfo: {
    email: '',
    phones: [],
    addressAr: '',
    addressEn: '',
  },
  gateways: {
    stripe: false,
    paypal: false,
    bankTransfer: false,
    cod: false,
  },
  freeShippingThreshold: 0,
  vatRate: 15,
  taxesIncluded: false,
  features: {
    reviews: true,
    coupons: true,
    guestCheckout: true,
    wishlist: true,
  },
  maintenanceMode: false,
  maintenanceMessage: {
    ar: 'الموقع قيد الصيانة',
    en: 'Site under maintenance',
  },
  allowRegistration: true,
  autoBackup: false,
  googleMapsApiKey: '',
  minOrderAmount: 0,
  debugMode: false,
  logo: undefined,
  favicon: undefined,
};

export default function SettingsForm() {
  const t = useTranslations('settings');
  const commonT = useTranslations('common');
  const [activeSection, setActiveSection] = useState('general');
  const { data: settings } = useSettings();
  const updateMutation = useUpdateSettings();
  const { success, error: toastError } = useToast();


  const methods = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema) as Resolver<SettingsInput>,
    defaultValues: SETTINGS_DEFAULTS,
  });

  const { handleSubmit, reset, register, formState: { isSubmitting } } = methods;

  // Axis 4: Explicitly Register Image Fields (Always tracked regardless of active section)
  useEffect(() => {
    register('logo');
    register('favicon');
  }, [register]);

  useEffect(() => {
    if (settings) {
      // دمج البيانات مع القيم الافتراضية لضمان عدم وجود حقول undefined تكسر الـ Validation
      reset({ ...SETTINGS_DEFAULTS, ...settings });
    }
  }, [settings, reset]);

  // Axis 5: تثبيت مرجع onSubmit
  const onSubmit: SubmitHandler<SettingsInput> = useCallback(async (data) => {
    try {
      const formData = new FormData();

      // 1. Localized & Nested Objects (JSON Stringify)
      const jsonFields: (keyof SettingsInput)[] = [
        'siteName', 'siteDescription', 'metaTitle', 'metaDescription',
        'socialLinks', 'contactInfo', 'gateways', 'features', 'maintenanceMessage'
      ];
      jsonFields.forEach(field => {
        if (data[field]) formData.append(field, JSON.stringify(data[field]));
      });

      // 2. Primitive Values (Strings, Numbers, Booleans)
      const primitiveFields: (keyof SettingsInput)[] = [
        'currencyCode', 'currencySymbol', 'googleAnalyticsId', 'freeShippingThreshold',
        'vatRate', 'taxesIncluded', 'maintenanceMode', 'allowRegistration',
        'autoBackup', 'googleMapsApiKey', 'minOrderAmount', 'debugMode', 'exchangeRate'
      ];
      primitiveFields.forEach(field => {
        const value = data[field];
        if (value !== undefined && value !== null) {
          formData.append(field, String(value));
        }
      });

      // 3. Media Fields (Explicit Handling)
      // Logo
      if (data.logo instanceof File) {
        formData.append('logo', data.logo);
      } else if (data.logo === null) {
        formData.append('logo', 'null'); // Handled by ParseBodyJsonInterceptor (if active) or Transform
      }
      // Note: If data.logo is a string, we DON'T append it (Product style), so the server won't touch it.

      // Favicon
      if (data.favicon instanceof File) {
        formData.append('favicon', data.favicon);
      } else if (data.favicon === null) {
        formData.append('favicon', 'null'); // Handled by ParseBodyJsonInterceptor (if active) or Transform
      }
      // Note: If data.favicon is a string, we DON'T append it (Product style), so the server won't touch it.

      await updateMutation.mutateAsync(formData);
      success(t('messages.updateSuccess'));

      // إجبار المتصفح على إعادة التحميل بالكامل لمسح كاش (Client Router Cache) 
      // وضمان ظهور الشعار والإعدادات الجديدة في جميع صفحات المتجر
      window.location.reload();
    } catch (err: unknown) {
      console.log(err);
      const errorMessage = err instanceof Error ? err.message : (err as { message?: string })?.message || t('messages.updateError');
      toastError(errorMessage);
    }
  }, [updateMutation, success, toastError, t]);

  // Axis 5: خريطة الأقسام لتجنب إعادة الرسم غير الضرورية
  // يجب أن يكون قبل الـ return المبكر لمنع خطأ Rules of Hooks
  const ActiveSectionComponent = useMemo(() => {
    switch (activeSection) {
      case 'general': return GeneralSection;
      case 'seo': return SEOSection;
      case 'social': return SocialSection;
      case 'contact': return ContactSection;
      case 'payments': return PaymentsSection;
      case 'shipping': return ShippingSection;
      case 'features': return FeaturesSection;
      case 'advanced': return AdvancedSection;
      default: return GeneralSection;
    }
  }, [activeSection]);



  return (
    <FormProvider {...methods}>
      <div className="pb-20">
        <FormStickyHeader
          title={t('title')}
          subtitle={t('subtitle')}
          cancelLabel={commonT('buttons.cancel')}
          saveLabel={commonT('buttons.save')}
          formId="settings-form"
          isSubmitting={isSubmitting || updateMutation.isPending}
          backUrl="/dashboard"
        />

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          </aside>

          <main className="flex-1">
            <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <ActiveSectionComponent />
            </form>
          </main>
        </div>
      </div>
    </FormProvider>
  );
}
