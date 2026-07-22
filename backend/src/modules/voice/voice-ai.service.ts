import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';
import { LeadIntelligenceService } from '../crm/lead-intelligence.service';
import { VoiceCallService } from './voice-call.service';

export type VoiceSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

@Injectable()
export class VoiceAiService {
  private readonly logger = new Logger(VoiceAiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly configOrchestrator: ConfigOrchestratorService,
    private readonly leadIntelligenceService: LeadIntelligenceService,
    private readonly voiceCallService: VoiceCallService,
  ) {}

  private async getOpenAIClient(tenantId: string): Promise<OpenAI> {
    const tenantKey = await this.configOrchestrator.get(tenantId, 'openai_key');
    const apiKey =
      (typeof tenantKey === 'string' && tenantKey.trim()) ||
      this.configService.get<string>('OPENAI_API_KEY') ||
      '';

    if (!apiKey || apiKey === 'mock-api-key') {
      throw new ServiceUnavailableException(
        'OpenAI API key is not configured for this tenant. Set openai_key or OPENAI_API_KEY.',
      );
    }

    return new OpenAI({ apiKey });
  }

  async synthesize(
    tenantId: string,
    text: string,
    voice = 'alloy',
  ): Promise<{ audioBase64: string; contentType: string; voice: string }> {
    if (!text?.trim()) {
      throw new BadRequestException('text is required');
    }

    const client = await this.getOpenAIClient(tenantId);
    const voiceMap: Record<string, 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = {
      alloy: 'alloy',
      echo: 'echo',
      fable: 'fable',
      onyx: 'onyx',
      nova: 'nova',
      shimmer: 'shimmer',
      ash: 'alloy',
      ballad: 'nova',
      coral: 'nova',
      sage: 'onyx',
      verse: 'fable',
    };
    const selectedVoice = voiceMap[voice] ?? 'alloy';

    const response = await client.audio.speech.create({
      model: 'tts-1',
      voice: selectedVoice,
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      audioBase64: buffer.toString('base64'),
      contentType: 'audio/mpeg',
      voice: selectedVoice,
    };
  }

  async transcribe(
    tenantId: string,
    audioUrl: string,
  ): Promise<{ text: string; audioUrl: string; source: 'stored' | 'whisper' }> {
    if (!audioUrl?.trim()) {
      throw new BadRequestException('audioUrl is required');
    }

    const existing = await this.voiceCallService.findByRecordingUrl(tenantId, audioUrl);
    if (existing?.transcript?.trim()) {
      return { text: existing.transcript, audioUrl, source: 'stored' };
    }

    const client = await this.getOpenAIClient(tenantId);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new BadRequestException(
        `Unable to download audio from audioUrl (${audioResponse.status})`,
      );
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    const file = await toFile(Buffer.from(arrayBuffer), 'recording.mp3', {
      type: audioResponse.headers.get('content-type') || 'audio/mpeg',
    });

    const result = await client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    const text = result.text?.trim() || '';
    if (existing && text) {
      await this.voiceCallService.persistTranscriptById(tenantId, existing.id, text);
    }

    return { text, audioUrl, source: 'whisper' };
  }

  async analyzeSentiment(
    tenantId: string,
    callId: string,
  ): Promise<{
    callId: string;
    tenantId: string;
    sentiment: VoiceSentiment;
    keywords: string[];
    confidence: number;
    summary: string;
  }> {
    const call = await this.voiceCallService.findOne(tenantId, callId);
    let transcript = call.transcript?.trim() || '';

    if (!transcript && call.recordingUrl) {
      const transcribed = await this.transcribe(tenantId, call.recordingUrl);
      transcript = transcribed.text;
    }

    if (!transcript) {
      throw new BadRequestException('Call has no transcript or recording available for analysis');
    }

    const analysis = await this.leadIntelligenceService.analyzeTranscript(transcript);
    if (!analysis) {
      throw new ServiceUnavailableException('Sentiment analysis failed');
    }

    await this.voiceCallService.updateAnalysisById(tenantId, call.id, {
      summary: analysis.summary,
      sentiment: analysis.sentiment,
    });

    const keywords = this.extractKeywords(transcript);
    return {
      callId: call.id,
      tenantId,
      sentiment: analysis.sentiment,
      keywords,
      confidence: analysis.score > 0 ? Math.min(analysis.score / 100, 1) : 0.7,
      summary: analysis.summary,
    };
  }

  async cloneVoice(tenantId: string, sampleUrl: string): Promise<{ voiceId: string }> {
    const elevenLabsKey =
      (await this.configOrchestrator.get(tenantId, 'elevenlabs_api_key')) ||
      this.configService.get<string>('ELEVENLABS_API_KEY');

    if (!elevenLabsKey || typeof elevenLabsKey !== 'string') {
      throw new ServiceUnavailableException(
        'Voice cloning requires ELEVENLABS_API_KEY (or tenant elevenlabs_api_key).',
      );
    }

    if (!sampleUrl?.trim()) {
      throw new BadRequestException('sampleUrl is required');
    }

    const audioResponse = await fetch(sampleUrl);
    if (!audioResponse.ok) {
      throw new BadRequestException(`Unable to download sample audio (${audioResponse.status})`);
    }

    const form = new FormData();
    form.append('name', `tenant-${tenantId.slice(0, 8)}`);
    form.append(
      'files',
      new Blob([await audioResponse.arrayBuffer()], {
        type: audioResponse.headers.get('content-type') || 'audio/mpeg',
      }),
      'sample.mp3',
    );

    const cloneResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: { 'xi-api-key': elevenLabsKey },
      body: form,
    });

    if (!cloneResponse.ok) {
      const detail = await cloneResponse.text();
      this.logger.error(`ElevenLabs clone failed: ${detail}`);
      throw new ServiceUnavailableException('Voice clone provider rejected the request');
    }

    const payload = (await cloneResponse.json()) as { voice_id?: string };
    if (!payload.voice_id) {
      throw new ServiceUnavailableException('Voice clone provider returned no voice id');
    }

    return { voiceId: payload.voice_id };
  }

  private extractKeywords(transcript: string): string[] {
    const stop = new Set([
      'the',
      'and',
      'for',
      'that',
      'with',
      'this',
      'from',
      'have',
      'your',
      'you',
      'are',
      'was',
      'were',
      'will',
      'would',
      'could',
      'should',
      'about',
      'into',
      'just',
      'like',
      'they',
      'them',
      'their',
      'what',
      'when',
      'where',
      'which',
      'while',
      'there',
      'here',
      'been',
      'being',
    ]);

    const counts = new Map<string, number>();
    for (const raw of transcript.toLowerCase().match(/[a-z]{4,}/g) || []) {
      if (stop.has(raw)) continue;
      counts.set(raw, (counts.get(raw) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);
  }
}
