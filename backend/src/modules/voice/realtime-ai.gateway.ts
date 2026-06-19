import * as url from 'url';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket as WsWebSocket } from 'ws';

import { RagService } from '../ai/rag.service';
import { LeadIntelligenceService } from '../crm/lead-intelligence.service';
import { VoiceCallService } from './voice-call.service';

@WebSocketGateway({ path: '/voice/stream' })
export class RealtimeAiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeAiGateway.name);
  private readonly openAiWsUrl =
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';

  constructor(
    private configService: ConfigService,
    private ragService: RagService,
    private leadIntelligenceService: LeadIntelligenceService,
    private voiceCallService: VoiceCallService,
  ) {}

  private sessions = new Map<
    WsWebSocket,
    {
      openaiWs: WsWebSocket;
      tenantId: string;
      agentId: string;
      transcript: string;
      leadId?: string;
      callSid?: string;
      voiceProfile?: string;
    }
  >();

  async handleConnection(client: WsWebSocket, request: { url?: string }) {
    this.logger.log('Twilio Voice Client Connected to Gateway');

    const parsedUrl = url.parse(request.url ?? '', true);
    const tenantId = (parsedUrl.query.tenantId as string) || 'default';
    const agentId = (parsedUrl.query.agentId as string) || 'default';
    const leadId = (parsedUrl.query.leadId as string) || undefined;
    const voiceProfile = (parsedUrl.query.voice as string) || 'shimmer';

    const openAiApiKey = this.configService.get('OPENAI_API_KEY');

    if (!openAiApiKey || openAiApiKey === 'mock-api-key') {
      this.logger.warn('OpenAI Key is mock. Closing Twilio connection.');
      client.close();
      return;
    }

    const openaiWs = new WsWebSocket(this.openAiWsUrl, {
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    this.sessions.set(client, {
      openaiWs,
      tenantId,
      agentId,
      transcript: '',
      leadId,
      voiceProfile,
    });

    let streamSid: string | null = null;

    client.on('message', async (data: string) => {
      try {
        const msg = JSON.parse(data);
        if (msg.event === 'start') {
          streamSid = msg.start.streamSid;
          const session = this.sessions.get(client);
          if (session) {
            session.callSid = msg.start.callSid;
          }
          this.logger.log(`Starting media stream: ${streamSid} for tenant: ${tenantId}`);

          const kbContext = await this.ragService.queryKnowledgeBase(
            tenantId,
            'What is this company about?',
            3,
          );

          const instructions = `
            You are a helpful AI voice agent for AutopilotMonster CRM, representing a company.
            Use the following context to answer customer questions naturally and concisely.
            If the answer isn't in the context, be honest but helpful.
            
            COMPANY CONTEXT:
            ${kbContext || 'No specific documents uploaded yet.'}
            
            IDENTITY: You are Agent ID: ${agentId}. Keep responses under 2 sentences for natural flow.
          `;

          openaiWs.send(
            JSON.stringify({
              type: 'session.update',
              session: {
                voice: voiceProfile,
                instructions,
                turn_detection: { type: 'server_vad' },
                input_audio_format: 'g711_ulaw',
                output_audio_format: 'g711_ulaw',
                modalities: ['text', 'audio'],
              },
            }),
          );
        } else if (msg.event === 'media' && openaiWs.readyState === WsWebSocket.OPEN) {
          openaiWs.send(
            JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: msg.media.payload,
            }),
          );
        } else if (msg.event === 'stop') {
          this.logger.log(`Stream stopped: ${streamSid}`);
          openaiWs.close();
        }
      } catch (err) {
        this.logger.error('Error parsing Twilio message', err);
      }
    });

    openaiWs.on('message', (data: string) => {
      try {
        const response = JSON.parse(data);
        if (response.type === 'audio_delta' || response.type === 'response.audio.delta') {
          if (streamSid) {
            client.send(
              JSON.stringify({
                event: 'media',
                streamSid,
                media: { payload: response.delta },
              }),
            );
          }
        } else if (response.type === 'response.audio_transcript.done') {
          const session = this.sessions.get(client);
          if (session) session.transcript += `AI: ${response.transcript}\n`;
        } else if (response.type === 'conversation.item.input_audio_transcription.completed') {
          const session = this.sessions.get(client);
          if (session) session.transcript += `User: ${response.transcript}\n`;
        }
      } catch (e) {
        this.logger.error('Failed to parse OpenAI message', e);
      }
    });

    openaiWs.on('close', () => {
      this.logger.log('OpenAI WS closed');
    });
  }

  async handleDisconnect(client: WsWebSocket) {
    const session = this.sessions.get(client);
    if (session) {
      this.logger.log(`Call ended for tenant ${session.tenantId}. Analyzing transcript...`);

      if (session.callSid && session.transcript.trim()) {
        await this.voiceCallService.persistCallTranscript(
          session.tenantId,
          session.callSid,
          session.transcript,
        );

        const analysis = await this.leadIntelligenceService.analyzeTranscript(session.transcript);
        if (analysis) {
          await this.voiceCallService.persistCallAnalysis(session.tenantId, session.callSid, {
            summary: analysis.summary,
            sentiment: analysis.sentiment,
          });
        }
      }

      if (session.leadId && session.transcript) {
        await this.leadIntelligenceService.analyzeCallOutcome(
          session.tenantId,
          session.leadId,
          session.transcript,
        );
      }

      session.openaiWs.close();
      this.sessions.delete(client);
    }
    this.logger.log('Twilio Voice Client Disconnected');
  }
}
