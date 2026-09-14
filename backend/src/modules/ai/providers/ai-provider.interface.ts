/**
 * AI provider adapter — the seam between the rest of the app and whichever
 * LLM vendor is actually configured. Every call site that talks to a model
 * (chat, embeddings, speech, transcription) should go through
 * `AiProviderService`, never instantiate a vendor SDK directly — that's
 * what makes swapping/adding a provider a one-file change instead of a
 * grep-and-replace across the codebase.
 */

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AiChatOptions {
  /** Provider-specific model id. If omitted, the provider picks its own default. */
  model?: string;
  temperature?: number;
  /** Ask the provider to constrain output to a single JSON object. */
  jsonMode?: boolean;
}

export interface AiChatResult {
  content: string;
  usage: AiUsage;
  /** The model actually used to serve the request (may differ from a requested alias). */
  model: string;
}

export interface AiChatStreamChunk {
  delta: string;
  /** Present only on the final chunk, once the provider reports totals. */
  usage?: AiUsage;
}

export interface AiEmbeddingResult {
  embedding: number[];
  usage: AiUsage;
  model: string;
}

export interface AiTranscriptionResult {
  text: string;
}

export interface AiSpeechResult {
  audio: Buffer;
  contentType: string;
}

/**
 * A chat/embedding/speech-capable provider. Not every provider needs to
 * support every method — an implementation that doesn't (e.g. no TTS) should
 * throw a clear `ServiceUnavailableException`-style error rather than fake it.
 */
export interface AiProvider {
  readonly name: string;

  chatComplete(messages: AiChatMessage[], options?: AiChatOptions): Promise<AiChatResult>;

  chatCompleteStream(
    messages: AiChatMessage[],
    options?: AiChatOptions,
  ): AsyncGenerator<AiChatStreamChunk>;

  embed(input: string, model?: string): Promise<AiEmbeddingResult>;

  transcribeAudio(
    file: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<AiTranscriptionResult>;

  synthesizeSpeech(text: string, voice?: string): Promise<AiSpeechResult>;
}

/**
 * Fine-tuning is a materially different, longer-lived workflow (upload a
 * dataset, kick off an async job, poll it) and its shape varies a lot more
 * across vendors than chat/embeddings do. Kept as its own narrower interface
 * rather than folding into `AiProvider` so adding a provider that only does
 * chat doesn't force it to fake a fine-tuning API too.
 */
export interface AiFineTuningJobHandle {
  providerJobId: string;
}

export interface AiFineTuningJobStatus {
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  fineTunedModel?: string;
  errorMessage?: string;
}

export interface AiFineTuningProvider {
  readonly name: string;
  uploadTrainingFile(buffer: Buffer, filename: string): Promise<{ fileId: string }>;
  createJob(params: {
    baseModel: string;
    trainingFileId: string;
    nEpochs?: number;
  }): Promise<AiFineTuningJobHandle>;
  cancelJob(providerJobId: string): Promise<void>;
  retrieveJob(providerJobId: string): Promise<AiFineTuningJobStatus>;
}
