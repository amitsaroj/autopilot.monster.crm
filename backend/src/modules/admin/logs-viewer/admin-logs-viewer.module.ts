import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLogsViewerController } from './admin-logs-viewer.controller';
import { AdminLogsViewerService } from './admin-logs-viewer.service';
import { AuditLog } from '../../../database/entities/audit-log.entity';
import { ApiLog } from '../../../database/entities/api-log.entity';
import { WebhookLog } from '../../../database/entities/webhook-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, ApiLog, WebhookLog])],
  controllers: [AdminLogsViewerController],
  providers: [AdminLogsViewerService],
  exports: [AdminLogsViewerService],
})
export class AdminLogsViewerModule {}
