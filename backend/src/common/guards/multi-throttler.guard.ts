import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class MultiLevelThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const user = req.user?.id || 'anonymous';
    const tenant = req.user?.tenantId || req.headers['x-tenant-id'] || 'no-tenant';

    return `${ip}-${tenant}-${user}`;
  }
}
