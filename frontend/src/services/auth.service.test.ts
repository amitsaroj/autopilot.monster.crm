import { afterEach, describe, expect, it } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from '../lib/api/client';
import { authService } from './auth.service';
import { removeToken, setToken } from '../lib/auth';

const mock = new MockAdapter(api);
afterEach(() => {
  mock.reset();
  removeToken();
});

describe('authentication service', () => {
  it('sends the complete chunked refresh token during logout', async () => {
    const refresh = 'r'.repeat(5000);
    setToken('access', refresh, 'tenant');
    mock.onPost('/auth/logout').reply((config) => {
      expect(JSON.parse(config.data)).toEqual({ allSessions: false, refreshToken: refresh });
      return [200, {}];
    });
    await authService.logout();
  });
  it('unwraps the MFA setup response', async () => {
    mock
      .onPost('/auth/mfa/enable')
      .reply(200, { data: { secret: 'secret', qrCodeUrl: 'otp-url' } });
    expect(await authService.enableMfa()).toEqual({ secret: 'secret', qrCodeUrl: 'otp-url' });
  });
});
