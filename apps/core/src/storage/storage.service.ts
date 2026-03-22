import { Injectable, Inject } from '@nestjs/common';
import * as Minio from 'minio';


import type { MinioConfig } from '../config/minio.config';

/**
 * StorageService — wraps MinIO client.
 * Business logic (upload/download/delete) to be implemented in execution phase.
 */
@Injectable()
export class StorageService {
  private readonly client: Minio.Client;
  private readonly bucketAssets: string;
  private readonly bucketBackups: string;

  constructor(
    @Inject('MINIO_CONFIG') config: MinioConfig,
  ) {
    this.client = new Minio.Client({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucketAssets = config.bucketAssets;
    this.bucketBackups = config.bucketBackups;
  }

  getClient(): Minio.Client {
    return this.client;
  }

  getAssetsBucket(): string {
    return this.bucketAssets;
  }

  getBackupsBucket(): string {
    return this.bucketBackups;
  }
}
