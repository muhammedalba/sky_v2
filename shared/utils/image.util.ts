import { FileAsset } from "../types/file-asset";

/**
 * Safely extracts the displayable image URL from either a legacy string or a FileAsset object.
 *
 * @param image - The image asset object or URL string.
 * @returns The resolved image URL string, or the default image url
 */
export function getImageUrl(image?: FileAsset | string | null): string | null {
  if (!image) return "/assets/images/default.webp";
  if (typeof image === "string") return image;
  return image.url || null;
}

/**
 * Safely extracts the displayable file URL from either a legacy string or a FileAsset object.
 * @param value - The file asset object or URL string.
 * @returns The resolved file URL string, or an empty string if null/undefined.
 
 */
export function getFileUrl(
  value?: string | FileAsset | null,
): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.url;
}
