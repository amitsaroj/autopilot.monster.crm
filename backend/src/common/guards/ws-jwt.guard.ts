import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const { auth } = client.handshake;
    const token = auth['token'] || client.handshake.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new WsException('Token not found');
    }

    try {
      const payload = this.jwtService.verify(token);
      context.switchToWs().getData().user = payload;
      return true;
    } catch (e) {
      this.logger.error(`WS Auth Error: ${e}`);
      throw new WsException('Invalid token');
    }
  }
}
