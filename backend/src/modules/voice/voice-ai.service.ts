import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';
import { LeadIntelligenceService } from '../crm/lead-intelligence.service';
import { VoiceCallService } from './voice-call.service';
import { AiProviderService } from '../ai/providers/ai-provider.service';

export type VoiceSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

const VOICE_ALIASES: Record<string, string> = {
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

@Injectable()
export class VoiceAiService {
  private readonly logger = new Logger(VoiceAiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly configOrchestrator: ConfigOrchestratorService,
    private readonly leadIntelligenceService: LeadIntelligenceService,
    private readonly voiceCallService: VoiceCallService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async synthesize(
    tenantId: string,
    text: string,
    voice = 'alloy',
  ): Promise<{ audioBase64: string; contentType: string; voice: string }> {
    if (!text?.trim()) {
      throw new BadRequestException('text is required');
    }

    const selectedVoice = VOICE_ALIASES[voice] ?? 'alloy';
    const { audio, contentType } = await this.aiProviderService.synthesizeSpeech(
      tenantId,
      text,
      selectedVoice,
    );

    return {
      audioBase64: audio.toString('base64'),
      contentType,
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

    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new BadRequestException(
        `Unable to download audio from audioUrl (${audioResponse.status})`,
      );
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    const { text: transcribed } = await this.aiProviderService.transcribeAudio(
      tenantId,
      Buffer.from(arrayBuffer),
      'recording.mp3',
      audioResponse.headers.get('content-type') || 'audio/mpeg',
    );

    const text = transcribed.trim();
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
