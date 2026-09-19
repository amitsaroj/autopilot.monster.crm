import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { ConfigOrchestratorService } from '../../tenant-settings/config-orchestrator.service';
import { TwilioService } from '../twilio.service';
import type { VoiceProvider, VoiceProviderHealth } from './voice-provider.interface';

/**
 * Resolves which VoiceProvider a tenant's calls go through. Twilio is the
 * only real adapter today; the tenant config key 'voice_provider' (default
 * 'twilio') is the single seam a second provider plugs into — add its
 * adapter class, register it in the `providers` map below, and this
 * registry, `VoiceCallService`, and the health-check endpoint all pick it up
 * with no further changes. Mirrors `AiProviderService.resolveProviderName`.
 */
@Injectable()
export class VoiceProviderRegistry {
  private readonly providers: Record<string, VoiceProvider>;

  constructor(
    private readonly twilioService: TwilioService,
    private readonly configOrchestrator: ConfigOrchestratorService,
  ) {
    this.providers = {
      twilio: this.twilioService,
    };
  }

  async resolveProviderName(tenantId: string): Promise<string> {
    const configured = await this.configOrchestrator.get(tenantId, 'voice_provider');
    const name = typeof configured === 'string' && configured.trim() ? configured.trim() : 'twilio';
    return name in this.providers ? name : 'twilio';
  }

  async getProvider(tenantId: string): Promise<VoiceProvider> {
    const name = await this.resolveProviderName(tenantId);
    const provider = this.providers[name];
    if (!provider) {
      throw new ServiceUnavailableException(`Voice provider '${name}' is not available`);
    }
    return provider;
  }

  listProviderNames(): string[] {
    return Object.keys(this.providers);
  }

  async checkHealth(tenantId: string): Promise<VoiceProviderHealth> {
    const provider = await this.getProvider(tenantId);
    return provider.checkHealth(tenantId);
  }

  async checkAllHealth(tenantId: string): Promise<VoiceProviderHealth[]> {
    return Promise.all(
      this.listProviderNames().map((name) => this.providers[name].checkHealth(tenantId)),
    );
  }
}
