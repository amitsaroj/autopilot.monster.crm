import type { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import jwt, { type Algorithm, type SignOptions } from 'jsonwebtoken';
import { createPrivateKey, createPublicKey } from 'node:crypto';

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

export function signJwtToken(config: JwtConfig, kind: JwtTokenKind, payload: object): string {
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
    const keyid = config.keyId || undefined;
    return jwt.sign(payload, config.privateKey, {
      ...signOptions,
      algorithm: 'RS256',
      keyid,
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

export function buildJwtVerifyOptions(
  config: JwtConfig,
  kind: JwtTokenKind,
): Pick<JwtVerifyOptions, 'algorithms' | 'issuer' | 'audience'> {
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
    if (process.env['NODE_ENV'] === 'production' && !config.keyId) {
      throw new Error('JWT_KEY_ID is required in production when JWT_ALGORITHM=RS256');
    }
    if (config.previousPublicKey && !config.previousKeyId) {
      throw new Error('JWT_PREVIOUS_KEY_ID is required when JWT_PUBLIC_KEY_PREVIOUS is set');
    }
    if (config.previousPublicKey && config.previousPublicKey === config.publicKey) {
      throw new Error('JWT_PUBLIC_KEY_PREVIOUS must differ from JWT_PUBLIC_KEY');
    }
    validateRs256KeyMaterial(config);
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

function validateRs256KeyMaterial(config: JwtConfig): void {
  try {
    createPrivateKey(config.privateKey);
  } catch {
    throw new Error('JWT_PRIVATE_KEY is not valid PEM key material');
  }

  try {
    createPublicKey(config.publicKey);
  } catch {
    throw new Error('JWT_PUBLIC_KEY is not valid PEM key material');
  }

  if (config.previousPublicKey) {
    try {
      createPublicKey(config.previousPublicKey);
    } catch {
      throw new Error('JWT_PUBLIC_KEY_PREVIOUS is not valid PEM key material');
    }
  }
}
