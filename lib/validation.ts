import * as z from 'zod';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const imageSchema = z.any()
  .refine((val) => val instanceof File || (typeof val === 'string' && val.length > 0), {
    message: 'validation.coverImageRequired',
  })
  .refine((val) => {
    if (!(val instanceof File)) return true;
    return ALLOWED_IMAGE_TYPES.includes(val.type);
  }, {
    message: 'validation.invalidImageFormat',
  })
  .refine((val) => {
    if (!(val instanceof File)) return true;
    return val.size <= MAX_FILE_SIZE;
  }, {
    message: 'validation.fileTooLarge',
  });

export const optionalImageSchema = z.any()
  .optional()
  .refine((val) => {
    if (!val || typeof val === 'string') return true;
    if (val instanceof File) {
      return ALLOWED_IMAGE_TYPES.includes(val.type);
    }
    return true;
  }, {
    message: 'validation.invalidImageFormat',
  })
  .refine((val) => {
    if (!val || !(val instanceof File)) return true;
    return val.size <= MAX_FILE_SIZE;
  }, {
    message: 'validation.fileTooLarge',
  });
