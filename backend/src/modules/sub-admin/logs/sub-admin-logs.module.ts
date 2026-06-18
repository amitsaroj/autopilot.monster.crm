import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminLogsController } from './sub-admin-logs.controller';
import { SubAdminLogsService } from './sub-admin-logs.service';
import { AuditLog } from '../../../database/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [SubAdminLogsController],
  providers: [SubAdminLogsService],
  exports: [SubAdminLogsService],
})
export class SubAdminLogsModule {}
