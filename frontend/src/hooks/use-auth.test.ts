import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from './use-auth';
import { authService } from '../services/auth.service';
import api from '../lib/api/client';

const token = (roles: string[]) =>
  'header.' +
  btoa(JSON.stringify({ roles, permissions: ['contacts:manage'], tenantId: 'tenant' })) +
  '.signature';
afterEach(() => {
  vi.restoreAllMocks();
  useAuth.getState().clearAuth();
});

describe('authentication state', () => {
  it.each(['SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'USER', 'AGENT'])(
    'hydrates %s roles and permissions from a login',
    async (role) => {
      vi.spyOn(authService, 'login').mockResolvedValue({
        data: { accessToken: token([role]), refreshToken: 'refresh' },
      } as any);
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { data: { id: 'user', tenantId: 'tenant' } },
      });
      const user = await useAuth
        .getState()
        .login({ email: 'user@example.test', password: 'password' });
      expect(user.roles).toEqual([role]);
      expect(user.permissions).toEqual(['contacts:manage']);
      expect(useAuth.getState().isAuthenticated).toBe(true);
    },
  );
  it('keeps MFA credentials in memory without persisting the password', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue({
      response: { data: { message: 'MFA code required' } },
    });
    const result = await useAuth
      .getState()
      .login({ email: 'user@example.test', password: 'secret-password' });
    expect(result).toEqual({ mfaRequired: true });
    expect(useAuth.getState().mfaPendingPassword).toBe('secret-password');
    expect(localStorage.getItem('auth-storage')).not.toContain('secret-password');
  });
  it('hydrates roles during OAuth completion', () => {
    useAuth
      .getState()
      .setAuth({
        accessToken: token(['TENANT_ADMIN']),
        refreshToken: 'refresh',
        user: { id: 'user' },
        tenant: { id: 'tenant' },
      });
    expect(useAuth.getState().user.roles).toEqual(['TENANT_ADMIN']);
  });
});
