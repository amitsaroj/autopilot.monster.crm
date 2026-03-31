import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD, APP_PIPE } from '@nestjs/core';

// Config factories
import { CacheModule } from './cache/cache.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PlanGuard } from './common/guards/plan.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { minioConfig } from './config/minio.config';
import { qdrantConfig } from './config/qdrant.config';
import { jwtConfig } from './config/jwt.config';
import { throttleConfig } from './config/throttle.config';

// Core sub-modules
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';
import { EventBusModule } from './events/event-bus.module';
import { StorageModule } from './storage/storage.module';

// Business Modules
import { AiModule } from './modules/ai/ai.module';
import { VoiceModule } from './modules/voice/voice.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { CrmModule } from './modules/crm/crm.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { MonetizationModule } from './modules/monetization.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { PlatformModule } from './modules/platform.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { SocialModule } from './modules/social/social.module';
import { SubAdminModule } from './modules/sub-admin/sub-admin.module';
import { TenantSettingsModule } from './modules/tenant-settings/tenant-settings.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

// Common
import { ValidationPipe } from './common/pipes/validation.pipe';

/**
 * CoreModule — root application module.
 * Registers all global filters, interceptors, guards, and pipes.
 * All other modules (auth, tenant, rbac, billing, ...) import CoreModule.
 */
@Module({
  imports: [
    // Config — load all factories, validate .env
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        minioConfig,
        qdrantConfig,
        jwtConfig,
        throttleConfig,
      ],
    }),

    ScheduleModule.forRoot(),

    // Infrastructure
    DatabaseModule,
    LoggerModule,
    HealthModule,
    CacheModule,
    QueueModule,
    EventBusModule,
    StorageModule,

    // Business Modules
    AiModule,
    VoiceModule,
    WhatsappModule,
    WorkflowModule,
    CrmModule,
    TenantModule,
    RbacModule,
    MonetizationModule,
    NotificationModule,
    PlatformModule,
    UsersModule,
    AdminModule,
    SocialModule,
    SubAdminModule,
    AuthModule,
    TenantSettingsModule,
    SchedulerModule,
  ],
  providers: [
    // === Global Exception Filters (order matters: catch-all first) ===
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },

    // === Global Interceptors ===
    { provide: APP_INTERCEPTOR, useClass: CorrelationIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

    // === Global Guards (order: JWT → Tenant → Roles → Plan) ===
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PlanGuard },

    // === Global Validation Pipe ===
    { provide: APP_PIPE, useClass: ValidationPipe },
  ],
})
export class CoreModule {}
