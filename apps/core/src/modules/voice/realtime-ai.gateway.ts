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

/**
 * Native WebSocket Server mapped to '/voice/stream'
 * Listens for Twilio Media Streams (G.711 mulaw audio base64 encoded)
 * Connects proxy to OpenAI Realtime API via WebSockets.
 */
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
  ) {}

  private sessions = new Map<
    WsWebSocket,
    {
      openaiWs: WsWebSocket;
      tenantId: string;
      agentId: string;
      transcript: string;
      leadId?: string;
    }
  >();

  async handleConnection(client: WsWebSocket, request: any) {
    this.logger.log('Twilio Voice Client Connected to Gateway');

    // Extract tenantId and agentId from query params (e.g., /voice/stream?tenantId=...&agentId=...)
    const parsedUrl = url.parse(request.url, true);
    const tenantId = (parsedUrl.query.tenantId as string) || 'default';
    const agentId = (parsedUrl.query.agentId as string) || 'default';

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

    const leadId = (parsedUrl.query.leadId as string) || undefined;

    this.sessions.set(client, {
      openaiWs,
      tenantId,
      agentId,
      transcript: '',
      leadId,
    });

    let streamSid: string | null = null;

    // --- Message Routing: Twilio -> OpenAI ---
    client.on('message', async (data: string) => {
      try {
        const msg = JSON.parse(data);
        if (msg.event === 'start') {
          streamSid = msg.start.streamSid;
          this.logger.log(`Starting media stream: ${streamSid} for tenant: ${tenantId}`);

          // Fetch Knowledge Base Context for this tenant
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

          // Send session setup with context to OpenAI
          const voice = (parsedUrl.query.voice as string) || 'shimmer';

          openaiWs.send(
            JSON.stringify({
              type: 'session.update',
              session: {
                voice: voice, // dynamic voice selection (shimmer, alloy, echo, etc)
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

    // --- Message Routing: OpenAI -> Twilio ---
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
