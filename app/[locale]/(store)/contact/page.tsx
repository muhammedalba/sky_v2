'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Card } from '@/shared/ui/Card';
import { CheckIcon, MailIcon, SpinnerIcon } from "@/shared/ui/Icons";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/app/providers/SettingsProvider';

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactForm = z.infer<typeof contactSchema>;

// Inline premium SVGs defined outside render function to meet React/linting specifications
const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SupportHoursIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale() as 'ar' | 'en';
  const [success, setSuccess] = useState(false);
  const settings = useSettings();
  const contactInfo = settings?.contactInfo;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Contact form submitted:', data);
    setSuccess(true);
    reset();
  };

  const email = contactInfo?.email || 'hello@skygalaxy.com';
  const phone = contactInfo?.phones?.[0] || '+1 (555) 000-0000';
  const businessAddress = settings?.businessAddress;
  const addressParts = businessAddress ? [
    businessAddress.street?.[locale],
    businessAddress.area?.[locale],
    businessAddress.city?.[locale],
    businessAddress.country?.[locale]
  ].filter(Boolean) : [];
  const officeAddress = addressParts.length > 0
    ? addressParts.join(', ')
    : (locale === 'ar' 
      ? 'الرياض، المملكة العربية السعودية' 
      : 'Riyadh, Saudi Arabia');
  const workingDays = contactInfo?.workingDays?.[locale] || (locale === 'ar' ? 'من الإثنين إلى الجمعة' : 'Monday - Friday');
  const workingHours = contactInfo?.workingHours?.[locale] || '09:00 AM - 06:00 PM';

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background text-foreground transition-colors duration-200">
      
      {/* Premium Hero Title Section */}
      <div className="relative mb-16 overflow-hidden py-16 lg:py-20 text-center">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {locale === 'ar' ? 'اتصل بنا' : 'Support Center'}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Panel (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              {locale === 'ar' ? 'قنوات الاتصال' : 'Contact Channels'}
            </p>

            {/* Email Card */}
            <Card className="p-5 border-border/60 bg-card rounded-2xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/25 shrink-0">
                <MailIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm mb-0.5 text-foreground">{t('info.email')}</h3>
                <p className="text-xs text-muted-foreground/80 font-medium break-all">{email}</p>
                <p className="text-[11px] text-primary font-semibold mt-1 hover:underline cursor-pointer">
                  {locale === 'ar' ? 'أرسل بريداً إلكترونياً' : 'Send an Email'} &rarr;
                </p>
              </div>
            </Card>

            {/* Phone Card */}
            <Card className="p-5 border-border/60 bg-card rounded-2xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 shrink-0">
                <PhoneIcon />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm mb-0.5 text-foreground">{t('info.phone')}</h3>
                <p className="text-xs text-muted-foreground/80 font-medium">{phone}</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  {locale === 'ar' ? 'متاح 24/7' : 'Available 24/7'}
                </p>
              </div>
            </Card>

            {/* Office Location Card */}
            <Card className="p-5 border-border/60 bg-card rounded-2xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                <MapPinIcon />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm mb-0.5 text-foreground">{t('info.office')}</h3>
                <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                  {officeAddress}
                </p>
              </div>
            </Card>

            {/* Support Hours Card */}
            <Card className="p-5 border-border/60 bg-card rounded-2xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                <SupportHoursIcon />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm mb-0.5 text-foreground">
                  {locale === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                </h3>
                <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                  {workingDays}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {workingHours}
                </p>
              </div>
            </Card>
          </div>

          {/* Right Form Card (lg:col-span-8) */}
          <div className="lg:col-span-8">
            <Card className="p-6 sm:p-8 lg:p-10 border-border/60 bg-card rounded-3xl shadow-sm backdrop-blur-md relative overflow-hidden">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <CheckIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {t('form.success')}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                      {locale === 'ar' 
                        ? 'شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.' 
                        : "We've received your message. A support representative will get back to you shortly."}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-8 h-10 px-5 rounded-xl font-semibold border-border hover:bg-muted transition-all" 
                      onClick={() => setSuccess(false)}
                    >
                      {locale === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="pb-2 border-b border-border/40">
                      <h2 className="text-lg font-bold text-foreground">
                        {locale === 'ar' ? 'أرسل لنا رسالة' : 'Send a Message'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {locale === 'ar' ? 'املأ الحقول أدناه وسنتواصل معك' : 'Fill in the fields below and we will contact you'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name field */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground ml-1">
                          {t('form.name')}
                        </label>
                        <Input 
                          className={`h-11 bg-muted/30 border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl text-sm ${errors.name ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : ''}`}
                          placeholder="John Doe" 
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive font-semibold ml-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Email field */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground ml-1">
                          {t('form.email')}
                        </label>
                        <Input 
                          className={`h-11 bg-muted/30 border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl text-sm ${errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : ''}`}
                          placeholder="john@example.com" 
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive font-semibold ml-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message field */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">
                        {t('form.message')}
                      </label>
                      <Textarea 
                        className={`min-h-[160px] bg-muted/30 border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl text-sm p-4 resize-none ${errors.message ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : ''}`}
                        placeholder={locale === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'} 
                        {...register('message')}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive font-semibold ml-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-12 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {isSubmitting && <SpinnerIcon className="w-4 h-4 text-primary-foreground" />}
                      {isSubmitting ? t('form.submitting') : t('form.submit')}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
