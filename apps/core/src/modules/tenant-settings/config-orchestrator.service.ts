import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../../database/entities/tenant-setting.entity';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';

@Injectable()
export class ConfigOrchestratorService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TenantSetting)
    private readonly tenantSettingRepo: Repository<TenantSetting>,
    @InjectRepository(PlatformSetting)
    private readonly platformSettingRepo: Repository<PlatformSetting>,
  ) {}

  /**
   * Retrieves a configuration value with dynamic fallback:
   * 1. Tenant-specific override (TenantSetting)
   * 2. Platform-wide setting (PlatformSetting)
   * 3. Environment variable (ConfigService)
   */
  async get(tenantId: string, key: string, defaultValue?: any): Promise<any> {
    // 1. Check Tenant Specific Setting
    const tenantSetting = await this.tenantSettingRepo.findOne({ 
      where: { tenantId, key } 
    });
    if (tenantSetting && tenantSetting.value !== undefined && tenantSetting.value !== '') {
      return tenantSetting.value;
    }

    // 2. Check Global Platform Setting
    const platformSetting = await this.platformSettingRepo.findOne({ 
      where: { key } 
    });
    if (platformSetting && platformSetting.value !== undefined && platformSetting.value !== '') {
      return platformSetting.value;
    }

    // 3. Check ConfigService (env)
    const envValue = this.configService.get(key);
    if (envValue !== undefined) return envValue;

    return defaultValue;
  }

  /**
   * Convenience method for AI settings with standard keys
   */
  async getAISettings(tenantId: string) {
    return {
      openaiKey: await this.get(tenantId, 'openai_key'),
      anthropicKey: await this.get(tenantId, 'anthropic_key'),
      defaultModel: await this.get(tenantId, 'ai_default_model', 'gpt-4o'),
      platformRole: await this.get(tenantId, 'ai_platform_role', 'You are an advanced CRM assistant.'),
    };
  }

  /**
   * Convenience method for Voice settings
   */
  async getVoiceSettings(tenantId: string) {
    return {
      elevenLabsKey: await this.get(tenantId, 'elevenlabs_key'),
      defaultVoiceId: await this.get(tenantId, 'voice_default_id'),
      twilioVoiceSid: await this.get(tenantId, 'twilio_voice_sid'),
    };
  }
  
  /**
   * Convenience method for WhatsApp settings
   */
  async getWhatsAppSettings(tenantId: string) {
    return {
      appId: await this.get(tenantId, 'whatsapp_app_id'),
      accessToken: await this.get(tenantId, 'whatsapp_access_token'),
      phoneNumberId: await this.get(tenantId, 'whatsapp_phone_number_id'),
      businessAccountId: await this.get(tenantId, 'whatsapp_business_account_id'),
    };
  }
}
