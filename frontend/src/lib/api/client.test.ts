import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import api from './client';

describe('api client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    document.cookie = 'access_token=test-token; path=/';
    localStorage.setItem('tenant_id', 'tenant-1');
  });

  afterEach(() => {
    mock.restore();
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.clear();
  });

  it('uses the default API base URL', () => {
    expect(api.defaults.baseURL).toBe(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    );
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
