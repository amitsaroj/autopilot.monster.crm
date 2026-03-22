import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD, APP_PIPE } from '@nestjs/core';

// Config factories
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
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { EventBusModule } from './events/event-bus.module';
import { StorageModule } from './storage/storage.module';

// Business Modules
import { AiModule } from './modules/ai/ai.module';
import { VoiceModule } from './modules/voice/voice.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { CrmModule } from './modules/crm/crm.module';

// Common
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PlanGuard } from './common/guards/plan.guard';
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
