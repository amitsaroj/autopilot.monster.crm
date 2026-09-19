import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

function request(path: string, roles?: string[], expired = false) {
  const payload = { roles, exp: Date.now() / 1000 + (expired ? -60 : 600) };
  const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
  return new NextRequest('http://localhost' + path, {
    headers: roles ? { cookie: 'access_token.0=' + token } : {},
  });
}

describe('authentication routing', () => {
  it('allows OAuth callbacks without an existing session', () => {
    expect(proxy(request('/auth/callback')).status).toBe(200);
  });
  it.each([
    ['SUPER_ADMIN', '/superadmin'],
    ['TENANT_ADMIN', '/admin'],
    ['ADMIN', '/sub-admin'],
    ['USER', '/dashboard'],
    ['AGENT', '/dashboard'],
  ])('redirects signed-in %s to %s', (role, home) => {
    expect(proxy(request('/login', [role])).headers.get('location')).toBe(
      'http://localhost' + home,
    );
  });
  it('allows expired sessions to sign in again', () => {
    expect(proxy(request('/login', ['ADMIN'], true)).status).toBe(200);
  });
  it('denies unauthorized sub-admin navigation', () => {
    expect(proxy(request('/sub-admin/users', ['USER'])).headers.get('location')).toBe(
      'http://localhost/403',
    );
  });
  it('sends unauthenticated users to login', () => {
    expect(proxy(request('/dashboard')).headers.get('location')).toContain('/login?');
  });
});
