import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentService } from './agent.service';
import { CampaignService } from './campaign.service';
import { CrmController } from './crm.controller';
import { CsvService } from './csv.service';
import { FlowService } from './flow.service';
import { LeadIntelligenceService } from './lead-intelligence.service';
import { LeadService } from './lead.service';
import { NotificationService } from './notification.service';
import { Agent } from '../../database/entities/agent.entity';
import { Flow } from '../../database/entities/flow.entity';
import { Lead } from '../../database/entities/lead.entity';
import { VoiceModule } from '../voice/voice.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, Flow, Lead]),
    forwardRef(() => WhatsappModule),
    forwardRef(() => VoiceModule),
  ],
  controllers: [CrmController],
  providers: [AgentService, FlowService, LeadService, CsvService, LeadIntelligenceService, NotificationService, CampaignService],
  exports: [AgentService, FlowService, LeadService, CsvService, LeadIntelligenceService, NotificationService, CampaignService],
})
export class CrmModule {}
