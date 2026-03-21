import { registerAs } from '@nestjs/config';

export interface QdrantConfig {
  url: string;
  apiKey: string;
  collectionCrm: string;
  collectionAi: string;
}

export const qdrantConfig = registerAs(
  'qdrant',
  (): QdrantConfig => ({
    url: process.env['QDRANT_URL'] ?? 'http://localhost:6333',
    apiKey: process.env['QDRANT_API_KEY'] ?? '',
    collectionCrm: process.env['QDRANT_COLLECTION_CRM'] ?? 'crm-vectors',
    collectionAi: process.env['QDRANT_COLLECTION_AI'] ?? 'ai-vectors',
  }),
);
