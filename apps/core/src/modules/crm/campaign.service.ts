import { Injectable, Logger } from '@nestjs/common';
import { TwilioService } from '../voice/twilio.service';
import { LeadService } from './lead.service';
import { AgentService } from './agent.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private twilioService: TwilioService,
    private leadService: LeadService,
    private agentService: AgentService,
    private configService: ConfigService,
  ) {}

  /**
   * Starts a bulk calling campaign for a set of lead IDs.
   */
  async startBulkCampaign(tenantId: string, agentId: string, leadIds: string[]) {
    this.logger.log(`Starting bulk campaign for agent ${agentId} with ${leadIds.length} leads`);
    
    // We fetch the agent to make sure it exists
    const agent = await this.agentService.findOne(tenantId, agentId);
    if (!agent) throw new Error('Agent not found');

    const appUrl = this.configService.get('APP_URL') || 'https://autopilot.monster';
    
    // Batch process calls (simple loop for now, could be queue-based)
    const results = [];
    for (const leadId of leadIds) {
      try {
        const lead = await this.leadService.findOne(tenantId, leadId);
        if (!lead || !lead.phone) continue;

        // Construct the WSS URL for the Twilio Stream connection
        // Format: wss://<domain>/voice/stream?tenantId=<id>&agentId=<id>&leadId=<id>
        const wssUrl = `${appUrl.replace('https', 'wss')}/voice/stream?tenantId=${tenantId}&agentId=${agentId}&leadId=${leadId}`;
        
        const callSid = await this.twilioService.initiateOutboundCall(lead.phone, wssUrl);
        results.push({ leadId, status: 'initiated', callSid });
        
        this.logger.log(`Call initiated for lead ${leadId}: ${callSid}`);
      } catch (err: any) {
        this.logger.error(`Failed to initiate call for lead ${leadId}`, err);
        results.push({ leadId, status: 'failed', error: err.message });
      }
    }
    
    return results;
  }
}
