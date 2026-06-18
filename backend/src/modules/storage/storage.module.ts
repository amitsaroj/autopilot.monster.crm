import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { MinioConfig } from '../../config/minio.config';
import { StorageFile } from '../../database/entities/storage-file.entity';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { StorageFilesController } from './storage-files.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([StorageFile])],
  controllers: [StorageController, StorageFilesController],
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
