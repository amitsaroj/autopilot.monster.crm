import * as http from 'http';
import * as url from 'url';

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, WebSocket as WsWebSocket } from 'ws';

import { RagService } from '../ai/rag.service';
import { LeadIntelligenceService } from '../crm/lead-intelligence.service';
import { AgentService } from '../crm/agent.service';
import { VoiceCallService } from './voice-call.service';

const STREAM_PATH = '/voice/stream';

/**
 * Twilio Media Streams speaks plain WebSocket, not Socket.IO — the transport
 * every other gateway in this app uses via Nest's default `IoAdapter`
 * (`NotificationGateway` depends on Socket.IO-specific rooms/namespaces, so
 * globally switching the adapter to `WsAdapter` would break it). Rather than
 * a Nest `@WebSocketGateway`, this class runs its own raw `ws.Server`
 * attached directly to the underlying HTTP server's `upgrade` event, filtered
 * to its own path so it coexists with Socket.IO's upgrade handling on the
 * same server (Socket.IO only intercepts requests matching its own
 * configured path, `/socket.io/` by default, and leaves everything else for
 * other `upgrade` listeners). `main.ts` calls `attach()` once at bootstrap.
 */
@Injectable()
export class RealtimeAiGateway implements OnModuleDestroy {
  private wsServer?: Server;
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
      humanTransferNumber?: string;
      transferRequested?: boolean;
    }
  >();

  attach(httpServer: http.Server): void {
    this.wsServer = new Server({ noServer: true });

    httpServer.on('upgrade', (request: http.IncomingMessage, socket, head) => {
      const pathname = url.parse(request.url ?? '').pathname;
      if (pathname !== STREAM_PATH) {
        return;
      }
      this.wsServer!.handleUpgrade(request, socket, head, (client) => {
        this.wsServer!.emit('connection', client, request);
      });
    });

    this.wsServer.on('connection', (client: WsWebSocket, request: http.IncomingMessage) => {
      void this.handleConnection(client, request);
    });

    this.logger.log(`Voice realtime WebSocket server attached at ${STREAM_PATH}`);
  }

  onModuleDestroy(): void {
    this.wsServer?.close();
  }

  private async handleConnection(client: WsWebSocket, request: { url?: string }) {
    const parsedUrl = url.parse(request.url ?? '', true);
    const token = parsedUrl.query.token as string | undefined;

    // The URL carries no trustworthy data on its own — token is a one-time,
    // server-minted opaque id (see VoiceCallService.buildStreamUrl); anyone
    // who connects without a valid, unexpired token gets nothing. This is
    // what keeps a raw `ws` connection (which never runs through
    // JwtAuthGuard/TenantGuard) from letting a caller name their own
    // tenantId/contactId/leadId and pull another tenant's data into a live
    // AI session.
    const context = token ? await this.voiceCallService.resolveStreamToken(token) : null;
    if (!context) {
      this.logger.warn('Rejected /voice/stream connection: missing or invalid/expired token');
      client.close();
      return;
    }

    this.logger.log('Twilio Voice Client Connected to Gateway');

    const { tenantId } = context;
    const agentId = context.agentId || 'default';
    const leadId = context.leadId;
    const contactId = context.contactId;
    const script = context.script;
    const humanTransferNumber = context.humanTransferNumber;
    let voiceProfile = context.voice;

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
      humanTransferNumber,
    });

    client.on('close', () => {
      void this.handleDisconnect(client);
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

          const transferInstructions = humanTransferNumber
            ? `\n\nIf the caller clearly wants to speak with a human, asks for a manager, or the conversation
               needs a person to close it out, tell them you're connecting them now and call the
               transfer_to_human tool. Only use it when the caller actually wants a human — not by default.`
            : '';

          const instructions = `
            ${roleInstructions}
            Keep responses under 2 sentences for natural flow.${transferInstructions}

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
                ...(humanTransferNumber
                  ? {
                      tools: [
                        {
                          type: 'function',
                          name: 'transfer_to_human',
                          description:
                            'Transfer the current call to a human agent. Use only when the caller explicitly wants to speak with a person.',
                          parameters: {
                            type: 'object',
                            properties: {
                              reason: {
                                type: 'string',
                                description: 'Brief reason the caller wants a human',
                              },
                            },
                          },
                        },
                      ],
                      tool_choice: 'auto',
                    }
                  : {}),
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
        } else if (response.type === 'response.function_call_arguments.done') {
          void this.handleFunctionCall(client, openaiWs, response);
        }
      } catch (e) {
        this.logger.error('Failed to parse OpenAI message', e);
      }
    });

    openaiWs.on('close', () => {
      this.logger.log('OpenAI WS closed');
    });
  }

  /**
   * The only tool exposed to the model today is transfer_to_human (only
   * offered at all when the campaign/call configured a humanTransferNumber
   * — see the tools array in session.update above). Handles OpenAI's
   * realtime function-calling protocol: acknowledge the tool call with a
   * function_call_output item, then let the model continue the conversation.
   */
  private async handleFunctionCall(
    client: WsWebSocket,
    openaiWs: WsWebSocket,
    response: { call_id?: string; name?: string },
  ): Promise<void> {
    const session = this.sessions.get(client);
    if (!session || response.name !== 'transfer_to_human' || session.transferRequested) {
      return;
    }

    let outcome = 'Transfer is not available for this call.';
    if (session.humanTransferNumber && session.callSid) {
      session.transferRequested = true;
      try {
        await this.voiceCallService.transferCall(
          session.tenantId,
          session.callSid,
          session.humanTransferNumber,
        );
        outcome = 'Call is being transferred to a human agent now.';
        this.logger.log(`AI transferred call ${session.callSid} to a human agent`);
      } catch (err) {
        this.logger.error(`Failed to transfer call ${session.callSid}`, err);
        outcome = 'The transfer failed — stay on the line and keep helping the caller yourself.';
        session.transferRequested = false;
      }
    }

    if (openaiWs.readyState !== WsWebSocket.OPEN) {
      return;
    }
    openaiWs.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: response.call_id,
          output: JSON.stringify({ result: outcome }),
        },
      }),
    );
    openaiWs.send(JSON.stringify({ type: 'response.create' }));
  }

  private async handleDisconnect(client: WsWebSocket) {
    const session = this.sessions.get(client);
    if (session) {
      this.logger.log(`Call ended for tenant ${session.tenantId}. Analyzing transcript...`);

      let campaignId: string | undefined;
      let recipientId: string | undefined;

      if (session.callSid && session.transcript.trim()) {
        const call = await this.voiceCallService.persistCallTranscript(
          session.tenantId,
          session.callSid,
          session.transcript,
        );
        campaignId = call?.campaignId;
        recipientId = call?.recipientId;

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
          { campaignId, recipientId },
        );
      }

      session.openaiWs.close();
      this.sessions.delete(client);
    }
    this.logger.log('Twilio Voice Client Disconnected');
  }
}
