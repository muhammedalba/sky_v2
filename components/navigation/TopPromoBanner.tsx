'use client';

import { useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { PromoBannersIcon, XIcon } from "@/shared/ui/Icons";
import { getLocalizedValue } from '@/lib/utils';
import type { PromoBanner } from '@/features/marketing/types';

// ─────────────────────────────────────────────
// مُساعِد localStorage معزول: يُسهّل الاختبار ويمنع التكرار
// ─────────────────────────────────────────────
const STORAGE_KEY = (id: string) => `dismissed-banner-${id}`;

function getDismissedSnapshot(id: string): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY(id));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// هوك مخصص: يُدير حالة الإغلاق بشكل صحيح في SSR + CSR
// ─────────────────────────────────────────────
function useBannerDismissed(bannerId: string | undefined) {
  // useSyncExternalStore: يوفّر snapshots منفصلة للسيرفر والعميل
  // → يمنع Hydration Mismatch تماماً
  const dismissed = useSyncExternalStore(
    // subscribe: نستمع لتغييرات storage من تبويبات أخرى
    useCallback((onStoreChange) => {
      window.addEventListener('storage', onStoreChange);
      return () => window.removeEventListener('storage', onStoreChange);
    }, []),
    // getSnapshot للعميل
    useCallback(
      () => (bannerId ? getDismissedSnapshot(bannerId) : false),
      [bannerId],
    ),
    // getServerSnapshot: البانر مرئي دائماً في SSR (لا وميض)
    () => false,
  );

  const dismiss = useCallback(() => {
    if (!bannerId) return;
    try {
      localStorage.setItem(STORAGE_KEY(bannerId), 'true');
      // نُطلق حدث storage يدوياً لأن الحدث لا يُطلق في نفس التبويب
      window.dispatchEvent(new Event('storage'));
    } catch {
      // localStorage غير متاح (وضع التصفح الخاص أو امتلاء التخزين)
    }
  }, [bannerId]);

  return { dismissed, dismiss };
}

// ─────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────
interface TopPromoBannerProps {
  banner: PromoBanner | null;
}

export default function TopPromoBanner({ banner }: TopPromoBannerProps) {
  const locale = useLocale();
  const t = useTranslations('home.promoBanner');

  const { dismissed, dismiss } = useBannerDismissed(banner?._id);

  // ─── مرئية البانر ───────────────────────────
  const isVisible = !!banner?.isActive && !dismissed;

  // ─── CSS Variable للارتفاع ──────────────────
  // التبعيات مُضيَّقة: isVisible فقط بدلاً من banner كاملاً
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--promo-banner-height',
      isVisible ? '40px' : '0px',
    );
    // cleanup يعمل عند الـ unmount الفعلي للمكوّن
    return () => {
      document.documentElement.style.setProperty('--promo-banner-height', '0px');
    };
  }, [isVisible]);

  // ─── النص المحلي ────────────────────────────
  const localizedText = useMemo(
    () => (banner ? getLocalizedValue<string>(banner.text, locale) : ''),
    [banner, locale],
  );

  // ─── استخراج القيم الأولية لتجنب re-renders زائدة ───
  const bannerLink = banner?.link ?? null;

  // ─── عناصر الماركي ──────────────────────────
  const marqueeItems = useMemo(() => {
    if (!localizedText) return null;

    const singleItem = (
      <span className="inline-flex items-center gap-2 mx-8 text-xs sm:text-sm font-black tracking-wide  uppercase">
        <PromoBannersIcon className="h-4.5 w-4.5 text-warning shrink-0" aria-hidden="true" />
        <span>{localizedText}</span> 
        {bannerLink && (
          <span className="underline decoration-warning/60 hover:decoration-warning transition-all text-xs font-bold text-warning ml-1">
            {t('viewDetails')}
          </span>
        )}
      </span>
    );

    const items = Array.from({ length: 6 }, (_, idx) => (
      <div key={idx} className="flex shrink-0 items-center">
        {singleItem}
      </div>
    ));

    return (
      <div className="flex whitespace-nowrap animate-marquee ">
        {/* النسخة الأولى */}
        <div className="flex shrink-0 items-center justify-around min-w-full">
          {items}
        </div>
        {/* النسخة المكررة للاستمرارية البصرية */}
        <div
          className="flex shrink-0 items-center justify-around min-w-full"
          aria-hidden="true"
        >
          {items}
        </div>
      </div>
    );
  }, [localizedText, bannerLink, t]);

  // ─── معالج الإغلاق ──────────────────────────
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dismiss();
    },
    [dismiss],
  );

  // ─── الحراسة المبكرة ─────────────────────────
  if (!isVisible) return null;

  // ─── المحتوى الداخلي ─────────────────────────
  const innerContent = (
   <div className="w-full h-full relative flex items-center justify-center overflow-hidden mask-image-fade"> 
      {marqueeItems}
    </div>
  );

  return (
    <div
      role="banner"
      aria-label={t('bannerAriaLabel')}
      className="fixed top-0 inset-x-0 z-50 h-10 bg-primary/90  backdrop-blur-xl  font-black text-white tracking-tight flex items-center justify-between overflow-hidden select-none shadow-xs"
    >
      {bannerLink ? (
        <Link href={bannerLink} className="flex-1 h-full flex items-center cursor-pointer">
          {innerContent}
        </Link>
      ) : (
        <div className="flex-1 h-full flex items-center">{innerContent}</div>
      )}

      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-e-2 top-1 z-50 p-1.5 rounded-full bg-destructive text-white hover:bg-destructive/90 cursor-pointer transition-all backdrop-blur-xs"
        aria-label={t('dismissAria')}
      >
        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}