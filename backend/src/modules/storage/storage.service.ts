import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import * as Minio from 'minio';
import { Repository } from 'typeorm';

import type { MinioConfig } from '../../config/minio.config';
import { StorageFile } from '../../database/entities/storage-file.entity';

export interface StoredObjectResult {
  objectKey: string;
  downloadUrl: string;
  id?: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

@Injectable()
export class StorageService {
  private readonly client: Minio.Client;
  private readonly bucketAssets: string;
  private readonly bucketBackups: string;

  constructor(
    @Inject('MINIO_CONFIG') config: MinioConfig,
    @InjectRepository(StorageFile)
    private readonly fileRepository: Repository<StorageFile>,
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

  async listFiles(tenantId: string): Promise<StorageFile[]> {
    return this.fileRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getFile(tenantId: string, id: string): Promise<StorageFile> {
    const file = await this.fileRepository.findOne({ where: { id, tenantId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async createPresignedUpload(
    tenantId: string,
    filename: string,
    mimeType: string,
  ): Promise<PresignedUploadResult> {
    await this.ensureBucket(this.bucketAssets);
    const objectKey = `${tenantId}/${randomUUID()}/${filename}`;
    const uploadUrl = await this.client.presignedPutObject(
      this.bucketAssets,
      objectKey,
      3600,
    );

    await this.fileRepository.save(
      this.fileRepository.create({
        tenantId,
        filename,
        objectKey,
        mimeType,
        size: 0,
        bucket: this.bucketAssets,
      }),
    );

    return { uploadUrl, fileKey: objectKey, expiresIn: 3600 };
  }

  async getPresignedDownload(tenantId: string, id: string): Promise<{ downloadUrl: string }> {
    const file = await this.getFile(tenantId, id);
    const downloadUrl = await this.client.presignedGetObject(file.bucket, file.objectKey, 3600);
    return { downloadUrl };
  }

  async deleteFile(tenantId: string, id: string): Promise<void> {
    const file = await this.getFile(tenantId, id);
    await this.client.removeObject(file.bucket, file.objectKey);
    await this.fileRepository.delete({ id, tenantId });
  }

  async upload(
    tenantId: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredObjectResult> {
    const stored = await this.putObject(tenantId, `${randomUUID()}/${filename}`, fileBuffer, mimeType);
    return stored;
  }

  async delete(tenantId: string, key: string): Promise<void> {
    await this.client.removeObject(this.bucketAssets, `${tenantId}/${key}`);
  }

  async putObject(
    tenantId: string,
    relativeKey: string,
    buffer: Buffer,
    mimeType: string,
    useBackupsBucket = false,
  ): Promise<StoredObjectResult> {
    const bucket = useBackupsBucket ? this.bucketBackups : this.bucketAssets;
    await this.ensureBucket(bucket);
    const objectKey = `${tenantId}/${relativeKey}`;

    await this.client.putObject(bucket, objectKey, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    const downloadUrl = await this.client.presignedGetObject(bucket, objectKey, 86400);
    const record = await this.fileRepository.save(
      this.fileRepository.create({
        tenantId,
        filename: relativeKey.split('/').pop() ?? relativeKey,
        objectKey,
        mimeType,
        size: buffer.length,
        bucket,
      }),
    );

    return { objectKey, downloadUrl, id: record.id };
  }

  async getObjectBuffer(tenantId: string, fileKey: string): Promise<Buffer> {
    const objectKey = fileKey.startsWith(`${tenantId}/`) ? fileKey : `${tenantId}/${fileKey}`;
    const stream = await this.client.getObject(this.bucketAssets, objectKey);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  private async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket);
    }
  }
}
