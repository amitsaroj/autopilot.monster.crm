import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SearchResult {
  id: string;
  score: number;
  data: Record<string, any>;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly qdrantUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.qdrantUrl = this.configService.get('QDRANT_URL') || 'http://localhost:6333';
  }

  async index(tenantId: string, collection: string, id: string, data: Record<string, any>): Promise<void> {
    const collectionName = `${tenantId}_${collection}`;
    this.logger.debug(`Indexing document ${id} into ${collectionName}`);

    try {
      // Ensure collection exists
      await this.ensureCollection(collectionName);

      // Upsert point with payload (no vector — payload-only index for keyword search)
      await fetch(`${this.qdrantUrl}/collections/${collectionName}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: [{
            id,
            vector: new Array(384).fill(0), // Placeholder vector for payload-indexed search
            payload: { ...data, _indexedAt: new Date().toISOString() },
          }],
        }),
      });
    } catch (err: any) {
      this.logger.warn(`Qdrant indexing failed for ${id}: ${err.message}. Falling back to no-op.`);
    }
  }

  async search(tenantId: string, collection: string, query: string): Promise<SearchResult[]> {
    const collectionName = `${tenantId}_${collection}`;
    this.logger.debug(`Searching "${query}" in ${collectionName}`);

    try {
      // Scroll with filter for keyword match across payload fields
      const res = await fetch(`${this.qdrantUrl}/collections/${collectionName}/points/scroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 20,
          with_payload: true,
          filter: {
            should: [
              { key: 'name', match: { text: query } },
              { key: 'email', match: { text: query } },
              { key: 'content', match: { text: query } },
              { key: 'title', match: { text: query } },
              { key: 'description', match: { text: query } },
            ],
          },
        }),
      });

      if (!res.ok) {
        this.logger.warn(`Qdrant search returned ${res.status}`);
        return [];
      }

      const data = await res.json() as { result?: { points?: any[] } };
      const points = data.result?.points || [];

      return points.map((p: any) => ({
        id: String(p.id),
        score: 1.0,
        data: p.payload || {},
      }));
    } catch (err: any) {
      this.logger.warn(`Qdrant search failed: ${err.message}. Returning empty results.`);
      return [];
    }
  }

  async deleteDocument(tenantId: string, collection: string, id: string): Promise<void> {
    const collectionName = `${tenantId}_${collection}`;
    try {
      await fetch(`${this.qdrantUrl}/collections/${collectionName}/points/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: [id] }),
      });
    } catch (err: any) {
      this.logger.warn(`Qdrant delete failed for ${id}: ${err.message}`);
    }
  }

  private async ensureCollection(collectionName: string): Promise<void> {
    try {
      const check = await fetch(`${this.qdrantUrl}/collections/${collectionName}`);
      if (check.ok) return;

      await fetch(`${this.qdrantUrl}/collections/${collectionName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectors: { size: 384, distance: 'Cosine' },
        }),
      });
      this.logger.log(`Created Qdrant collection: ${collectionName}`);
    } catch (err: any) {
      this.logger.warn(`Qdrant collection check/create failed: ${err.message}`);
    }
  }
}
