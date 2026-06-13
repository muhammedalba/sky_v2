'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { RefreshCwIcon } from "@/shared/ui/Icons";
import { SettingsInput } from '../../settings.schema';

export default function BankTransferSection() {
  const t = useTranslations('settings');
  const { register, formState: { errors } } = useFormContext<SettingsInput>();

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <RefreshCwIcon className="w-5 h-5 text-primary" /> {t('bankTransfer.title')}
        </CardTitle>
        <CardDescription>{t('bankTransfer.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t('bankTransfer.bankName')}
            placeholder={t('bankTransfer.bankNamePlaceholder')}
            {...register('bankTransferDetails.bankName')}
            error={errors.bankTransferDetails?.bankName?.message}
          />
          <Input
            label={t('bankTransfer.accountName')}
            placeholder={t('bankTransfer.accountNamePlaceholder')}
            {...register('bankTransferDetails.accountName')}
            error={errors.bankTransferDetails?.accountName?.message}
          />
          <Input
            label={t('bankTransfer.accountNumber')}
            placeholder={t('bankTransfer.accountNumberPlaceholder')}
            {...register('bankTransferDetails.accountNumber')}
            error={errors.bankTransferDetails?.accountNumber?.message}
          />
          <Input
            label={t('bankTransfer.iban')}
            placeholder={t('bankTransfer.ibanPlaceholder')}
            {...register('bankTransferDetails.iban')}
            error={errors.bankTransferDetails?.iban?.message}
          />
        </div>
      </CardContent>
    </Card>
  );
}
