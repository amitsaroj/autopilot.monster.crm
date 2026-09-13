import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { ConfigOrchestratorService } from '../../tenant-settings/config-orchestrator.service';
import type {
  AiChatMessage,
  AiChatOptions,
  AiChatResult,
  AiChatStreamChunk,
  AiEmbeddingResult,
  AiFineTuningProvider,
  AiProvider,
  AiSpeechResult,
  AiTranscriptionResult,
} from './ai-provider.interface';
import { OpenAiFineTuningProvider, OpenAiProvider } from './openai.provider';

const PLACEHOLDER_KEYS = new Set(['mock-api-key']);
const isPlaceholderKey = (key: string) =>
  PLACEHOLDER_KEYS.has(key) || key.startsWith('sk-ci-test');

/**
 * Single seam between the app and whichever LLM vendor is configured.
 *
 * Today every tenant resolves to OpenAI — the `resolveProviderName` switch
 * below is the one place that changes when a second provider is added
 * (e.g. reading a tenant's `ai_provider` setting). Every other call site in
 * the app should depend on this service, not on the `openai` package.
 */
@Injectable()
export class AiProviderService {
  private readonly chatProviders = new Map<string, AiProvider>();

  constructor(
    private readonly configService: ConfigService,
    private readonly configOrchestrator: ConfigOrchestratorService,
  ) {}

  async chatComplete(
    tenantId: string | undefined,
    messages: AiChatMessage[],
    options?: AiChatOptions,
  ): Promise<AiChatResult> {
    const provider = await this.getChatProvider(tenantId);
    return provider.chatComplete(messages, options);
  }

  chatCompleteStream(
    tenantId: string | undefined,
    messages: AiChatMessage[],
    options?: AiChatOptions,
  ): AsyncGenerator<AiChatStreamChunk> {
    // Providers are resolved lazily inside the generator so a missing/invalid
    // key surfaces as a normal rejected promise on first `next()`, not a
    // synchronous throw before the caller even starts iterating.
    return this.streamInternal(tenantId, messages, options);
  }

  private async *streamInternal(
    tenantId: string | undefined,
    messages: AiChatMessage[],
    options?: AiChatOptions,
  ): AsyncGenerator<AiChatStreamChunk> {
    const provider = await this.getChatProvider(tenantId);
    yield* provider.chatCompleteStream(messages, options);
  }

  async embed(tenantId: string | undefined, input: string, model?: string): Promise<AiEmbeddingResult> {
    const provider = await this.getChatProvider(tenantId);
    return provider.embed(input, model);
  }

  async transcribeAudio(
    tenantId: string,
    file: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<AiTranscriptionResult> {
    const provider = await this.getChatProvider(tenantId);
    return provider.transcribeAudio(file, filename, mimeType);
  }

  async synthesizeSpeech(tenantId: string, text: string, voice?: string): Promise<AiSpeechResult> {
    const provider = await this.getChatProvider(tenantId);
    return provider.synthesizeSpeech(text, voice);
  }

  /** OpenAI-only today (see `AiFineTuningProvider` doc comment); no per-tenant routing needed yet. */
  getFineTuningProvider(): AiFineTuningProvider | null {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || isPlaceholderKey(apiKey)) {
      return null;
    }
    return new OpenAiFineTuningProvider(new OpenAI({ apiKey }));
  }

  async getChatProvider(tenantId?: string): Promise<AiProvider> {
    const cacheKey = tenantId || 'platform';
    const cached = this.chatProviders.get(cacheKey);
    if (cached) {
      return cached;
    }

    const providerName = await this.resolveProviderName(tenantId);
    const provider = await this.buildProvider(providerName, tenantId);
    this.chatProviders.set(cacheKey, provider);
    return provider;
  }

  /** The one place a second provider gets wired in — see class doc comment. */
  private async resolveProviderName(tenantId?: string): Promise<'openai'> {
    const configured = tenantId
      ? await this.configOrchestrator.get(tenantId, 'ai_provider')
      : undefined;
    // Only 'openai' exists today; a future provider adds a branch here.
    void configured;
    return 'openai';
  }

  private async buildProvider(providerName: 'openai', tenantId?: string): Promise<AiProvider> {
    switch (providerName) {
      case 'openai':
      default: {
        const apiKey = await this.resolveOpenAiKey(tenantId);
        return new OpenAiProvider(new OpenAI({ apiKey }));
      }
    }
  }

  private async resolveOpenAiKey(tenantId?: string): Promise<string> {
    const tenantKey = tenantId
      ? await this.configOrchestrator.get(tenantId, 'openai_key')
      : undefined;
    const apiKey =
      (typeof tenantKey === 'string' && tenantKey.trim()) ||
      this.configService.get<string>('OPENAI_API_KEY') ||
      '';

    if (!apiKey || isPlaceholderKey(apiKey)) {
      throw new ServiceUnavailableException(
        'AI provider is not configured for this tenant. Set openai_key or OPENAI_API_KEY.',
      );
    }

    return apiKey;
  }
}
