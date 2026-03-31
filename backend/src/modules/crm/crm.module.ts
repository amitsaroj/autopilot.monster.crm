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
import { Contact } from '../../database/entities/contact.entity';
import { Company } from '../../database/entities/company.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Activity } from '../../database/entities/activity.entity';
import { Task } from '../../database/entities/task.entity';
import { Note } from '../../database/entities/note.entity';
import { Product } from '../../database/entities/product.entity';
import { Quote } from '../../database/entities/quote.entity';
import { Pipeline } from '../../database/entities/pipeline.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { Campaign } from '../../database/entities/campaign.entity';
import { EmailMessage } from '../../database/entities/email-message.entity';

import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';
import { CompanyService } from './company.service';
import { CompanyRepository } from './company.repository';
import { DealService } from './deal.service';
import { DealRepository } from './deal.repository';
import { PipelineService } from './pipeline.service';
import { PipelineRepository } from './pipeline.repository';
import {
  ActivityService,
  TaskCrmService,
  NoteService,
  ProductService,
  QuoteService,
  CampaignCrmService,
  AnalyticsCrmService,
  EmailCrmService,
  BulkCrmService,
} from './crm-support.service';
import {
  ActivityRepository,
  TaskCrmRepository,
  NoteRepository,
  ProductRepository,
  QuoteRepository,
  CampaignRepository,
  EmailRepository,
} from './crm-support.repository';
import { VoiceModule } from '../voice/voice.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agent,
      Flow,
      Lead,
      Contact,
      Company,
      Deal,
      Activity,
      Task,
      Note,
      Product,
      Quote,
      Pipeline,
      PipelineStage,
      Campaign,
      EmailMessage,
    ]),
    forwardRef(() => WhatsappModule),
    forwardRef(() => VoiceModule),
  ],
  controllers: [CrmController],
  providers: [
    AgentService,
    FlowService,
    LeadService,
    CsvService,
    LeadIntelligenceService,
    NotificationService,
    CampaignService,
    ContactService,
    ContactRepository,
    CompanyService,
    CompanyRepository,
    DealService,
    DealRepository,
    PipelineService,
    PipelineRepository,
    ActivityService,
    ActivityRepository,
    TaskCrmService,
    TaskCrmRepository,
    NoteService,
    NoteRepository,
    ProductService,
    ProductRepository,
    QuoteService,
    QuoteRepository,
    CampaignCrmService,
    CampaignRepository,
    AnalyticsCrmService,
    EmailCrmService,
    EmailRepository,
    BulkCrmService,
  ],
  exports: [
    AgentService,
    FlowService,
    LeadService,
    CsvService,
    LeadIntelligenceService,
    NotificationService,
    CampaignService,
    ContactService,
    CompanyService,
    DealService,
    PipelineService,
    ActivityService,
    TaskCrmService,
    NoteService,
    ProductService,
    QuoteService,
  ],
})
export class CrmModule {}
