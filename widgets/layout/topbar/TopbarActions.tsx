"use client";

import { memo, useTransition, useCallback } from "react";
import { useUIStore } from "@/store/ui-store";
import { useCurrencyStore } from "@/store/currency-store";
import { useUsdNoticeStore } from "@/store/usd-notice-store";
import { useRouter, usePathname } from "@/navigation";
import { useParams } from "next/navigation";
import { MoonIcon, SunIcon } from "@/shared/ui/Icons";
import { cn } from "@/lib/utils";

import NotificationBell from "@/features/notifications/components/NotificationBell";

const TopbarActions = ({
  showThemeSwitcher = true,
  showLocaleSwitcher = true,
  showBar = true,
  warnUsdOnLocaleSwitch = false,
}: {
  showThemeSwitcher?: boolean;
  showLocaleSwitcher?: boolean;
  showBar?: boolean;
  /** Only the storefront mounts the USD notice modal — dashboard/auth usages leave this off. */
  warnUsdOnLocaleSwitch?: boolean;
}) => {
  // 1. استخراج القيم بشكل محدد لتحسين الأداء
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const currencyOverride = useCurrencyStore((state) => state.override);
  const openUsdNotice = useUsdNoticeStore((state) => state.open);

  const { locale } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // 2. تحصين دالة تغيير المظهر باستخدام useCallback
  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // 3. Prefetch the alternate locale on mount so switching is instant
  // useEffect(() => {
  //   const otherLocale = locale === "ar" ? "en" : "ar";
  //   router.prefetch(pathname, { locale: otherLocale as "ar" | "en" });
  // }, [locale, pathname, router]);

  // 4. تحصين دالة تغيير اللغة باستخدام useCallback
  const switchLocale = useCallback(
    (newLocale: "en" | "ar") => {
      if (newLocale === locale || isPending) return; // منع التغيير إذا كان هو المختار حالياً أو قيد المعالجة

      // Automatic currency follows the language (ar -> base, other -> USD),
      // so switching away from Arabic without a manual override silently
      // flips the displayed currency to an approximate USD conversion too —
      // warn the shopper the same way the currency toggle does.
      if (warnUsdOnLocaleSwitch && currencyOverride === null && locale === "ar" && newLocale === "en") {
        openUsdNotice();
      }

      startTransition(() => {
        router.replace(pathname, { locale: newLocale });
      });
    },
    [locale, isPending, pathname, router, currencyOverride, openUsdNotice, warnUsdOnLocaleSwitch],
  );

  return (
    <div className="flex items-center gap-3 ">
      {/* Locale Switcher */}
      {showLocaleSwitcher && (
        <div
          className={cn(
            "flex items-center bg-muted/40 rounded-lg p-1 border border-border/40 transition-opacity",
            isPending && "opacity-50 pointer-events-none", // تعتيم الأزرار أثناء الانتقال
          )}
        >
          {(["en", "ar"] as const).map((l) => (
            <button
              key={l}
              type="button" // تحديد النوع لضمان عدم سلوكه كـ Submit
              onClick={() => switchLocale(l)}
              disabled={isPending}
              className={cn(
                "px-2.5 py-1 cursor-pointer active:scale-110 rounded-md text-[10px] uppercase font-bold transition-all",
                locale === l
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {showBar && <div className="h-4 w-px bg-border/60" />}

      {showThemeSwitcher && (
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors text-foreground hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <MoonIcon className="h-4 w-4" />
          ) : (
            <SunIcon className="h-4 w-4" />
          )}
        </button>
      )}
      {showThemeSwitcher && showLocaleSwitcher && <NotificationBell />}
    </div>
  );
};

export default memo(TopbarActions);
