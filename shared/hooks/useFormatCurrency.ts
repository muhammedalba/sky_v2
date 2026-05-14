'use client';

import { useSettings } from '@/app/providers/SettingsProvider';
import { useLocale } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

/**
 * Hook مساعدة لتنسيق العملة باستخدام إعدادات المتجر (سعر الصرف والعملة الحالية)
 * يغنيك عن الحاجة لجلب الإعدادات في كل مكون يدوياً
 */
export function useFormatCurrency() {
  const settings = useSettings();
  const locale = useLocale();

  /**
   * دالة تنسيق السعر
   * @param amount المبلغ الأساسي (بالدولار مثلاً)
   * @returns المبلغ منسقاً نصياً مع رمز العملة المناسب
   */
  return (amount: number): string => {
    return formatCurrency(
      amount,
      locale,
      settings.exchangeRate,
      settings.currencyCode
    );
  };
}
