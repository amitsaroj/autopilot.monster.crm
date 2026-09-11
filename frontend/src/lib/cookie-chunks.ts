// ─── Chunked cookie helpers ──────────────────────────────────────────────────
// Browsers silently drop a cookie whose name+value exceeds ~4KB. Our JWTs embed
// a full per-resource permissions array and can exceed that on roles with many
// permissions (e.g. TENANT_ADMIN, SUPER_ADMIN) — access_token/refresh_token are
// split across numbered cookies (`${name}.0`, `${name}.1`, ...) to stay under
// the per-cookie limit, and rejoined on read. Works for both the client
// (document.cookie) and server (Edge middleware / RSC `cookies()`) call sites.

export const COOKIE_CHUNK_SIZE = 3500;
const MAX_CHUNKS = 10;

export function splitIntoCookieChunks(value: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += COOKIE_CHUNK_SIZE) {
    chunks.push(value.slice(i, i + COOKIE_CHUNK_SIZE));
  }
  return chunks;
}

/**
 * Reads and rejoins a chunked cookie given a `(name) => { value } | undefined`
 * accessor — matches both `NextRequest.cookies.get` (Edge middleware) and the
 * `cookies()` store from `next/headers` (React Server Components).
 */
export function readChunkedCookie(
  get: (name: string) => { value: string } | undefined,
  name: string,
): string | null {
  let result = '';
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const part = get(`${name}.${i}`);
    if (!part) break;
    result += part.value;
  }
  return result.length > 0 ? result : null;
}
