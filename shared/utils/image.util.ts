import { FileAsset } from '../types/file-asset';

/**
 * Safely extracts the displayable image URL from either a legacy string or a FileAsset object.
 *
 * @param image - The image asset object or URL string.
 * @returns The resolved image URL string, or an empty string if null/undefined.
 */
export function getImageUrl(image?: FileAsset | string | null): string {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
}
