import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';

import { QUEUE_NAMES } from '../queue.constants';
import { AnalyticsModule } from '../../modules/analytics/analytics.module';
import { AiModule } from '../../modules/ai/ai.module';
import { EmailModule } from '../../shared/email/email.module';
import { NotificationModule } from '../../modules/notifications/notification.module';
import { VoiceModule } from '../../modules/voice/voice.module';
import { EmailQueueProcessor } from './email.processor';
import { SmsQueueProcessor } from './sms.processor';
import { VoiceQueueProcessor } from './voice.processor';
import { NotificationQueueProcessor } from './notification.processor';
import { AiInferenceQueueProcessor } from './ai-inference.processor';
import { BillingQueueProcessor } from './billing.processor';
import { AnalyticsQueueProcessor } from './analytics.processor';
import { SearchIndexQueueProcessor } from './search-index.processor';

const processorQueues = [
  QUEUE_NAMES.EMAIL,
  QUEUE_NAMES.SMS,
  QUEUE_NAMES.VOICE,
  QUEUE_NAMES.NOTIFICATION,
  QUEUE_NAMES.AI_INFERENCE,
  QUEUE_NAMES.BILLING,
  QUEUE_NAMES.ANALYTICS,
  QUEUE_NAMES.SEARCH_INDEX,
] as const;

@Module({
  imports: [
    AnalyticsModule,
    EmailModule,
    NotificationModule,
    VoiceModule,
    forwardRef(() => AiModule),
    BullModule.registerQueue(...processorQueues.map((name) => ({ name }))),
  ],
  providers: [
    EmailQueueProcessor,
    SmsQueueProcessor,
    VoiceQueueProcessor,
    NotificationQueueProcessor,
    AiInferenceQueueProcessor,
    BillingQueueProcessor,
    AnalyticsQueueProcessor,
    SearchIndexQueueProcessor,
  ],
})
export class QueueProcessorsModule {}
