import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminWebhooksLogsController } from './admin-webhooks-logs.controller';
import { AdminWebhooksLogsService } from './admin-webhooks-logs.service';
import { WebhookLog } from '@autopilot/core/database/entities/webhook-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookLog])],
  controllers: [AdminWebhooksLogsController],
  providers: [AdminWebhooksLogsService],
  exports: [AdminWebhooksLogsService],
})
export class AdminWebhooksLogsModule {}
