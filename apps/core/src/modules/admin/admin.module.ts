import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';

import { AdminUsersModule } from './users/admin-users.module';
import { AdminRolesModule } from './roles/admin-roles.module';
import { AdminPermissionsModule } from './permissions/admin-permissions.module';
import { AdminTenantsModule } from './tenants/admin-tenants.module';
import { AdminPlansModule } from './plans/admin-plans.module';
import { AdminFeaturesModule } from './features/admin-features.module';
import { AdminLimitsModule } from './limits/admin-limits.module';
import { AdminSubscriptionsModule } from './subscriptions/admin-subscriptions.module';
import { AdminInvoicesModule } from './invoices/admin-invoices.module';
import { AdminUsageModule } from './usage/admin-usage.module';
import { AdminBillingModule } from './billing/admin-billing.module';
import { AdminPricingModule } from './pricing/admin-pricing.module';
import { AdminFeatureFlagsModule } from './feature-flags/admin-feature-flags.module';
import { AdminAuditLogsModule } from './audit-logs/admin-audit-logs.module';
import { AdminMetricsModule } from './metrics/admin-metrics.module';
import { AdminMarketplaceModule } from './marketplace/admin-marketplace.module';
import { AdminApiLogsModule } from './api-logs/admin-api-logs.module';
import { AdminWebhooksLogsModule } from './webhooks-logs/admin-webhooks-logs.module';
import { AdminHealthModule } from './health/admin-health.module';
import { AdminQueuesModule } from './queues/admin-queues.module';
import { AdminEventsModule } from './events/admin-events.module';
import { AdminSchedulerModule } from './scheduler/admin-scheduler.module';
import { AdminWorkersModule } from './workers/admin-workers.module';
import { AdminNotificationsModule } from './notifications/admin-notifications.module';
import { AdminPluginsModule } from './plugins/admin-plugins.module';
import { AdminIntegrationsModule } from './integrations/admin-integrations.module';
import { AdminStorageModule } from './storage/admin-storage.module';
import { AdminBackupsModule } from './backups/admin-backups.module';
import { AdminRestoreModule } from './restore/admin-restore.module';
import { AdminConfigModule } from './config/admin-config.module';
import { AdminEnvironmentModule } from './environment/admin-environment.module';
import { AdminSystemSettingsModule } from './system-settings/admin-system-settings.module';
import { AdminEmailSettingsModule } from './email-settings/admin-email-settings.module';
import { AdminSmsSettingsModule } from './sms-settings/admin-sms-settings.module';
import { AdminWhatsAppSettingsModule } from './whatsapp-settings/admin-whatsapp-settings.module';
import { AdminAISettingsModule } from './ai-settings/admin-ai-settings.module';
import { AdminVoiceSettingsModule } from './voice-settings/admin-voice-settings.module';
import { AdminSecuritySettingsModule } from './security-settings/admin-security-settings.module';
import { AdminIpWhitelistModule } from './ip-whitelist/admin-ip-whitelist.module';
import { AdminRateLimitModule } from './rate-limit/admin-rate-limit.module';
import { AdminUsageRulesModule } from './usage-rules/admin-usage-rules.module';
import { AdminCostRulesModule } from './cost-rules/admin-cost-rules.module';
import { AdminFeatureRulesModule } from './feature-rules/admin-feature-rules.module';
import { AdminTenantOverrideModule } from './tenant-override/admin-tenant-override.module';
import { AdminPlanOverrideModule } from './plan-override/admin-plan-override.module';
import { AdminUserOverrideModule } from './user-override/admin-user-override.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformSetting]),
    AdminUsersModule,
    AdminRolesModule,
    AdminPermissionsModule,
    AdminTenantsModule,
    AdminPlansModule,
    AdminFeaturesModule,
    AdminLimitsModule,
    AdminSubscriptionsModule,
    AdminInvoicesModule,
    AdminUsageModule,
    AdminBillingModule,
    AdminPricingModule,
    AdminFeatureFlagsModule,
    AdminAuditLogsModule,
    AdminMetricsModule,
    AdminMarketplaceModule,
    AdminApiLogsModule,
    AdminWebhooksLogsModule,
    AdminHealthModule,
    AdminQueuesModule,
    AdminEventsModule,
    AdminSchedulerModule,
    AdminWorkersModule,
    AdminNotificationsModule,
    AdminPluginsModule,
    AdminIntegrationsModule,
    AdminStorageModule,
    AdminBackupsModule,
    AdminRestoreModule,
    AdminConfigModule,
    AdminEnvironmentModule,
    AdminSystemSettingsModule,
    AdminEmailSettingsModule,
    AdminSmsSettingsModule,
    AdminWhatsAppSettingsModule,
    AdminAISettingsModule,
    AdminVoiceSettingsModule,
    AdminSecuritySettingsModule,
    AdminIpWhitelistModule,
    AdminRateLimitModule,
    AdminUsageRulesModule,
    AdminCostRulesModule,
    AdminFeatureRulesModule,
    AdminTenantOverrideModule,
    AdminPlanOverrideModule,
    AdminUserOverrideModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
