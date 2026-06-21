import { generateKeyPairSync } from 'crypto';

import type { JwtConfig } from '../../config/jwt.config';
import {
  buildJwtSignOptions,
  buildJwtVerifyConfig,
  normalizePemKey,
  resolveJwtAlgorithm,
  resolveJwtVerifyKey,
  signJwtToken,
} from './jwt-signing.util';

const TEST_RS256_KEYS = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

function createHs256Config(): JwtConfig {
  return {
    algorithm: 'HS256',
    secret: 'test-access-secret',
    privateKey: '',
    publicKey: '',
    expiresIn: '15m',
    refreshSecret: 'test-refresh-secret',
    refreshExpiresIn: '7d',
  };
}

function createRs256Config(): JwtConfig {
  return {
    algorithm: 'RS256',
    secret: '',
    privateKey: TEST_RS256_KEYS.privateKey,
    publicKey: TEST_RS256_KEYS.publicKey,
    expiresIn: '15m',
    refreshSecret: 'test-refresh-secret',
    refreshExpiresIn: '7d',
  };
}

describe('jwt-signing.util', () => {
  it('uses HS256 by default and resolves symmetric keys', () => {
    const config = createHs256Config();

    expect(resolveJwtAlgorithm(config)).toBe('HS256');
    expect(resolveJwtVerifyKey(config, 'access')).toBe('test-access-secret');
    expect(resolveJwtVerifyKey(config, 'refresh')).toBe('test-refresh-secret');
    expect(buildJwtSignOptions(config, 'access')).toMatchObject({
      algorithm: 'HS256',
      issuer: 'autopilot.monster',
      audience: 'autopilot.monster.user',
    });
    const token = signJwtToken(config, 'access', { sub: 'user-1' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    expect(buildJwtVerifyConfig(config, 'refresh')).toMatchObject({
      secret: 'test-refresh-secret',
      algorithms: ['HS256'],
    });
  });

  it('uses RS256 access tokens when key pair is configured', () => {
    const config = createRs256Config();

    expect(resolveJwtAlgorithm(config)).toBe('RS256');
    expect(resolveJwtVerifyKey(config, 'access')).toBe(TEST_RS256_KEYS.publicKey);
    expect(buildJwtSignOptions(config, 'access')).toMatchObject({
      algorithm: 'RS256',
    });
    const token = signJwtToken(config, 'access', { sub: 'user-1' });
    expect(typeof token).toBe('string');
    expect(buildJwtVerifyConfig(config, 'access')).toMatchObject({
      publicKey: TEST_RS256_KEYS.publicKey,
      algorithms: ['RS256'],
    });
  });

  it('normalizes escaped PEM newlines', () => {
    const pem = '-----BEGIN PUBLIC KEY-----\\nABC\\n-----END PUBLIC KEY-----';
    expect(normalizePemKey(pem)).toBe('-----BEGIN PUBLIC KEY-----\nABC\n-----END PUBLIC KEY-----');
  });
});
