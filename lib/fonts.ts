import localFont from 'next/font/local';

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
 * The woff2 files live in `assets/fonts` (Fontsource 5.3.0, OFL-1.1: the
 * Google Fonts files — Inter latin, Kufi arabic + latin). Local, not
 * `next/font/google`: the build must not depend on reaching Google Fonts
 * (the host's network got font URLs next/font could not parse).
 * globals.css stacks the families: English pages Inter → Kufi; Arabic pages
 * Kufi arabic → Kufi latin (Latin text and 0-9 prices) → Inter.
 *
 * Weight strategy: 3 weights instead of 6 (~50% smaller font payload)
 *  - 400 → body / normal text
 *  - 600 → semibold / labels
 *  - 800 → extrabold / headings (replaces 700 + 900)
 * =============================================================
 */

export const fontInter = localFont({
  src: [
    { path: '../assets/fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/inter-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  // Arabic is the default locale; Inter only covers Latin runs, so keep it
  // off the critical request chain.
  preload: false,
  variable: '--font-inter',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const fontArabic = localFont({
  src: [
    { path: '../assets/fonts/noto-kufi-arabic-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/noto-kufi-arabic-arabic-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/noto-kufi-arabic-arabic-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-arabic',
  fallback: ['Tahoma', 'Arial', 'sans-serif'],
});

/**
 * Kufi's Latin glyphs, a separate file like Google serves them: Latin text
 * and digits on Arabic pages keep the Kufi look. Not preloaded (as with
 * Google); `unicode-range` lets the browser skip it on pages without Latin.
 */
export const fontArabicLatin = localFont({
  src: [
    { path: '../assets/fonts/noto-kufi-arabic-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/noto-kufi-arabic-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/noto-kufi-arabic-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  preload: false,
  variable: '--font-arabic-latin',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

/**
 * Returns the combined className string with all font CSS variables.
 * Both variables are always mounted — CSS handles which one is primary
 * based on `dir` attribute and `unicode-range`.
 */
export function getFontVariables(): string {
  return `${fontInter.variable} ${fontArabic.variable} ${fontArabicLatin.variable}`;
}
