'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { SettingsInput } from '../../settings.schema';

export default function PaymentsSection() {
  const t = useTranslations('settings');
  const { setValue, control } = useFormContext<SettingsInput>();

  // Axis 2.1: useWatch for gateways
  const stripe = useWatch({ control, name: 'gateways.stripe' });
  const paypal = useWatch({ control, name: 'gateways.paypal' });
  const bankTransfer = useWatch({ control, name: 'gateways.bankTransfer' });
  const cod = useWatch({ control, name: 'gateways.cod' });

  const gatewayList = useMemo(() => [
    { id: 'gateways.stripe', name: 'Stripe', icon: Icons.Orders, value: stripe },
    { id: 'gateways.paypal', name: 'PayPal', icon: Icons.Box, value: paypal },
    { id: 'gateways.bankTransfer', name: 'Bank Transfer', icon: Icons.RefreshCw, value: bankTransfer },
    { id: 'gateways.cod', name: 'Cash on Delivery', icon: Icons.Truck, value: cod },
  ], [stripe, paypal, bankTransfer, cod]);

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <Icons.Orders className="w-5 h-5 text-warning" /> {t('payments.title')}
        </CardTitle>
        <CardDescription>{t('payments.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gatewayList.map((gateway) => (
            <div
              key={gateway.id}
              className="flex items-center justify-between p-4 border border-border/50 rounded-2xl hover:bg-muted/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <gateway.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{gateway.name}</span>
              </div>
              <Switch
                checked={!!gateway.value}
                onCheckedChange={(checked) => setValue(gateway.id as any, checked, { shouldDirty: true })}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
