import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminWhatsappController } from './sub-admin-whatsapp.controller';
import { SubAdminWhatsappService } from './sub-admin-whatsapp.service';
import { TenantSetting } from '../../../database/entities/tenant-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantSetting])],
  controllers: [SubAdminWhatsappController],
  providers: [SubAdminWhatsappService],
  exports: [SubAdminWhatsappService],
})
export class SubAdminWhatsappModule {}
