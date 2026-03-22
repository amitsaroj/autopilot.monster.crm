import * as crypto from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

const mammoth = require('mammoth'); // For DOCX
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

  async processFileAndIndex(tenantId: string, fileBuffer: Buffer, fileName: string, mimeType: string) {
    this.logger.log(`Processing file ${fileName} (${mimeType}) for tenant ${tenantId}`);
    
    let text = '';
    
    // 1. Parse based on MimeType
    if (mimeType.includes('pdf')) {
      const data = await pdfParse(fileBuffer);
      text = data.text;
    } else if (mimeType.includes('word') || mimeType.includes('officedocument')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else {
      text = fileBuffer.toString('utf-8');
    }

    // 2. Advanced Chunking (1000 chars with 200 char overlap)
    const chunkSize = 1000;
    const overlap = 200;
    const chunks: string[] = [];
    
    for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    // 3. Collection Management
    const collectionName = this.getCollectionName(tenantId);
    try {
      await this.qdrant.getCollection(collectionName);
    } catch {
      this.logger.log(`Creating new collection: ${collectionName}`);
      await this.qdrant.createCollection(collectionName, {
        vectors: { size: 1536, distance: 'Cosine' },
      });
    }

    // 4. Batch Embed & Upsert
    const points = [];
    for (let i = 0; i < chunks.length; i++) {
        try {
            const embeddingResponse = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: chunks[i],
            });

            points.push({
                id: crypto.randomUUID(),
                vector: embeddingResponse.data[0].embedding,
                payload: {
                    tenantId,
                    fileName,
                    text: chunks[i],
                    chunkIndex: i,
                    timestamp: new Date().toISOString()
                },
            });

            // Batch every 20 points
            if (points.length >= 20 || i === chunks.length - 1) {
                await this.qdrant.upsert(collectionName, { wait: true, points: [...points] });
                points.length = 0; // Clear array
            }
        } catch (err) {
            this.logger.error(`Failed to index chunk ${i} for ${fileName}`, err);
        }
    }
    
    return { success: true, chunksIndexed: chunks.length };
  }

  async queryKnowledgeBase(tenantId: string, query: string, limit = 4) {
    const collectionName = this.getCollectionName(tenantId);
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
      
      return results.map(r => r.payload?.['text']).join('\n\n---\n\n');
    } catch (err) {
      this.logger.error(`Query failed for ${tenantId}`, err);
      return '';
    }
  }

  private getCollectionName(tenantId: string): string {
    return `kb_${tenantId.replace(/[^a-zA-Z0-9]/g, '_')}`.toLowerCase();
  }
}
