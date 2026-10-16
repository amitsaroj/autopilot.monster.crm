import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plugin } from '../../database/entities/plugin.entity';
import { ProductEntitlement } from '../../database/entities/product-entitlement.entity';
import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';
import { MonetizationModule } from '../monetization.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { WhatsappAutomationController } from './whatsapp-automation.controller';
import { WhatsappAutomationService } from './whatsapp-automation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plugin, TenantPlugin, ProductEntitlement]),
    MonetizationModule,
    WhatsappModule,
    WorkflowModule,
  ],
  controllers: [WhatsappAutomationController],
  providers: [
    WhatsappAutomationService,
    { provide: 'WORKFLOW_ENTITLEMENT_POLICY', useExisting: WhatsappAutomationService },
  ],
  exports: [WhatsappAutomationService, 'WORKFLOW_ENTITLEMENT_POLICY'],
})
export class WhatsappAutomationModule {}
