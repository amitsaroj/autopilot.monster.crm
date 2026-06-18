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

  constructor(@Inject('MINIO_CONFIG') config: MinioConfig) {
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

  async ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      await this.client.makeBucket(bucketName, 'us-east-1');
    }
  }

  async upload(tenantId: string, fileBuffer: Buffer, fileName: string, mimeType: string): Promise<{ url: string; key: string }> {
    await this.ensureBucketExists(this.bucketAssets);
    
    // Generate a unique, tenant-isolated key
    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const key = `${tenantId}/${uniqueFileName}`;
    
    await this.client.putObject(this.bucketAssets, key, fileBuffer, fileBuffer.length, {
      'Content-Type': mimeType,
    });

    const url = `https://${process.env.MINIO_ENDPOINT || 'storage.autopilot.monster'}/${this.bucketAssets}/${key}`;
    return { url, key };
  }

  async delete(tenantId: string, key: string): Promise<void> {
    // Basic safety check to ensure tenant can only delete their own files
    if (!key.startsWith(`${tenantId}/`)) {
      throw new Error('Unauthorized storage access');
    }
    await this.client.removeObject(this.bucketAssets, key);
  }

  async getPresignedUrl(tenantId: string, key: string, expiryInSeconds = 3600): Promise<string> {
    if (!key.startsWith(`${tenantId}/`)) {
      throw new Error('Unauthorized storage access');
    }
    return this.client.presignedGetObject(this.bucketAssets, key, expiryInSeconds);
  }
}
