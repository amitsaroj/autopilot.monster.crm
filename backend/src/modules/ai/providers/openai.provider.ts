import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

import type {
  AiChatMessage,
  AiChatOptions,
  AiChatResult,
  AiChatStreamChunk,
  AiEmbeddingResult,
  AiFineTuningJobHandle,
  AiFineTuningJobStatus,
  AiFineTuningProvider,
  AiProvider,
  AiSpeechResult,
  AiTranscriptionResult,
} from './ai-provider.interface';

const DEFAULT_CHAT_MODEL = 'gpt-4o';
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
const TTS_MODEL = 'tts-1';
const TRANSCRIPTION_MODEL = 'whisper-1';

const TTS_VOICES = new Set(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']);

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';

  constructor(private readonly client: OpenAI) {}

  async chatComplete(
    messages: AiChatMessage[],
    options: AiChatOptions = {},
  ): Promise<AiChatResult> {
    const model = options.model || DEFAULT_CHAT_MODEL;
    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      ...(options.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    });

    return {
      content: response.choices[0]?.message?.content ?? '',
      model: response.model || model,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }

  async *chatCompleteStream(
    messages: AiChatMessage[],
    options: AiChatOptions = {},
  ): AsyncGenerator<AiChatStreamChunk> {
    const model = options.model || DEFAULT_CHAT_MODEL;
    const stream = await this.client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
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
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield { delta };
      }
    }

    if (inputTokens > 0 || outputTokens > 0) {
      yield { delta: '', usage: { inputTokens, outputTokens } };
    }
  }

  async embed(input: string, model = DEFAULT_EMBEDDING_MODEL): Promise<AiEmbeddingResult> {
    const response = await this.client.embeddings.create({ model, input });
    return {
      embedding: response.data[0].embedding,
      model: response.model || model,
      usage: {
        inputTokens: response.usage?.total_tokens ?? 0,
        outputTokens: 0,
      },
    };
  }

  async transcribeAudio(
    file: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<AiTranscriptionResult> {
    const uploadFile = await toFile(file, filename, { type: mimeType });
    const result = await this.client.audio.transcriptions.create({
      file: uploadFile,
      model: TRANSCRIPTION_MODEL,
    });
    return { text: result.text?.trim() || '' };
  }

  async synthesizeSpeech(text: string, voice = 'alloy'): Promise<AiSpeechResult> {
    const selectedVoice = (TTS_VOICES.has(voice) ? voice : 'alloy') as
      | 'alloy'
      | 'echo'
      | 'fable'
      | 'onyx'
      | 'nova'
      | 'shimmer';

    const response = await this.client.audio.speech.create({
      model: TTS_MODEL,
      voice: selectedVoice,
      input: text,
      response_format: 'mp3',
    });

    return {
      audio: Buffer.from(await response.arrayBuffer()),
      contentType: 'audio/mpeg',
    };
  }
}

export class OpenAiFineTuningProvider implements AiFineTuningProvider {
  readonly name = 'openai';

  constructor(private readonly client: OpenAI) {}

  async uploadTrainingFile(buffer: Buffer, filename: string): Promise<{ fileId: string }> {
    const uploadFile = await toFile(buffer, filename, { type: 'application/jsonl' });
    const uploaded = await this.client.files.create({ file: uploadFile, purpose: 'fine-tune' });
    return { fileId: uploaded.id };
  }

  async createJob(params: {
    baseModel: string;
    trainingFileId: string;
    nEpochs?: number;
  }): Promise<AiFineTuningJobHandle> {
    const job = await this.client.fineTuning.jobs.create({
      model: params.baseModel,
      training_file: params.trainingFileId,
      ...(typeof params.nEpochs === 'number'
        ? { hyperparameters: { n_epochs: params.nEpochs } }
        : {}),
    });
    return { providerJobId: job.id };
  }

  async cancelJob(providerJobId: string): Promise<void> {
    await this.client.fineTuning.jobs.cancel(providerJobId);
  }

  async retrieveJob(providerJobId: string): Promise<AiFineTuningJobStatus> {
    const job = await this.client.fineTuning.jobs.retrieve(providerJobId);
    return {
      status: mapOpenAiFineTuningStatus(job.status),
      fineTunedModel: job.fine_tuned_model ?? undefined,
      errorMessage: job.error?.message ?? undefined,
    };
  }
}

function mapOpenAiFineTuningStatus(status: string): AiFineTuningJobStatus['status'] {
  switch (status) {
    case 'validating_files':
    case 'queued':
    case 'running':
      return 'running';
    case 'succeeded':
      return 'succeeded';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'running';
  }
}
