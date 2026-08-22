import { LocalizedString } from '@/types';
import { FileAsset } from '@/shared/types/file-asset';

export interface Brand {
  _id: string;
  name: LocalizedString;
  slug?: string;
  image?: FileAsset | string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
