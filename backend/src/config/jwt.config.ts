import { registerAs } from '@nestjs/config';

import { env } from './env.config';
import { normalizePemKey } from '../common/utils/jwt-signing.util';

export type JwtAlgorithm = 'HS256' | 'RS256';

export interface JwtConfig {
  algorithm: JwtAlgorithm;
  secret: string;
  privateKey: string;
  publicKey: string;
  previousPublicKey: string;
  keyId: string;
  previousKeyId: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

function resolveAlgorithm(): JwtAlgorithm {
  const nodeEnv = env.nodeEnv;
  const explicit = env.jwt.algorithm;
  const hasRs256Keys = Boolean(env.jwt.privateKey) && Boolean(env.jwt.publicKey);

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
    secret: env.jwt.secret,
    privateKey: normalizePemKey(env.jwt.privateKey),
    publicKey: normalizePemKey(env.jwt.publicKey),
    previousPublicKey: normalizePemKey(env.jwt.previousPublicKey),
    keyId: env.jwt.keyId.trim(),
    previousKeyId: env.jwt.previousKeyId.trim(),
    expiresIn: env.jwt.expiresIn,
    refreshSecret: env.jwt.refreshSecret || env.jwt.secret,
    refreshExpiresIn: env.jwt.refreshExpiresIn,
  }),
);
