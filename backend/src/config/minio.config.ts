import { registerAs } from '@nestjs/config';

import { env } from './env.config';

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
    endpoint: env.minio.endpoint,
    port: env.minio.port,
    useSSL: env.minio.useSSL,
    accessKey: env.minio.accessKey,
    secretKey: env.minio.secretKey,
    bucketAssets: env.minio.bucketAssets,
    bucketBackups: env.minio.bucketBackups,
  }),
);
