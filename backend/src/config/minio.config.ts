import { registerAs } from '@nestjs/config';

export interface MinioConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketAssets: string;
  bucketBackups: string;
}

export const minioConfig = registerAs(
  'minio',
  (): MinioConfig => ({
    endpoint: process.env['MINIO_ENDPOINT'] ?? 'localhost',
    port: parseInt(process.env['MINIO_PORT'] ?? '9000', 10),
    useSSL: process.env['MINIO_USE_SSL'] === 'true',
    accessKey: process.env['MINIO_ACCESS_KEY'] ?? 'minioadmin',
    secretKey: process.env['MINIO_SECRET_KEY'] ?? 'minioadmin',
    bucketAssets: process.env['MINIO_BUCKET_ASSETS'] ?? 'autopilot-assets',
    bucketBackups: process.env['MINIO_BUCKET_BACKUPS'] ?? 'autopilot-backups',
  }),
);
