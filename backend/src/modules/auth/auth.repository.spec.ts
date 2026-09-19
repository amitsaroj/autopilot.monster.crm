import { createHash } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';

describe('AuthRepository credential safety', () => {
  const userRepo = { update: jest.fn(), findOne: jest.fn(), createQueryBuilder: jest.fn() };
  const tokenRepo = { create: jest.fn((value) => value), save: jest.fn(), update: jest.fn() };
  const sessionRepo = { update: jest.fn() };
  const repo = new AuthRepository(
    userRepo as any,
    tokenRepo as any,
    sessionRepo as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo.findOne.mockResolvedValue({ id: 'user' });
  });

  it('hashes password updates even when the plaintext starts with a bcrypt prefix', async () => {
    await repo.updateUser('user', 'tenant', { passwordHash: '$2-password' });
    const stored = userRepo.update.mock.calls[0][1].passwordHash;
    expect(stored).not.toBe('$2-password');
    expect(await bcrypt.compare('$2-password', stored)).toBe(true);
  });

  it('loads hidden password and MFA fields for credential checks', async () => {
    const query = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    userRepo.createQueryBuilder.mockReturnValue(query);
    await repo.findUserById('user', 'tenant');
    expect(query.addSelect).toHaveBeenCalledWith(['user.passwordHash', 'user.mfaSecret']);
    expect(query.where).toHaveBeenCalledWith(expect.any(String), {
      id: 'user',
      tenantId: 'tenant',
    });
  });

  it('hashes the full refresh token and attaches its session', async () => {
    const prefix = 'a'.repeat(100);
    await repo.saveRefreshToken(
      'user',
      'tenant',
      prefix + 'one',
      new Date(),
      '127.0.0.1',
      'session',
    );
    await repo.saveRefreshToken(
      'user',
      'tenant',
      prefix + 'two',
      new Date(),
      '127.0.0.1',
      'session',
    );
    expect(tokenRepo.save.mock.calls[0][0].tokenHash).not.toBe(
      tokenRepo.save.mock.calls[1][0].tokenHash,
    );
    expect(tokenRepo.save.mock.calls[0][0].sessionId).toBe('session');
  });

  it('allows only one concurrent redemption of a refresh token', async () => {
    const tokenHash = 'sha256:' + createHash('sha256').update('token').digest('hex');
    jest
      .spyOn(repo, 'findValidRefreshToken')
      .mockResolvedValue([{ id: 'token-id', tokenHash } as any]);
    tokenRepo.update.mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 });
    expect(await repo.revokeRefreshTokenByRawToken('user', 'tenant', 'token')).toBe(true);
    expect(await repo.revokeRefreshTokenByRawToken('user', 'tenant', 'token')).toBe(false);
  });

  it('revokes linked refresh tokens when a session is revoked', async () => {
    sessionRepo.update.mockResolvedValue({ affected: 1 });
    await repo.deactivateSession('session', 'user', 'tenant');
    expect(tokenRepo.update).toHaveBeenCalledWith(
      { sessionId: 'session', userId: 'user', tenantId: 'tenant' },
      { isRevoked: true },
    );
  });
});
