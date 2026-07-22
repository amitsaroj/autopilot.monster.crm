import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';

import { AgentService } from './agent.service';
import { LeadService } from './lead.service';
import { VoiceCallService } from '../voice/voice-call.service';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @Inject(forwardRef(() => VoiceCallService))
    private readonly voiceCallService: VoiceCallService,
    private leadService: LeadService,
    private agentService: AgentService,
  ) {}

  /**
   * Starts a bulk calling campaign for a set of lead IDs.
   */
  async startBulkCampaign(tenantId: string, agentId: string, leadIds: string[]) {
    this.logger.log(`Starting bulk campaign for agent ${agentId} with ${leadIds.length} leads`);

    // We fetch the agent to make sure it exists
    const agent = await this.agentService.findOne(tenantId, agentId);
    if (!agent) throw new Error('Agent not found');

    // Batch process calls (simple loop for now, could be queue-based)
    const results = [];
    for (const leadId of leadIds) {
      try {
        const lead = await this.leadService.findOne(tenantId, leadId);
        if (!lead || !lead.phone) continue;

        const wssUrl = this.voiceCallService.buildStreamUrl(tenantId, {
          agentId,
          leadId,
        });

        const call = await this.voiceCallService.initiateOutbound(tenantId, {
          to: lead.phone,
          wssUrl,
        });
        results.push({ leadId, status: 'initiated', callSid: call.sid });

        this.logger.log(`Call initiated for lead ${leadId}: ${call.sid}`);
      } catch (err: any) {
        this.logger.error(`Failed to initiate call for lead ${leadId}`, err);
        results.push({ leadId, status: 'failed', error: err.message });
      }
    }

    return results;
  }
}
