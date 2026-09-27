/**
 * Google reCAPTCHA v3 helper.
 * Loads the Google script on first use and returns a token for the given action.
 * Returns undefined when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set (feature disabled).
 *
 * The badge is hidden in globals.css (`.grecaptcha-badge`) — every form using
 * this must render <RecaptchaNotice /> to satisfy Google's terms.
 */
import { isAxiosError } from "axios";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

/** Thrown when the Google script cannot be loaded (network / ad-blocker). */
export class RecaptchaLoadError extends Error {
  constructor() {
    super("Failed to load reCAPTCHA");
    this.name = "RecaptchaLoadError";
  }
}

export const isRecaptchaEnabled = !!SITE_KEY;

let loader: Promise<Grecaptcha> | null = null;

function loadRecaptcha(siteKey: string): Promise<Grecaptcha> {
  if (loader) return loader;

  loader = new Promise<Grecaptcha>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.onload = () => window.grecaptcha!.ready(() => resolve(window.grecaptcha!));
    script.onerror = () => {
      loader = null;
      script.remove();
      reject(new RecaptchaLoadError());
    };
    document.head.appendChild(script);
  });

  return loader;
}

/** Warm up the script ahead of submit (e.g. when a form page opens). Never throws. */
export function preloadRecaptcha(): void {
  if (!SITE_KEY || typeof window === "undefined") return;
  loadRecaptcha(SITE_KEY).catch(() => {
    // retried on submit
  });
}

export async function getRecaptchaToken(action: string): Promise<string | undefined> {
  if (!SITE_KEY || typeof window === "undefined") return undefined;
  const grecaptcha = await loadRecaptcha(SITE_KEY);
  return grecaptcha.execute(SITE_KEY, { action });
}

/** Axios config with the reCAPTCHA header, ready to spread into a request. */
export async function recaptchaHeaders(action: string) {
  const token = await getRecaptchaToken(action);
  return token ? { headers: { "x-recaptcha-token": token } } : {};
}

/** True when a submit failed because of reCAPTCHA (script load or server rejection). */
export function isRecaptchaError(error: unknown): boolean {
  if (error instanceof RecaptchaLoadError) return true;
  return (
    isAxiosError(error) &&
    error.response?.status === 403 &&
    /recaptcha/i.test(error.message)
  );
}
