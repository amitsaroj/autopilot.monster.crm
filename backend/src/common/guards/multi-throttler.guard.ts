import { Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  type ThrottlerRequest,
  type ThrottlerStorage,
} from '@nestjs/throttler';
import { ApiKeyAuthService } from '../../modules/auth/api-key-auth.service';

interface TrackableRequest {
  ip?: string;
  socket?: { remoteAddress?: string };
  user?: { id?: string };
}

/**
 * Throttler tracker. Never derives the key from client-controlled headers
 * (e.g. x-tenant-id): rotating them would mint fresh buckets. The throttler
 * runs before JwtAuthGuard, so req.user is normally unset and the key is the
 * client IP (req.ip honours the `trust proxy` setting from main.ts).
 */
@Injectable()
export class MultiLevelThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storage: ThrottlerStorage,
    reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {
    super(options, storage, reflector);
  }

  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const request = requestProps.context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const header = request.headers['x-api-key'];
    const rawKey = typeof header === 'string' ? header : undefined;

    // Keep the IP ceiling for every request, including API-key traffic.
    await super.handleRequest({
      ...requestProps,
      getTracker: async (req) => `ip:${req.ip ?? req.socket?.remoteAddress ?? 'unknown'}`,
    });
    if (!rawKey) return true;

    const key = await this.moduleRef.get(ApiKeyAuthService, { strict: false }).getRateLimit(rawKey);
    if (!key) return true;
    return super.handleRequest({
      ...requestProps,
      limit: Math.max(1, key.rateLimit),
      throttler: { ...requestProps.throttler, setHeaders: false },
      getTracker: async () => `api-key:${key.id}`,
    });
  }

  protected getTracker(req: TrackableRequest): Promise<string> {
    if (req.user?.id) return Promise.resolve(`user:${req.user.id}`);
    return Promise.resolve(`ip:${req.ip ?? req.socket?.remoteAddress ?? 'unknown'}`);
  }
}
