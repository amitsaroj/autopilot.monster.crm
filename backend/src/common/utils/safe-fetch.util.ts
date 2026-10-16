import axios from 'axios';

import { publicWebhookAgents } from '../../modules/workflow/workflow-webhook.util';

export interface SafeFetchResult {
  status: number;
  contentType: string;
  body: Buffer;
}

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  headers?: Record<string, string>;
  /**
   * Redirect hops to follow (default 0). Each hop's Location is re-validated
   * and re-pinned exactly like the original URL, so following is SSRF-safe.
   */
  maxRedirects?: number;
}

/**
 * SSRF-safe GET for user-supplied URLs: public HTTP(S) only, DNS answer pinned
 * (no rebinding), redirects not followed unless `maxRedirects` is set (each hop
 * re-validated), bounded time and response size. Do not pass credentials in
 * `headers` when following redirects (they are re-sent to every hop).
 * Throws BadRequestException for private/invalid destinations; transport and
 * size errors propagate from axios.
 */
export async function safeFetchPublicUrl(
  url: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResult> {
  let current = url;
  for (let hop = 0; ; hop++) {
    const result = await fetchOnce(current, options);
    const location = result.location;
    if (!location || result.status < 300 || result.status >= 400) return result;
    if (hop >= (options.maxRedirects ?? 0)) return result;
    current = new URL(location, current).toString();
  }
}

async function fetchOnce(
  url: string,
  { timeoutMs = 15_000, maxBytes = 10 * 1024 * 1024, headers = {} }: SafeFetchOptions,
): Promise<SafeFetchResult & { location?: string }> {
  const agents = await publicWebhookAgents(url);
  try {
    const response = await axios.request<ArrayBuffer>({
      url,
      method: 'GET',
      headers,
      ...agents,
      proxy: false,
      maxRedirects: 0,
      timeout: timeoutMs,
      signal: AbortSignal.timeout(timeoutMs),
      maxContentLength: maxBytes,
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });
    const contentType: unknown = response.headers['content-type'];
    const location: unknown = response.headers['location'];
    return {
      status: response.status,
      contentType: typeof contentType === 'string' ? contentType : '',
      body: Buffer.from(response.data),
      location: typeof location === 'string' ? location : undefined,
    };
  } finally {
    agents.httpAgent.destroy();
    agents.httpsAgent.destroy();
  }
}
