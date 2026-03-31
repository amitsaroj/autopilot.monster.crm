import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminVoiceController } from './sub-admin-voice.controller';
import { SubAdminVoiceService } from './sub-admin-voice.service';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantSetting])],
  controllers: [SubAdminVoiceController],
  providers: [SubAdminVoiceService],
  exports: [SubAdminVoiceService],
})
export class SubAdminVoiceModule {}
