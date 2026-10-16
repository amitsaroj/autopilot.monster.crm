import { BadRequestException } from '@nestjs/common';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

/** Deny non-public IPv4 and IPv6, including IPv4-mapped IPv6. */
export function isPublicAddress(address: string): boolean {
  const value = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (isIP(value) === 4) {
    const [a, b] = value.split('.').map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && [0, 168].includes(b)) ||
      (a === 198 && [18, 19, 51].includes(b)) ||
      (a === 203 && b === 0)
    );
  }
  if (isIP(value) === 6) {
    // Only global unicast is accepted. This rejects mapped, loopback, ULA, multicast,
    // link-local, NAT64, and other special-use addresses without parsing ambiguities.
    return (
      /^[23][0-9a-f]{3}:/.test(value) &&
      !value.startsWith('2001:db8:') &&
      !value.startsWith('2001:0:') &&
      !value.startsWith('2002:')
    );
  }
  return false;
}

export function validateWebhookUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new BadRequestException('Invalid webhook URL');
  }
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.hash ||
    (!url.hostname.includes('.') && isIP(url.hostname.replace(/^\[|\]$/g, '')) === 0)
  ) {
    throw new BadRequestException('Webhook requires a public HTTP(S) URL without credentials');
  }
  const host = url.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '');
  if (
    ['localhost', 'metadata.google.internal'].includes(host) ||
    /\.(localhost|local|internal|test|invalid)$/.test(host) ||
    (isIP(host) && !isPublicAddress(host))
  ) {
    throw new BadRequestException('Private webhook destination is not allowed');
  }
  return url;
}

export async function publicWebhookAgents(
  value: string,
): Promise<{ httpAgent: HttpAgent; httpsAgent: HttpsAgent }> {
  const url = validateWebhookUrl(value);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new BadRequestException('Webhook resolves to a private or reserved address');
  }
  const selected = addresses[0];
  // Pin the validated address at connection time, closing the DNS rebinding gap.
  const pinnedLookup: import('net').LookupFunction = (_hostname, _options, callback) =>
    callback(null, selected.address, selected.family);
  return {
    httpAgent: new HttpAgent({ lookup: pinnedLookup }),
    httpsAgent: new HttpsAgent({ lookup: pinnedLookup }),
  };
}
