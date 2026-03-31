import { registerAs } from '@nestjs/config';

export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

export const throttleConfig = registerAs(
  'throttle',
  (): ThrottleConfig => ({
    ttl: parseInt(process.env['THROTTLE_TTL'] ?? '60', 10),
    limit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
  }),
);
