'use client';

import { useTranslations } from 'next-intl';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import SendNotificationForm from '@/features/notifications/components/dashboard/SendNotificationForm';

export default function SendNotificationPage() {
  const t = useTranslations('notifications.admin');

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('sendTitle')}
        subtitle={t('sendDesc')}
      />

      <SendNotificationForm />
    </div>
  );
}
