/**
 * Maps Meta Cloud API send errors to what a bulk sender must do next.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
 */
export type WhatsappErrorAction =
  | { type: 'SUPPRESS_CONTACT'; reason: string }
  | { type: 'RETRY_LATER'; delayMs: number; reason: string }
  | { type: 'FAIL_PERMANENT'; reason: string }
  | { type: 'PAUSE_BROADCAST'; reason: string };

const pause = (reason: string): WhatsappErrorAction => ({ type: 'PAUSE_BROADCAST', reason });
const retry = (delayMs: number, reason: string): WhatsappErrorAction => ({
  type: 'RETRY_LATER',
  delayMs,
  reason,
});
const fail = (reason: string): WhatsappErrorAction => ({ type: 'FAIL_PERMANENT', reason });

const CODES: Readonly<Record<number, WhatsappErrorAction>> = {
  131050: {
    type: 'SUPPRESS_CONTACT',
    reason: 'Recipient stopped marketing messages from this business (131050)',
  },
  // Throughput / rate limits: slow down, the message itself is fine.
  4: retry(60000, 'Meta app request limit reached (4)'),
  80007: retry(60000, 'WhatsApp Business Account rate limit reached (80007)'),
  130429: retry(30000, 'Phone number throughput limit reached (130429)'),
  131056: retry(60000, 'Too many messages to this recipient in a short time (131056)'),
  // Account, token and quality problems hit every remaining recipient: stop and tell a human.
  0: pause('Meta authentication failed; reconnect the WhatsApp account (0)'),
  10: pause('Meta permission denied; check the app permissions for this number (10)'),
  190: pause('Meta access token expired or was revoked; reconnect the WhatsApp account (190)'),
  368: pause('Account temporarily blocked for policy violations (368)'),
  131031: pause('WhatsApp Business Account is locked (131031)'),
  131042: pause('WhatsApp Business Account payment or eligibility problem (131042)'),
  131048: pause('Spam rate limit hit: too many recent messages were blocked or flagged (131048)'),
  133010: pause('Sender phone number is not registered with WhatsApp (133010)'),
  132001: pause('Template does not exist in this language (132001)'),
  132007: pause('Template content violates WhatsApp policy (132007)'),
  132015: pause('Template is paused by Meta for low quality (132015)'),
  132016: pause('Template is disabled by Meta (132016)'),
  // Recipient-specific: not worth retrying automatically.
  131026: fail('Message undeliverable to this recipient (131026)'),
  131047: fail('Outside the 24-hour window; re-engagement needs a template (131047)'),
  131049: fail('Meta chose not to deliver this marketing message (131049)'),
  131051: fail('Unsupported message type (131051)'),
  130472: fail('Recipient is part of a Meta experiment (130472)'),
};

export function classifyWhatsappError(
  providerCode?: number,
  httpStatus?: number,
): WhatsappErrorAction {
  if (providerCode !== undefined) {
    const known = CODES[providerCode];
    if (known) return known;
    if (providerCode >= 200 && providerCode <= 299)
      return pause(`Meta API permission missing (${providerCode})`);
    if (providerCode >= 132000 && providerCode <= 132999)
      return fail(`Template parameters rejected by Meta (${providerCode})`);
  }
  if (httpStatus === 429) return retry(30000, 'Meta rate limit reached (HTTP 429)');
  if (httpStatus === 401 || httpStatus === 403)
    return pause(`Meta rejected the account credentials (HTTP ${httpStatus})`);
  return fail(`Meta rejected the message${providerCode !== undefined ? ` (${providerCode})` : ''}`);
}
