import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket as WsWebSocket } from 'ws';
import { ConfigService } from '@nestjs/config';

/**
 * Native WebSocket Server mapped to '/voice/stream'
 * Listens for Twilio Media Streams (G.711 mulaw audio base64 encoded)
 * Connects proxy to OpenAI Realtime API via WebSockets.
 */
@WebSocketGateway({ path: '/voice/stream' })
export class RealtimeAiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeAiGateway.name);
  private readonly openAiWsUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';

  constructor(private configService: ConfigService) {}

  handleConnection(client: WsWebSocket, ...args: any[]) {
    this.logger.log('Twilio Voice Client Connected to Gateway');

    const openAiApiKey = this.configService.get('OPENAI_API_KEY');
    
    // Fallback safely if no key is provided during build/local dev without crashing
    if (!openAiApiKey || openAiApiKey === 'mock-api-key') {
       this.logger.warn('OpenAI Key is mock. Closing Twilio connection.');
       client.close();
       return;
    }

    // Connect to OpenAI Realtime API bridging the connection
    const openaiWs = new WsWebSocket(this.openAiWsUrl, {
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    let streamSid: string | null = null;

    // --- Message Routing: Twilio -> OpenAI ---
    client.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data);
        if (msg.event === 'start') {
          streamSid = msg.start.streamSid;
          this.logger.log(`Starting media stream: ${streamSid}`);
          
          // Send initial session setup to OpenAI
          openaiWs.send(JSON.stringify({
            type: 'session.update',
            session: {
              voice: 'alloy',
              instructions: 'You are a helpful AI customer service agent for AutopilotMonster CRM.',
              turn_detection: { type: 'server_vad' }, // Voice Activity Detection
            }
          }));
        } else if (msg.event === 'media' && openaiWs.readyState === WsWebSocket.OPEN) {
          // Send raw audio chunk to OpenAI
          openaiWs.send(JSON.stringify({
             type: 'input_audio_buffer.append',
             audio: msg.media.payload
          }));
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
        if (response.type === 'response.audio.delta' && streamSid) {
          // Pipe generated voice chunks back to Twilio
          client.send(JSON.stringify({
             event: 'media',
             streamSid,
             media: { payload: response.delta }
          }));
        }
      } catch (e) {
        this.logger.error('Failed to parse OpenAI message', e);
      }
    });

    openaiWs.on('close', () => {
      this.logger.log('OpenAI WS closed');
    });
  }

  handleDisconnect(client: WsWebSocket) {
    this.logger.log('Twilio Voice Client Disconnected');
  }
}
