import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminAiController } from './sub-admin-ai.controller';
import { SubAdminAiService } from './sub-admin-ai.service';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantSetting])],
  controllers: [SubAdminAiController],
  providers: [SubAdminAiService],
  exports: [SubAdminAiService],
})
export class SubAdminAiModule {}
