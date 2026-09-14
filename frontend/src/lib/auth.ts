// ─── Canonical token helpers ─────────────────────────────────────────────────
// Client-side only (browser cookies).  For Server Components use next/headers.

import { splitIntoCookieChunks } from './cookie-chunks';

const COOKIE_ACCESS = 'access_token';
const COOKIE_REFRESH = 'refresh_token';
const COOKIE_TENANT = 'tenant_id';
const COOKIE_MAX_AGE = 86400; // 24 h
const MAX_CHUNKS = 10;

function parseCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// A JWT embedding the full per-resource permissions array can exceed the
// ~4KB per-cookie limit browsers silently enforce (the assignment is just
// dropped). Store it across numbered cookies instead and rejoin on read.
function getChunkedCookie(name: string): string | null {
  let result = '';
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const part = parseCookie(`${name}.${i}`);
    if (part == null) break;
    result += part;
  }
  return result.length > 0 ? result : null;
}

// Browsers silently drop `Secure` cookies set from a non-HTTPS origin (e.g.
// http://localhost during local dev) — omit it there so auth actually works.
function cookieSecurityFlag(): string {
  return typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : '';
}

function expireCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict${cookieSecurityFlag()}`;
}

function expireChunkedCookie(name: string) {
  for (let i = 0; i < MAX_CHUNKS; i++) {
    expireCookie(`${name}.${i}`);
  }
}

function setChunkedCookie(name: string, value: string, maxAge: number) {
  const secure = cookieSecurityFlag();
  const chunks = splitIntoCookieChunks(value);
  chunks.forEach((chunk, i) => {
    document.cookie = `${name}.${i}=${chunk}; path=/; max-age=${maxAge}; samesite=strict${secure}`;
  });
  // Clear any leftover chunks from a previous, larger token.
  for (let i = chunks.length; i < MAX_CHUNKS; i++) {
    expireCookie(`${name}.${i}`);
  }
}

/** Read the JWT access token from the browser cookie. */
export function getToken(): string | null {
  return getChunkedCookie(COOKIE_ACCESS);
}

/** Read the JWT refresh token from the browser cookie. */
export function getRefreshToken(): string | null {
  return getChunkedCookie(COOKIE_REFRESH);
}

/** Persist the JWT access token (and optionally refresh / tenant) into cookies. */
export function setToken(accessToken: string, refreshToken?: string, tenantId?: string) {
  if (typeof window === 'undefined') return;
  setChunkedCookie(COOKIE_ACCESS, accessToken, COOKIE_MAX_AGE);
  if (refreshToken) {
    setChunkedCookie(COOKIE_REFRESH, refreshToken, 604800);
  }
  if (tenantId) {
    const secure = cookieSecurityFlag();
    document.cookie = `${COOKIE_TENANT}=${tenantId}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=strict${secure}`;
    localStorage.setItem('tenant_id', tenantId);
  }
}

/** Clear all auth cookies and localStorage entries. */
export function removeToken() {
  if (typeof window === 'undefined') return;
  expireChunkedCookie(COOKIE_ACCESS);
  expireChunkedCookie(COOKIE_REFRESH);
  expireCookie(COOKIE_TENANT);
  localStorage.removeItem('tenant_id');
  localStorage.removeItem('auth-storage');
}

/** Returns true when a non-empty access token cookie exists. */
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token && token.split('.').length === 3; // minimal JWT shape check
}

// ─── Legacy alias (keep existing call-sites working) ─────────────────────────
export const getAuthToken = getToken;

// ─── JWT decoder ─────────────────────────────────────────────────────────────
export function decodeToken(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
