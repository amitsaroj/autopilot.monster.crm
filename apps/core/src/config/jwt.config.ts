import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: process.env['JWT_SECRET'] ?? '',
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? '',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  }),
);
