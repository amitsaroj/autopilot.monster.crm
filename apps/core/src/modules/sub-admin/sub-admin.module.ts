import { Module } from '@nestjs/common';
import { SubAdminUsersModule } from './users/sub-admin-users.module';
import { SubAdminRolesModule } from './roles/sub-admin-roles.module';
import { SubAdminPermissionsModule } from './permissions/sub-admin-permissions.module';
import { SubAdminBillingModule } from './billing/sub-admin-billing.module';
import { SubAdminUsageModule } from './usage/sub-admin-usage.module';
import { SubAdminSettingsModule } from './settings/sub-admin-settings.module';
import { SubAdminIntegrationsModule } from './integrations/sub-admin-integrations.module';
import { SubAdminNotificationsModule } from './notifications/sub-admin-notifications.module';
import { SubAdminLogsModule } from './logs/sub-admin-logs.module';
import { SubAdminPluginsModule } from './plugins/sub-admin-plugins.module';
import { SubAdminMarketplaceModule } from './marketplace/sub-admin-marketplace.module';
import { SubAdminWorkflowsModule } from './workflows/sub-admin-workflows.module';
import { SubAdminAiModule } from './ai/sub-admin-ai.module';
import { SubAdminVoiceModule } from './voice/sub-admin-voice.module';
import { SubAdminWhatsappModule } from './whatsapp/sub-admin-whatsapp.module';

@Module({
  imports: [
    SubAdminUsersModule,
    SubAdminRolesModule,
    SubAdminPermissionsModule,
    SubAdminBillingModule,
    SubAdminUsageModule,
    SubAdminSettingsModule,
    SubAdminIntegrationsModule,
    SubAdminNotificationsModule,
    SubAdminLogsModule,
    SubAdminPluginsModule,
    SubAdminMarketplaceModule,
    SubAdminWorkflowsModule,
    SubAdminAiModule,
    SubAdminVoiceModule,
    SubAdminWhatsappModule,
  ],
  controllers: [],
  providers: [],
})
export class SubAdminModule {}
