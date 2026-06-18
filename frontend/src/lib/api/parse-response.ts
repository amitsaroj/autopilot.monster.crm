export function parseApiData<T>(response: { data?: unknown }): T | null {
  const payload = response.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return (payload as T) ?? null;
}
