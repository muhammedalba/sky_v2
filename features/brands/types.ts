import { LocalizedString } from '@/types';

export interface Brand {
  _id: string;
  name: LocalizedString;
  slug?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
