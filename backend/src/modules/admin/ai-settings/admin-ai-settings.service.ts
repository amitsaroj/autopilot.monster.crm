import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminAISettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'AI' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      openaiKey: config['openai_key'] || '',
      anthropicKey: config['anthropic_key'] || '',
      defaultModel: config['ai_default_model'] || 'gpt-4o',
      platformRole: config['ai_platform_role'] || 'You are an advanced CRM assistant.',
      embeddingModel: config['ai_embedding_model'] || 'text-embedding-3-small',
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      openaiKey: 'openai_key',
      anthropicKey: 'anthropic_key',
      defaultModel: 'ai_default_model',
      platformRole: 'ai_platform_role',
      embeddingModel: 'ai_embedding_model',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'AI' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
