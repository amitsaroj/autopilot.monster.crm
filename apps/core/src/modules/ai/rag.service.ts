import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import * as crypto from 'crypto';
const pdfParse = require('pdf-parse');

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private qdrant: QdrantClient;
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.qdrant = new QdrantClient({
      url: this.configService.get('qdrant.url') || 'http://localhost:6333',
    });
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || 'mock-api-key',
    });
  }

  async processFileAndIndex(tenantId: string, fileBuffer: Buffer, fileName: string) {
    this.logger.log(`Processing file ${fileName} for tenant ${tenantId}`);
    
    // 1. Parse PDF
    const data = await pdfParse(fileBuffer);
    const text = data.text;

    // 2. Chunk text (simple 1000 char chunks)
    const chunks = text.match(/[\s\S]{1,1000}/g) || [];

    // 3. Ensure Collection Exists
    const collectionName = `tenant_${tenantId}`.replace(/-/g, '_');
    try {
      await this.qdrant.getCollection(collectionName);
    } catch {
      await this.qdrant.createCollection(collectionName, {
        vectors: { size: 1536, distance: 'Cosine' },
      });
    }

    // 4. Generate Embeddings & Upsert (Process in smaller batches to avoid rate limits)
    let totalIndexed = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embeddingResponse = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk,
        });

        await this.qdrant.upsert(collectionName, {
          wait: true,
          points: [
            {
              id: crypto.randomUUID(),
              vector: embeddingResponse.data[0].embedding,
              payload: {
                tenantId,
                fileName,
                text: chunk,
                chunkIndex: i,
              },
            },
          ],
        });
        totalIndexed++;
      } catch (err) {
        this.logger.error(`Failed to index chunk ${i} for ${fileName}`, err);
      }
    }
    
    this.logger.log(`Indexed ${totalIndexed} chunks to ${collectionName}`);
    return { success: true, chunksIndexed: totalIndexed };
  }

  async queryKnowledgeBase(tenantId: string, query: string, limit = 5) {
    const collectionName = `tenant_${tenantId}`.replace(/-/g, '_');
    try {
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      });
      
      const results = await this.qdrant.search(collectionName, {
        vector: embeddingResponse.data[0].embedding,
        limit,
        with_payload: true,
      });
      
      return results.map(r => r.payload);
    } catch (err) {
      this.logger.error(`Failed to query KB for tenant ${tenantId}`, err);
      return [];
    }
  }
}
