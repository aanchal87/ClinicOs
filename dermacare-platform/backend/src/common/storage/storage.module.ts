import { Module } from '@nestjs/common';
import { StorageProviderFactory } from './storage.provider.factory';

@Module({
  providers: [StorageProviderFactory],
  exports: [StorageProviderFactory],
})
export class StorageModule {}
