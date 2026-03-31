import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminIntegrationsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async findAll() {
    // We use PlatformSetting to store global integration configs
    const configs = await this.settingRepo.find({
      where: { key: 'global_integrations' }
    });
    
    if (configs.length === 0) {
      return [
        { id: 'sendgrid', name: 'SendGrid', status: 'NOT_CONFIGURED', type: 'EMAIL' },
        { id: 'twilio', name: 'Twilio', status: 'NOT_CONFIGURED', type: 'SMS' },
        { id: 'stripe', name: 'Stripe', status: 'NOT_CONFIGURED', type: 'PAYMENT' },
      ];
    }
    
    return configs[0].value;
  }

  async updateConfig(id: string, config: any) {
    let setting = await this.settingRepo.findOne({ where: { key: 'global_integrations' } });
    
    if (!setting) {
      setting = this.settingRepo.create({
        key: 'global_integrations',
        value: [],
        group: 'INTEGRATIONS'
      });
    }
    
    const integrations = setting.value as any[];
    const index = integrations.findIndex(i => i.id === id);
    if (index !== -1) {
      integrations[index] = { ...integrations[index], ...config, status: 'CONFIGURED' };
    } else {
      integrations.push({ id, ...config, status: 'CONFIGURED' });
    }
    
    setting.value = integrations;
    return this.settingRepo.save(setting);
  }
}
