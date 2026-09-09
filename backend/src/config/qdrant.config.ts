import { registerAs } from '@nestjs/config';

import { env } from './env.config';

export interface QdrantConfig {
  url: string;
  apiKey: string;
  collectionCrm: string;
  collectionAi: string;
}

export const qdrantConfig = registerAs(
  'qdrant',
  (): QdrantConfig => ({
    url: env.qdrant.url,
    apiKey: env.qdrant.apiKey,
    collectionCrm: env.qdrant.collectionCrm,
    collectionAi: env.qdrant.collectionAi,
  }),
);
