import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuditLogsController } from './admin-audit-logs.controller';
import { AdminAuditLogsService } from './admin-audit-logs.service';
import { AuditLog } from '@autopilot/core/database/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AdminAuditLogsController],
  providers: [AdminAuditLogsService],
  exports: [AdminAuditLogsService],
})
export class AdminAuditLogsModule {}
