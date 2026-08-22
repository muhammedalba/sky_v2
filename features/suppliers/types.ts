import { FileAsset } from '@/shared/types/file-asset';

export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactName: string;
  website: URL;
  avatar?: FileAsset | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
