export function parseApiData<T>(response: { data?: unknown }): T | null {
  let payload = response.data;
  // Some controllers wrap their result before the global response interceptor;
  // paginated endpoints also place their records under data alongside meta.
  for (let depth = 0; depth < 5; depth++) {
    if (!payload || typeof payload !== 'object' || !('data' in payload)) break;
    const isEnvelope =
      'status' in payload &&
      typeof payload.status === 'number' &&
      'error' in payload &&
      typeof payload.error === 'boolean';
    const isPage = 'meta' in payload && Array.isArray(payload.data);
    // Preserve business objects with their own data field after the initial
    // response unwrap; only recognized transport/page envelopes unwrap again.
    if (depth > 0 && !isEnvelope && !isPage) break;
    payload = payload.data;
  }
  return (payload as T) ?? null;
}
