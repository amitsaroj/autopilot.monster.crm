import * as crypto from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

import { QdrantConfig } from '../../config/qdrant.config';
import { BillingService } from '../billing/billing.service';
import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';
import { BillingService } from '../billing/billing.service';

const MODEL_COST_PER_1K: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'text-embedding-3-small': { input: 0.00002, output: 0 },
};

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private qdrant: QdrantClient;
  private openaiClients: Map<string, OpenAI> = new Map();

  constructor(
    private configService: ConfigService,
    private configOrchestrator: ConfigOrchestratorService,
    private billingService: BillingService,
  ) {
    const qdrantCfg = this.configService.get<QdrantConfig>('qdrant');
    this.qdrant = new QdrantClient({
      url: qdrantCfg?.url || 'http://localhost:6333',
      ...(qdrantCfg?.apiKey ? { apiKey: qdrantCfg.apiKey } : {}),
    });
  }

  private async getOpenAIClient(tenantId?: string): Promise<OpenAI> {
    const cacheKey = tenantId || 'platform';
    if (this.openaiClients.has(cacheKey)) {
      return this.openaiClients.get(cacheKey)!;
    }

    const apiKey = await this.configOrchestrator.get(tenantId || '', 'openai_key');
    const client = new OpenAI({
      apiKey: apiKey || this.configService.get('OPENAI_API_KEY') || 'mock-api-key',
    });

    this.openaiClients.set(cacheKey, client);
    return client;
  }

  private async getEmbeddingModel(tenantId: string): Promise<string> {
    const configured = await this.configOrchestrator.get(tenantId, 'ai_embedding_model');
    return configured || 'text-embedding-3-small';
  }

  private async getDefaultChatModel(tenantId: string): Promise<string> {
    const configured = await this.configOrchestrator.get(tenantId, 'ai_default_model');
    return configured || 'gpt-4o';
  }

  async processFileAndIndex(
    tenantId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    knowledgeBaseId?: string,
  ) {
    this.logger.log(`Processing file ${fileName} (${mimeType}) for tenant ${tenantId}`);

    let text = '';

    if (mimeType.includes('pdf')) {
      const data = await pdfParse(fileBuffer);
      text = data.text;
    } else if (mimeType.includes('word') || mimeType.includes('officedocument')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else {
      text = fileBuffer.toString('utf-8');
    }

    if (!text.trim()) {
      return { success: false, chunksIndexed: 0, error: 'No extractable text in document' };
    }

    const chunkSize = 1000;
    const overlap = 200;
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    const collectionName = this.getCollectionName(tenantId);
    try {
      await this.qdrant.getCollection(collectionName);
    } catch {
      this.logger.log(`Creating new collection: ${collectionName}`);
      await this.qdrant.createCollection(collectionName, {
        vectors: { size: 1536, distance: 'Cosine' },
      });
    }

    const openai = await this.getOpenAIClient(tenantId);
    const embeddingModel = await this.getEmbeddingModel(tenantId);
    const documentId = crypto.randomUUID();
    const points = [];
    let embeddingTokens = 0;

    for (let i = 0; i < chunks.length; i++) {
      try {
        const embeddingResponse = await openai.embeddings.create({
          model: embeddingModel,
          input: chunks[i],
        });

        embeddingTokens += embeddingResponse.usage?.total_tokens ?? 0;

        points.push({
          id: crypto.randomUUID(),
          vector: embeddingResponse.data[0].embedding,
          payload: {
            tenantId,
            knowledgeBaseId: knowledgeBaseId ?? null,
            documentId,
            fileName,
            text: chunks[i],
            chunkIndex: i,
            timestamp: new Date().toISOString(),
          },
        });

        if (points.length >= 20 || i === chunks.length - 1) {
          await this.qdrant.upsert(collectionName, { wait: true, points: [...points] });
          points.length = 0;
        }
      } catch (err) {
        this.logger.error(`Failed to index chunk ${i} for ${fileName}`, err);
      }
    }

    if (tenantId && embeddingTokens > 0) {
      await this.recordUsage(tenantId, embeddingTokens, embeddingModel, 0);
    }

    return {
      success: true,
      chunksIndexed: chunks.length,
      documentId,
      fileName,
      embeddingTokens,
    };
  }

  async queryKnowledgeBase(
    tenantId: string,
    query: string,
    limit = 4,
    knowledgeBaseIds?: string[],
  ) {
    const collectionName = this.getCollectionName(tenantId);
    const openai = await this.getOpenAIClient(tenantId);
    const embeddingModel = await this.getEmbeddingModel(tenantId);

    try {
      const embeddingResponse = await openai.embeddings.create({
        model: embeddingModel,
        input: query,
      });

      const filter =
        knowledgeBaseIds && knowledgeBaseIds.length > 0
          ? {
              must: [
                {
                  key: 'knowledgeBaseId',
                  match: { any: knowledgeBaseIds },
                },
              ],
            }
          : undefined;

      const results = await this.qdrant.search(collectionName, {
        vector: embeddingResponse.data[0].embedding,
        limit,
        with_payload: true,
        ...(filter ? { filter } : {}),
      });

      const embeddingTokens = embeddingResponse.usage?.total_tokens ?? 0;
      if (embeddingTokens > 0) {
        await this.recordUsage(tenantId, embeddingTokens, embeddingModel, 0);
      }

      return results.map((r) => r.payload?.['text']).join('\n\n---\n\n');
    } catch (err) {
      this.logger.error(`Query failed for ${tenantId}`, err);
      return '';
    }
  }

  async generate(
    tenantId: string | undefined,
    prompt: string,
    options: Record<string, unknown> = {},
  ): Promise<string | null> {
    this.logger.log(`Generating text for prompt: ${prompt.slice(0, 50)}...`);
    
    const primaryModel = options.model || 'gpt-4o';
    const fallbackModel = 'gpt-4o-mini';

    try {
      return await this._generateInternal(tenantId, prompt, primaryModel, options);
    } catch (err) {
      this.logger.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}`);
      try {
        return await this._generateInternal(tenantId, prompt, fallbackModel, options);
      } catch (fallbackErr) {
        this.logger.error('All LLM providers failed', fallbackErr);
        throw fallbackErr;
      }
    }
  }

  private async _generateInternal(tenantId: string | undefined, prompt: string, model: string, options: any) {
    const openai = await this.getOpenAIClient(tenantId);
    const model =
      typeof options.model === 'string'
        ? options.model
        : tenantId
          ? await this.getDefaultChatModel(tenantId)
          : 'gpt-4o';
    const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    const content = response.choices[0].message.content;
    if (tenantId) {
      await this.recordUsage(
        tenantId,
        response.usage?.prompt_tokens ?? 0,
        model,
        response.usage?.completion_tokens ?? 0,
      );
    }

    return content;
  }

  async *streamGenerate(
    tenantId: string | undefined,
    prompt: string,
    options: Record<string, unknown> = {},
  ): AsyncGenerator<string> {
    const openai = await this.getOpenAIClient(tenantId);
    const model =
      typeof options.model === 'string'
        ? options.model
        : tenantId
          ? await this.getDefaultChatModel(tenantId)
          : 'gpt-4o';
    const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;

    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      stream: true,
      stream_options: { include_usage: true },
    });

    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of stream) {
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens ?? inputTokens;
        outputTokens = chunk.usage.completion_tokens ?? outputTokens;
      }
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }

    if (tenantId && (inputTokens > 0 || outputTokens > 0)) {
      await this.recordUsage(tenantId, inputTokens, model, outputTokens);
    }
  }

  async analyze(tenantId: string | undefined, text: string, task: string) {
    this.logger.log(`Analyzing text for task: ${task}`);
    const openai = await this.getOpenAIClient(tenantId);
    const model = tenantId ? await this.getDefaultChatModel(tenantId) : 'gpt-4o';
    const prompt = `Task: ${task}\n\nText: ${text}\n\nProvide the analysis in JSON format.`;
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are an AI data analyst.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    if (tenantId) {
      await this.recordUsage(
        tenantId,
        response.usage?.prompt_tokens ?? 0,
        model,
        response.usage?.completion_tokens ?? 0,
      );
    }

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  async getModels() {
    return [
      { id: 'gpt-4o', name: 'GPT-4o (Best)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
      { id: 'text-embedding-3-small', name: 'Embedding (V3 Small)' },
    ];
  }

  async getUsage(tenantId: string) {
    const usage = await this.billingService.getUsageBreakdown(tenantId);
    const aiTokens = Number(usage['ai_tokens'] ?? 0);
    const aiCost = Number(usage['ai_cost'] ?? 0);

    return {
      tenantId,
      tokensUsed: aiTokens,
      cost: aiCost / 10000,
      metrics: usage,
      period: 'monthly',
    };
  }

  private async recordUsage(
    tenantId: string,
    inputTokens: number,
    model: string,
    outputTokens: number,
  ): Promise<void> {
    const totalTokens = inputTokens + outputTokens;
    if (totalTokens <= 0) {
      return;
    }

    const pricing = MODEL_COST_PER_1K[model] ?? MODEL_COST_PER_1K['gpt-4o'];
    const cost =
      (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;

    await this.billingService.trackUsage(tenantId, 'ai_tokens', totalTokens);
    if (cost > 0) {
      await this.billingService.trackUsage(tenantId, 'ai_cost', Math.round(cost * 10000));
    }
  }

  private getCollectionName(tenantId: string): string {
    return `kb_${tenantId.replace(/[^a-zA-Z0-9]/g, '_')}`.toLowerCase();
  }
}
