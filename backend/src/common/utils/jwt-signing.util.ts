import type { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import jwt, { type Algorithm, type SignOptions } from 'jsonwebtoken';

import type { JwtConfig } from '../../config/jwt.config';

const ISSUER = 'autopilot.monster';
const AUDIENCE = 'autopilot.monster.user';

export type JwtTokenKind = 'access' | 'refresh';

export function resolveJwtAlgorithm(config: JwtConfig): Algorithm {
  return config.algorithm;
}

export function resolveJwtVerifyKey(config: JwtConfig, kind: JwtTokenKind): string {
  if (kind === 'access' && config.algorithm === 'RS256') {
    if (!config.publicKey) {
      throw new Error('JWT_PUBLIC_KEY is required when JWT_ALGORITHM=RS256');
    }
    return config.publicKey;
  }

  return kind === 'access' ? config.secret : config.refreshSecret;
}

export function buildJwtSignOptions(config: JwtConfig, kind: JwtTokenKind): JwtSignOptions {
  const expiresIn = kind === 'access' ? config.expiresIn : config.refreshExpiresIn;
  const algorithm: Algorithm = kind === 'access' ? config.algorithm : 'HS256';

  return {
    algorithm,
    expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    issuer: ISSUER,
    audience: AUDIENCE,
  };
}

export function signJwtToken(
  config: JwtConfig,
  kind: JwtTokenKind,
  payload: object,
): string {
  const expiresIn = kind === 'access' ? config.expiresIn : config.refreshExpiresIn;
  const signOptions: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
    issuer: ISSUER,
    audience: AUDIENCE,
  };

  if (kind === 'access' && config.algorithm === 'RS256') {
    if (!config.privateKey) {
      throw new Error('JWT_PRIVATE_KEY is required when JWT_ALGORITHM=RS256');
    }
    return jwt.sign(payload, config.privateKey, {
      ...signOptions,
      algorithm: 'RS256',
    });
  }

  const secret = kind === 'access' ? config.secret : config.refreshSecret;
  if (!secret) {
    throw new Error(`JWT secret is not configured for ${kind} token`);
  }

  return jwt.sign(payload, secret, {
    ...signOptions,
    algorithm: 'HS256',
  });
}

export function buildJwtVerifyOptions(config: JwtConfig, kind: JwtTokenKind): Pick<JwtVerifyOptions, 'algorithms' | 'issuer' | 'audience'> {
  const algorithm = kind === 'access' ? config.algorithm : 'HS256';
  return {
    algorithms: [algorithm],
    issuer: ISSUER,
    audience: AUDIENCE,
  };
}

export function buildJwtVerifyConfig(config: JwtConfig, kind: JwtTokenKind): JwtVerifyOptions {
  const verifyOptions = buildJwtVerifyOptions(config, kind);
  const key = resolveJwtVerifyKey(config, kind);

  if (kind === 'access' && config.algorithm === 'RS256') {
    return {
      ...verifyOptions,
      publicKey: key,
    };
  }

  return {
    ...verifyOptions,
    secret: key,
  };
}

export function assertAccessJwtConfigured(config: JwtConfig): void {
  if (config.algorithm === 'RS256') {
    if (!config.publicKey) {
      throw new Error('JWT_PUBLIC_KEY is not configured');
    }
    if (!config.privateKey) {
      throw new Error('JWT_PRIVATE_KEY is not configured');
    }
    return;
  }

  if (!config.secret) {
    throw new Error('JWT_SECRET is not configured');
  }
}

export function buildJwtModuleOptions(config: JwtConfig): {
  secret?: string;
  privateKey?: string;
  publicKey?: string;
  signOptions: JwtSignOptions;
} {
  if (config.algorithm === 'RS256') {
    return {
      privateKey: config.privateKey,
      publicKey: config.publicKey,
      signOptions: buildJwtSignOptions(config, 'access'),
    };
  }

  return {
    secret: config.secret,
    signOptions: buildJwtSignOptions(config, 'access'),
  };
}

export function normalizePemKey(raw: string): string {
  return raw.replace(/\\n/g, '\n').trim();
}
