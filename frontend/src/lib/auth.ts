// ─── Canonical token helpers ─────────────────────────────────────────────────
// Client-side only (browser cookies).  For Server Components use next/headers.

const COOKIE_ACCESS  = 'access_token';
const COOKIE_REFRESH = 'refresh_token';
const COOKIE_TENANT  = 'tenant_id';
const COOKIE_MAX_AGE = 86400; // 24 h

function parseCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function expireCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict; secure`;
}

/** Read the JWT access token from the browser cookie. */
export function getToken(): string | null {
  return parseCookie(COOKIE_ACCESS);
}

/** Persist the JWT access token (and optionally refresh / tenant) into cookies. */
export function setToken(accessToken: string, refreshToken?: string, tenantId?: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${COOKIE_ACCESS}=${accessToken}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=strict; secure`;
  if (refreshToken) {
    document.cookie = `${COOKIE_REFRESH}=${refreshToken}; path=/; max-age=604800; samesite=strict; secure`;
  }
  if (tenantId) {
    document.cookie = `${COOKIE_TENANT}=${tenantId}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=strict; secure`;
    localStorage.setItem('tenant_id', tenantId);
  }
}

/** Clear all auth cookies and localStorage entries. */
export function removeToken() {
  if (typeof window === 'undefined') return;
  expireCookie(COOKIE_ACCESS);
  expireCookie(COOKIE_REFRESH);
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
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

