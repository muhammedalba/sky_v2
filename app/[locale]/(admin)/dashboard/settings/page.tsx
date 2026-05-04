'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Icons } from '@/shared/ui/Icons';
import { Button } from '@/shared/ui/Button';

export default function SettingsPage() {
  const t = useTranslations('navigation');

  const settingsSections = [
    {
      title: 'Store Configuration',
      description: 'Manage your store name, branding, and global availability.',
      icon: Icons.Dashboard,
      actions: ['Edit Details']
    },
    {
      title: 'Global Notifications',
      description: 'Choose how you want to be alerted about new orders and stock updates.',
      icon: Icons.Menu, // Notification proxy
      actions: ['Configure Alerts']
    },
    {
      title: 'System Security',
      description: 'Update your authentication methods and manage staff access level.',
      icon: Icons.Settings,
      actions: ['View Permissions', 'Change Password']
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          {t('settings')}
        </h1>
        <p className="text-muted-foreground text-lg font-medium mt-1">
          Fine-tune your dashboard experience and store operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {settingsSections.map((section, i) => (
          <Card key={i} className="border-none shadow-sm ring-1 ring-border/50 hover:ring-primary/20 transition-all duration-300">
             <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="p-3 rounded-2xl bg-secondary/30 text-primary">
                   <section.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                   <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                   <CardDescription className="text-sm font-medium mt-1">{section.description}</CardDescription>
                </div>
             </CardHeader>
             <CardContent>
                <div className="flex flex-wrap gap-3 mt-4">
                   {section.actions.map((action, j) => (
                      <Button key={j} variant={j === 0 ? "default" : "outline"} className="rounded-xl px-6 font-bold h-10 text-sm">
                         {action}
                      </Button>
                   ))}
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

       {/* Support Section */}
       <div className="max-w-4xl p-8 rounded-4xl bg-linear-to-brfrom-primary to-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-primary/20">
          <div>
             <h3 className="text-2xl font-black tracking-tight">Need help with your store?</h3>
             <p className="opacity-80 font-medium mt-1">Our premium support team is available 24/7 to help you scale.</p>
          </div>
          <Button className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 font-black h-12 shadow-lg">
             Contact Support
          </Button>
       </div>
    </div>
  );
}
