import { registerAs } from '@nestjs/config';

import { env } from './env.config';

export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

export const throttleConfig = registerAs(
  'throttle',
  (): ThrottleConfig => ({
    ttl: env.throttle.ttl,
    limit: env.throttle.limit,
  }),
);
