'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icons';
import { useState } from 'react';

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [success, setSuccess] = useState(false);

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
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <StoreLayout locale={locale}>
      <div className="bg-secondary/5 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
                {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('subtitle')}
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 -mt-10">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-6">
                {[
                    { icon: Icons.Users, title: t('info.email'), value: "hello@skygalaxy.com", color: "bg-blue-50 text-blue-600" },
                    { icon: Icons.Menu, title: t('info.phone'), value: "+1 (555) 000-0000", color: "bg-purple-50 text-purple-600" }, // Using Menu as Phone placeholder
                    { icon: Icons.Dashboard, title: t('info.office'), value: "123 Tech Blvd, San Francisco, CA", color: "bg-pink-50 text-pink-600" } // Dashboard as Location placeholder
                ].map((item, i) => (
                    <Card key={i} className="p-6 border-border/50 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl ${item.color}`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                            <p className="text-muted-foreground font-medium">{item.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Form */}
            <Card className="lg:col-span-2 p-8 lg:p-12 shadow-xl border-border/50">
               {success ? (
                   <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <Icons.Menu className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-700 mb-2">{t('form.success')}</h3>
                        <p className="text-muted-foreground">We'll get back to you shortly.</p>
                        <Button variant="outline" className="mt-8" onClick={() => setSuccess(false)}>Send another message</Button>
                   </div>
               ) : (
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">{t('form.name')}</label>
                                <Input 
                                    className={`h-12 bg-secondary/20 border-transparent focus:bg-background transition-colors ${errors.name ? 'ring-1 ring-red-500' : ''}`}
                                    placeholder="John Doe" 
                                    {...register('name')}
                                />
                                {errors.name && <p className="text-xs text-red-500 font-bold ml-1">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">{t('form.email')}</label>
                                <Input 
                                    className={`h-12 bg-secondary/20 border-transparent focus:bg-background transition-colors ${errors.email ? 'ring-1 ring-red-500' : ''}`}
                                    placeholder="john@example.com" 
                                    {...register('email')}
                                />
                                {errors.email && <p className="text-xs text-red-500 font-bold ml-1">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">{t('form.message')}</label>
                            <Textarea 
                                className={`min-h-[150px] bg-secondary/20 border-transparent focus:bg-background transition-colors resize-none p-4 ${errors.message ? 'ring-1 ring-red-500' : ''}`}
                                placeholder="How can we help you?" 
                                {...register('message')}
                            />
                            {errors.message && <p className="text-xs text-red-500 font-bold ml-1">{errors.message.message}</p>}
                        </div>

                        <Button 
                            type="submit" 
                            size="lg" 
                            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? t('form.submitting') : t('form.submit')}
                        </Button>
                   </form>
               )}
            </Card>
         </div>
      </div>
    </StoreLayout>
  );
}
