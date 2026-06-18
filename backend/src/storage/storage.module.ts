import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import type { MinioConfig } from '../config/minio.config';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    StorageService,
    {
      provide: 'MINIO_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): MinioConfig => {
        const minio = configService.get<MinioConfig>('minio');
        if (minio === undefined) {
          throw new Error('MinIO configuration is missing');
        }
        return minio;
      },
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
