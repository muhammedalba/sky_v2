import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { env } from "./env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// يمكنك مستقبلاً استبدال هذا الثابت بالقيمة القادمة من الـ API أو الـ State
const FALLBACK_EXCHANGE_RATE = 3.75; 

export function formatCurrency(
  amountInUSD: number, 
  locale: string = env.DEFAULT_LOCALE ?? 'ar' ,
  currentExchangeRate: number = FALLBACK_EXCHANGE_RATE
): string {
  // 1. تحديد ما إذا كانت اللغة عربية
  const isArabic = locale.startsWith('ar');
  
  // 2. حساب المبلغ: إذا عربي نضرب في سعر الصرف، وإذا إنجليزي يبقى بالدولار
  const finalAmount = isArabic ? (amountInUSD * currentExchangeRate) : amountInUSD;
  
  // 3. تحديد كود العملة والتنسيق المحلي
  const currencyCode = isArabic ? 'SAR' : 'USD';
  const formatLocale = isArabic ? 'ar-SA' : 'en-US';

  // 4. إرجاع المبلغ المنسق
  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2, // لضمان عدم ظهور أكثر من رقمين عشريين
  }).format(finalAmount);
}
export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date, locale: string = 'en-US'): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: string | Date, locale: string = 'ar-SA'): string {
  if (!date) return '-';
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return locale.startsWith('ar') ? 'الآن' : 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24 && now.getDate() === d.getDate()) {
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d);
    return locale.startsWith('ar') ? `اليوم، ${time}` : `Today, ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === d.toDateString()) {
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d);
    return locale.startsWith('ar') ? `أمس، ${time}` : `Yesterday, ${time}`;
  }

  return formatDateTime(date, locale);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    processing: 'bg-info/10 text-info',
    shipped: 'bg-primary/10 text-primary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  };
  return statusColors[status] || 'bg-muted text-muted-foreground';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
