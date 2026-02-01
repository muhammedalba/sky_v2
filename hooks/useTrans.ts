import { useLocale } from 'next-intl';
import { LocalizedString } from '@/types';

/**
 * A utility hook to safely get the translated string from a LocalizedString object.
 * Handles string, object {en, ar}, or null/undefined inputs.
 */
export function useTrans() {
  const locale = useLocale();

  const getTrans = (content: LocalizedString | undefined | null): string => {
    if (!content) return '';

    if (typeof content === 'string') {
      return content;
    }

    if (typeof content === 'object') {
      // Try current locale, then fallback to 'en', then 'ar', then empty
      return (content as Record<string, string>)[locale] || content.en || content.ar || '';
    }

    return '';
  };

  return getTrans;
}
