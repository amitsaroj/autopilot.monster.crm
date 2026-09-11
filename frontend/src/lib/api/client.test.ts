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
