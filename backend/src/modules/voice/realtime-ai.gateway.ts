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
import { AgentService } from '../crm/agent.service';
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
    private agentService: AgentService,
  ) {}

  private sessions = new Map<
    WsWebSocket,
    {
      openaiWs: WsWebSocket;
      tenantId: string;
      agentId: string;
      transcript: string;
      leadId?: string;
      contactId?: string;
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
    const contactId = (parsedUrl.query.contactId as string) || undefined;
    const script = (parsedUrl.query.script as string) || undefined;
    let voiceProfile = (parsedUrl.query.voice as string) || undefined;

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
      contactId,
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

          // An agentId names a configured Agent whose systemPrompt/voice drive
          // the call; a bulk campaign without one falls back to its own
          // free-text script; otherwise a generic default. Reuses the same
          // Agent records the CRM's single-call/agent-builder UI manages,
          // rather than the call flow inventing its own prompt storage.
          let roleInstructions = script;
          if (agentId && agentId !== 'default') {
            try {
              const agent = await this.agentService.findOne(tenantId, agentId);
              if (agent) {
                roleInstructions = agent.systemPrompt || roleInstructions;
                voiceProfile = voiceProfile || agent.voice;
              }
            } catch {
              this.logger.warn(`Agent ${agentId} not found for tenant ${tenantId}; using fallback`);
            }
          }
          roleInstructions =
            roleInstructions ||
            'You are a helpful AI voice agent for AutopilotMonster CRM, representing a company.';
          voiceProfile = voiceProfile || 'shimmer';

          const instructions = `
            ${roleInstructions}
            Keep responses under 2 sentences for natural flow.

            Use the following context to answer customer questions naturally and concisely.
            If the answer isn't in the context, be honest but helpful.

            COMPANY CONTEXT:
            ${kbContext || 'No specific documents uploaded yet.'}
          `;

          if (session) {
            session.voiceProfile = voiceProfile;
          }

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
      } else if (session.contactId && session.transcript) {
        await this.leadIntelligenceService.analyzeContactCallOutcome(
          session.tenantId,
          session.contactId,
          session.transcript,
        );
      }

      session.openaiWs.close();
      this.sessions.delete(client);
    }
    this.logger.log('Twilio Voice Client Disconnected');
  }
}
