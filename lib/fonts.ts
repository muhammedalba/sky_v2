import { Inter, Noto_Kufi_Arabic } from 'next/font/google';

/**
 * =============================================================
 * 🔤 Font Configuration — skyGalaxy
 * =============================================================
 *
 * Strategy: CSS Variables + next/font for zero-FOUT, self-hosted fonts
 *
 * - `Inter`           → Latin/English text (modern, highly readable)
 * - `Noto Kufi Arabic` → Arabic text (premium, Google-designed for Arabic)
 *
 * next/font handles:
 *  ✅ Self-hosting (no external Google Fonts requests)
 *  ✅ Automatic font subsetting (smaller file sizes)
 *  ✅ size-adjust for zero Cumulative Layout Shift (CLS)
 *  ✅ preload only the subsets actually needed
 *
 * Weight strategy: 3 weights instead of 6 (~50% smaller font payload)
 *  - 400 → body / normal text
 *  - 600 → semibold / labels
 *  - 800 → extrabold / headings (replaces 700 + 900)
 * =============================================================
 */

export const fontInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '600', '800'],
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const fontArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
  weight: ['400', '600', '800'],
  fallback: ['Tahoma', 'Arial', 'sans-serif'],
});

/**
 * Returns the combined className string with both font CSS variables.
 * Both variables are always mounted — CSS handles which one is primary
 * based on `dir` attribute and `unicode-range`.
 */
export function getFontVariables(): string {
  return `${fontInter.variable} ${fontArabic.variable}`;
}
