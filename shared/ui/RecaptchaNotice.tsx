"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { isRecaptchaEnabled, preloadRecaptcha } from "@/lib/recaptcha";

/**
 * Google-required attribution shown in place of the hidden reCAPTCHA badge.
 * Also preloads the reCAPTCHA script once the browser is idle, so the first
 * submit doesn't wait for it.
 */
export default function RecaptchaNotice({ className = "" }: { className?: string }) {
  const t = useTranslations("common.recaptcha");

  useEffect(() => {
    if (!isRecaptchaEnabled) return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preloadRecaptcha, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(preloadRecaptcha, 1500);
    return () => clearTimeout(id);
  }, []);

  if (!isRecaptchaEnabled) return null;

  const linkClass = "underline hover:text-foreground";

  return (
    <p className={`text-center text-[11px] text-muted-foreground ${className}`}>
      {t.rich("notice", {
        privacy: (chunks) => (
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
            {chunks}
          </a>
        ),
        terms: (chunks) => (
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className={linkClass}>
            {chunks}
          </a>
        ),
      })}
    </p>
  );
}
