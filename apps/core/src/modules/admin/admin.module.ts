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
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
