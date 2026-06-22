import { Injectable, Inject } from '@nestjs/common';
import { StorageProviderToken } from './common/storage/storage.provider.factory';

@Injectable()
export class AppService {
  constructor(
    @Inject(StorageProviderToken) private storageProvider: any
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
}
