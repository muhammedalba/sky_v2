'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icons } from '@/shared/ui/Icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/shared/ui/ScrollReveal';
import { formatEmail } from '@/lib/utils';

export default function AccountPage() {
   const t = useTranslations('profile');
   const locale = useLocale();
   const { user, logout } = useAuth();

   const mockOrders = [
      { id: '#SG-9842', date: '2024-05-01', total: 450, status: 'delivered' },
      { id: '#SG-9721', date: '2024-04-15', total: 1200, status: 'processing' },
   ];

   const stats = [
      { label: t('stats.total_orders'), value: '12', icon: Icons.ShoppingCart, color: "bg-primary/10 text-primary" },
      { label: t('stats.active_orders'), value: '1', icon: Icons.RefreshCw, color: "bg-info/10 text-info" },
      { label: t('stats.saved_items'), value: '5', icon: Icons.Star, color: "bg-warning/10 text-warning" },
   ];

   return ( 
      <div className="min-h-screen pt-40 bg-background selection:bg-primary/30 pb-20">
         {/* Profile Header */}
         <section className="py-16 lg:py-24 bg-secondary/5 border-b border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
               <div className="flex flex-col md:flex-row items-center gap-10">
                  {/* Avatar */}
                  <div className="relative group">
                     <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] bg-foreground flex items-center justify-center text-background text-5xl font-black shadow-2xl relative z-10">
                        {user?.name?.charAt(0) || 'U'}
                     </div>
                     <div className="absolute inset-0 bg-primary rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                     <button className="absolute -bottom-2 -right-2 z-20 w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-xl border-4 border-background hover:scale-110 transition-transform">
                        <Icons.Edit className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Welcome Text */}
                  <div className="text-center md:text-start space-y-4">
                     <ScrollReveal>
                        <h1 className="text-4xl lg:text-6xl font-black text-foreground tracking-tight">
                           {t('welcome', { name: user?.name || (locale === 'ar' ? 'ضيف' : 'Guest') })}
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                           <Icons.Mail className="w-5 h-5" />
                           {user?.email ? formatEmail(user.email) : 'user@example.com'}
                        </p>
                     </ScrollReveal>
                  </div>

                  {/* Quick Action */}
                  <div className="md:mr-auto rtl:md:mr-0 rtl:md:ml-auto">
                     <Button variant="outline" className="h-14 px-8 rounded-2xl border-border/50 font-black gap-3 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all" onClick={() => logout()}>
                        <Icons.Logout className="w-5 h-5" />
                        {t('actions.logout')}
                     </Button>
                  </div>
               </div>
            </div>
         </section>

         <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

               {/* Main Content */}
               <div className="lg:col-span-8 space-y-10">

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     {stats.map((stat, i) => (
                        <ScrollReveal key={i} delay={i * 100}>
                           <Card className="p-6 md:p-8 border-border/50 rounded-4xl bg-card/50 backdrop-blur-xl flex flex-col items-center text-center space-y-3 hover:shadow-lg transition-shadow">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.color}`}>
                                 <stat.icon className="w-8 h-8" />
                              </div>
                              <div>
                                 <p className="text-3xl font-black text-foreground">{stat.value}</p>
                                 <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                              </div>
                           </Card>
                        </ScrollReveal>
                     ))}
                  </div>

                  {/* Recent Orders */}
                  <section className="space-y-6">
                     <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-foreground">{t('sections.recent_orders')}</h2>
                        <Link href="/account/orders">
                           <Button variant="ghost" className="font-black text-primary gap-2">
                              {t('actions.view_all_orders')}
                              <Icons.ChevronRight className="w-5 h-5 rtl:rotate-180" />
                           </Button>
                        </Link>
                     </div>

                     <div className="space-y-4">
                        {mockOrders.map((order, i) => (
                           <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                              <Card className="p-6 border-border/50 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-colors">
                                 <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                                       <Icons.Package className="w-7 h-7" />
                                    </div>
                                    <div>
                                       <h3 className="font-black text-lg">{order.id}</h3>
                                       <p className="text-sm text-muted-foreground font-medium">{order.date}</p>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-10">
                                    <div className="text-end">
                                       <p className="text-lg font-black text-foreground">{order.total} SAR</p>
                                       <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total Price</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest ${order.status === 'delivered' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                                       }`}>
                                       {order.status}
                                    </div>
                                    <Icons.ChevronRight className="w-6 h-6 text-muted-foreground/30 rtl:rotate-180" />
                                 </div>
                              </Card>
                           </motion.div>
                        ))}
                     </div>
                  </section>
               </div>

               {/* Sidebar */}
               <div className="lg:col-span-4 space-y-8">
                  <ScrollReveal animation="slide-up" delay={200}>
                     <section className="space-y-6">
                        <h2 className="text-2xl font-black text-foreground px-2">{t('sections.address_book')}</h2>
                        <Card className="p-8 border-border/50 rounded-[2.5rem] bg-card/50 backdrop-blur-xl border-dashed border-2 flex flex-col items-center justify-center text-center py-12 group cursor-pointer hover:border-primary transition-colors">
                           <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Icons.Plus className="w-8 h-8" />
                           </div>
                           <h3 className="font-black text-lg">{t('actions.add_address')}</h3>
                           <p className="text-sm text-muted-foreground font-medium mt-1">Set your primary delivery location</p>
                        </Card>
                     </section>

                     {/* Account Settings */}
                     <Card className="mt-10 p-4 border-border/50 rounded-[2.5rem] bg-secondary/20 overflow-hidden">
                        <div className="space-y-1">
                           {[
                              { label: t('tabs.profile'), icon: Icons.User },
                              { label: t('tabs.settings'), icon: Icons.Settings },
                              { label: locale === 'ar' ? 'تغيير اللغة' : 'Change Language', icon: Icons.Languages },
                           ].map((item, i) => (
                              <button key={i} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-background transition-all group">
                                 <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                 <span className="font-black text-foreground/80 group-hover:text-foreground">{item.label}</span>
                                 <Icons.ChevronRight className="w-5 h-5 ml-auto rtl:mr-auto rtl:ml-0 text-muted-foreground/30 group-hover:text-primary rtl:rotate-180" />
                              </button>
                           ))}
                        </div>
                     </Card>
                  </ScrollReveal>
               </div>

            </div>
         </div>
      </div>
   );
}
