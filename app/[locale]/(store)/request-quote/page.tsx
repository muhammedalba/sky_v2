'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Card } from '@/shared/ui/Card';
import { Icons } from '@/shared/ui/Icons';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/shared/ui/ScrollReveal';

const quoteSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  company: z.string().min(2, { message: "Company name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  product: z.string().min(1, { message: "Please select a product category" }),
  quantity: z.string().min(1, { message: "Please specify estimated quantity" }),
  message: z.string().min(10, { message: "Details must be at least 10 characters" }),
});

type QuoteForm = z.infer<typeof quoteSchema>;

export default function RequestQuotePage() {
  const t = useTranslations('quote');
  const locale = useLocale();
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
  });

  const onSubmit = async (data: QuoteForm) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Quote request submitted:', { ...data, attachment: fileName });
    setSuccess(true);
    reset();
    setFileName(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 pb-20">
      {/* Hero Header */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-secondary/5 border-b border-border/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <ScrollReveal animation="slide-up">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest uppercase animate-in fade-in slide-in-from-top-4 duration-700">
                <Icons.Tag className="w-4 h-4" />
                {t('info.competitive_prices')}
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
                {t('title')}
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                {t('subtitle')}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Side Info */}
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal animation="slide-right">
              <div className="space-y-6">
                {[
                  { icon: Icons.Activity, title: t('info.fast_response'), desc: t('info.fast_response_desc'), color: "bg-info/10 text-info" },
                  { icon: Icons.Shield, title: t('info.technical_support'), desc: t('info.technical_support_desc'), color: "bg-primary/10 text-primary" },
                  { icon: Icons.TrendingUp, title: t('info.competitive_prices'), desc: t('info.competitive_prices_desc'), color: "bg-warning/10 text-warning" }
                ].map((item, i) => (
                  <Card key={i} className="p-6 border-border/50 shadow-sm hover:shadow-md transition-all group rounded-3xl">
                    <div className="flex gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Trust Card */}
              <Card className="mt-12 p-8 bg-foreground text-background rounded-4xl border-none overflow-hidden relative group">
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Icons.Box className="absolute -right-12 -bottom-12 w-40 h-40 text-background/10 rotate-12" />
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-black">Sky Galaxy Industrial</h3>
                  <p className="text-background/70 font-medium leading-relaxed italic">
                    "نحن نؤمن بأن الجودة ليست مجرد معيار، بل هي التزامنا تجاه كل مشروع نساهم فيه."
                  </p>
                  <div className="flex items-center gap-2 pt-4">
                    <div className="w-10 h-px bg-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Certified Quality</span>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8">
            <ScrollReveal animation="slide-left" delay={200}>
              <Card className="p-8 lg:p-12 shadow-2xl border-border/50 rounded-[2.5rem] bg-card/50 backdrop-blur-xl relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="py-16 text-center space-y-6"
                    >
                      <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Icons.Check className="w-12 h-12" />
                      </div>
                      <h2 className="text-4xl font-black text-foreground">{t('form.success')}</h2>
                      <p className="text-xl text-muted-foreground max-w-md mx-auto font-medium">
                        {t('form.success_message')}
                      </p>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="rounded-2xl h-14 px-8 border-primary text-primary hover:bg-primary/5 font-black mt-8"
                        onClick={() => setSuccess(false)}
                      >
                        {locale === 'ar' ? 'إرسال طلب آخر' : 'Send Another Request'}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit(onSubmit)} 
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-sm font-black tracking-wide text-foreground/80 uppercase ml-1">{t('form.name')}</label>
                          <Input 
                            className="h-14 bg-secondary/20 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary transition-all rounded-2xl font-medium"
                            placeholder={t('form.placeholders.name')} 
                            {...register('name')}
                          />
                          {errors.name && <p className="text-xs text-destructive font-black ml-1">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-black tracking-wide text-foreground/80 uppercase ml-1">{t('form.company')}</label>
                          <Input 
                            className="h-14 bg-secondary/20 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary transition-all rounded-2xl font-medium"
                            placeholder={t('form.placeholders.company')} 
                            {...register('company')}
                          />
                          {errors.company && <p className="text-xs text-destructive font-black ml-1">{errors.company.message}</p>}
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-black tracking-wide text-foreground/80 uppercase ml-1">{t('form.email')}</label>
                          <Input 
                            className="h-14 bg-secondary/20 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary transition-all rounded-2xl font-medium"
                            placeholder={t('form.placeholders.email')} 
                            {...register('email')}
                          />
                          {errors.email && <p className="text-xs text-destructive font-black ml-1">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-black tracking-wide text-foreground/80 uppercase ml-1">{t('form.phone')}</label>
                          <Input 
                            className="h-14 bg-secondary/20 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary transition-all rounded-2xl font-medium"
                            placeholder={t('form.placeholders.phone')} 
                            {...register('phone')}
                          />
                          {errors.phone && <p className="text-xs text-destructive font-black ml-1">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-black tracking-wide text-foreground/80 uppercase ml-1">{t('form.product')}</label>
                          <Input 
                            className="h-14 bg-secondary/20 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary transition-all rounded-2xl font-medium"
                            placeholder={t('form.placeholders.product')} 
                            {...register('product')}
                          />
                          {errors.product && <p className="text-xs text-destructive font-black ml-1">{errors.product.message}</p>}
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-black tracking-wide text-foreground/80 uppercase ml-1">{t('form.quantity')}</label>
                          <Input 
                            className="h-14 bg-secondary/20 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary transition-all rounded-2xl font-medium"
                            placeholder={t('form.placeholders.quantity')} 
                            {...register('quantity')}
                          />
                          {errors.quantity && <p className="text-xs text-destructive font-black ml-1">{errors.quantity.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-black tracking-wide text-foreground/80 uppercase ml-1">{t('form.message')}</label>
                        <Textarea 
                          className="min-h-[160px] bg-secondary/20 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary transition-all rounded-3xl font-medium p-6 resize-none"
                          placeholder={t('form.placeholders.message')} 
                          {...register('message')}
                        />
                        {errors.message && <p className="text-xs text-destructive font-black ml-1">{errors.message.message}</p>}
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-black tracking-wide text-foreground/80 uppercase ml-1">{t('form.attachment')}</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.png"
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            className="h-14 px-6 rounded-2xl border-dashed border-2 border-border/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 font-black grow justify-start text-muted-foreground"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Icons.Download className="w-5 h-5" />
                            {fileName || (locale === 'ar' ? 'اختر ملفاً...' : 'Choose file...')}
                          </Button>
                          {fileName && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="w-14 h-14 rounded-2xl text-destructive hover:bg-destructive/10"
                              onClick={() => setFileName(null)}
                            >
                              <Icons.X className="w-6 h-6" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 gap-3 group"
                        isLoading={isSubmitting}
                      >
                        {isSubmitting ? t('form.submitting') : t('form.submit')}
                        <Icons.ChevronRight className="w-6 h-6 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-transform" />
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
