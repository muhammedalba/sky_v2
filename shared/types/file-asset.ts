export type StorageProviderType = 'local' | 'cloudinary';

export interface FileAsset {
  url: string;
  publicId: string;
  provider?: StorageProviderType;
}
