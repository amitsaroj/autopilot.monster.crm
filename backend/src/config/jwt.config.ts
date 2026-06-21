import { registerAs } from '@nestjs/config';

import { normalizePemKey } from '../common/utils/jwt-signing.util';

export type JwtAlgorithm = 'HS256' | 'RS256';

export interface JwtConfig {
  algorithm: JwtAlgorithm;
  secret: string;
  privateKey: string;
  publicKey: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

function resolveAlgorithm(): JwtAlgorithm {
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';
  const explicit = process.env['JWT_ALGORITHM'];
  const hasRs256Keys =
    Boolean(process.env['JWT_PRIVATE_KEY']) && Boolean(process.env['JWT_PUBLIC_KEY']);

  if (nodeEnv === 'production') {
    if (explicit === 'HS256') {
      throw new Error('HS256 is not permitted in production. Set JWT_ALGORITHM=RS256.');
    }
    if (!hasRs256Keys) {
      throw new Error('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are required in production.');
    }
    return 'RS256';
  }

  if (explicit === 'RS256' || explicit === 'HS256') {
    return explicit;
  }
  if (hasRs256Keys) {
    return 'RS256';
  }
  return 'HS256';
}

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    algorithm: resolveAlgorithm(),
    secret: process.env['JWT_SECRET'] ?? '',
    privateKey: normalizePemKey(process.env['JWT_PRIVATE_KEY'] ?? ''),
    publicKey: normalizePemKey(process.env['JWT_PUBLIC_KEY'] ?? ''),
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? process.env['JWT_SECRET'] ?? '',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  }),
);
