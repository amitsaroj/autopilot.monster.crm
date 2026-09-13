import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiProviderService } from './ai-provider.service';

/**
 * Global so any module can inject `AiProviderService` without adding an
 * explicit import — matches the precedent set by `TenantSettingsModule`
 * (also `@Global()`), whose `ConfigOrchestratorService` this depends on.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [AiProviderService],
  exports: [AiProviderService],
})
export class AiProviderModule {}
