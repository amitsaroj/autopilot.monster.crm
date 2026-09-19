import axios from 'axios';
import { setToken, removeToken } from '../auth';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE } from '../constants';
import api from './client';

describe('api client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    // access_token is stored as chunked cookies (access_token.0, .1, ...) so a
    // single JWT can exceed the ~4KB per-cookie limit — see lib/cookie-chunks.ts.
    document.cookie = 'access_token.0=test-token; path=/';
    localStorage.setItem('tenant_id', 'tenant-1');
  });

  afterEach(() => {
    mock.restore();
    document.cookie = 'access_token.0=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.clear();
  });

  it('uses the default API base URL', () => {
    expect(api.defaults.baseURL).toBe(API_BASE);
  });

  it('attaches auth and tenant headers on outgoing requests', async () => {
    mock.onGet('/health').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer test-token');
      expect(config.headers?.['x-tenant-id']).toBe('tenant-1');
      return [200, { ok: true }];
    });

    const response = await api.get('/health');
    expect(response.data).toEqual({ ok: true });
  });
});

describe('refresh token rotation', () => {
  let apiMock: MockAdapter;
  let refreshMock: MockAdapter;

  beforeEach(() => {
    apiMock = new MockAdapter(api);
    refreshMock = new MockAdapter(axios);
    setToken('old-access', 'old-refresh', 'tenant');
  });
  afterEach(() => {
    apiMock.restore();
    refreshMock.restore();
    removeToken();
  });

  it('shares one refresh request between concurrent unauthorized API calls', async () => {
    apiMock
      .onGet('/protected')
      .reply((config) =>
        config.headers?.Authorization === 'Bearer new-access' ? [200, {}] : [401, {}],
      );
    refreshMock.onPost(`${API_BASE}/auth/refresh`).reply(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return [200, { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } }];
    });
    const responses = await Promise.all([api.get('/protected'), api.get('/protected')]);
    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(refreshMock.history.post).toHaveLength(1);
  });

  it('does not refresh an invalid login or MFA challenge', async () => {
    apiMock.onPost('/auth/login').reply(401, { message: 'MFA code required' });
    await expect(api.post('/auth/login')).rejects.toThrow();
    expect(refreshMock.history.post).toHaveLength(0);
  });
});
