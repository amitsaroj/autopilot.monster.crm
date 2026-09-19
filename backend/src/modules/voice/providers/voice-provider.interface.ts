/**
 * Provider adapter seam for placing/managing calls — the voice-module
 * equivalent of `AiProviderService`'s `AiProvider` interface. Only the
 * operations the campaign engine actually needs to be provider-agnostic
 * about live here (initiate/hang-up/transfer/health); TwiML generation,
 * phone-number search/purchase, and SMS stay directly on `TwilioService`
 * since they're inherently Twilio-shaped and every real provider's
 * equivalent differs enough that a shared interface would be fake
 * abstraction. Adding a second real provider means implementing this
 * interface and adding one branch to `VoiceProviderRegistry.resolve`.
 */

export interface InitiateCallOptions {
  /**
   * When true, ask the provider to run answering-machine detection
   * asynchronously (must not delay the call connecting) and report the
   * result to `amdCallbackUrl`. A provider that can't do this at all should
   * just not report it, rather than fake a result.
   */
  machineDetection?: boolean;
  amdCallbackUrl?: string;
  statusCallbackUrl?: string;
  recordingCallbackUrl?: string;
}

export type VoiceProviderHealthStatus =
  | 'CONNECTED'
  | 'NOT_CONFIGURED'
  | 'INVALID_CREDENTIALS'
  | 'UNAVAILABLE';

export interface VoiceProviderHealth {
  provider: string;
  status: VoiceProviderHealthStatus;
  detail?: string;
  fromNumber?: string;
}

export interface VoiceProvider {
  readonly name: string;

  getFromNumber(tenantId: string): Promise<string>;

  initiateOutboundCall(
    tenantId: string,
    to: string,
    wssUrl: string,
    options?: InitiateCallOptions,
  ): Promise<string>;

  hangUpCall(tenantId: string, providerCallId: string): Promise<void>;

  transferCall(tenantId: string, providerCallId: string, to: string): Promise<void>;

  /** Authenticated download of a call recording's raw audio bytes — auth mechanics are provider-specific. */
  downloadRecording(tenantId: string, recordingUrl: string): Promise<Buffer>;

  validateWebhookSignature(
    signature: string | undefined,
    url: string,
    params: Record<string, string>,
  ): boolean;

  /** Real, live check — never claim CONNECTED without actually verifying credentials resolve to something usable. */
  checkHealth(tenantId: string): Promise<VoiceProviderHealth>;
}
