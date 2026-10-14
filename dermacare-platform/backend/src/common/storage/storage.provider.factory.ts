import { FactoryProvider } from '@nestjs/common';
import { LocalStorageProvider } from '../../storage/local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';

export const StorageProviderToken = 'StorageProvider';

export const StorageProviderFactory: FactoryProvider = {
  provide: StorageProviderToken,
  useFactory: () => {
    const type = process.env.STORAGE_TYPE || 'local';
    if (type === 's3') {
      return new S3StorageProvider();
    }
    return new LocalStorageProvider();
  },
};
