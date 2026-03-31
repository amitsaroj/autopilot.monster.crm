import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../../database/entities/platform-setting.entity';

@Injectable()
export class AdminVoiceSettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
  ) {}

  async getSettings() {
    const settings = await this.settingRepo.find({ where: { group: 'VOICE' } });
    const config: Record<string, any> = {};
    settings.forEach(s => { config[s.key] = s.value; });
    
    return {
      elevenLabsKey: config['elevenlabs_key'] || '',
      twilioVoiceSid: config['twilio_voice_sid'] || '',
      defaultVoiceId: config['default_voice_id'] || 'eleven_monica',
      vapiApiKey: config['vapi_key'] || '',
      retellApiKey: config['retell_key'] || '',
    };
  }

  async updateSettings(settings: Record<string, any>) {
    const mapping: Record<string, string> = {
      elevenLabsKey: 'elevenlabs_key',
      twilioVoiceSid: 'twilio_voice_sid',
      defaultVoiceId: 'default_voice_id',
      vapiApiKey: 'vapi_key',
      retellApiKey: 'retell_key',
    };

    const promises = Object.entries(settings).map(async ([key, value]) => {
      const dbKey = mapping[key] || key;
      let setting = await this.settingRepo.findOne({ where: { key: dbKey } });
      if (!setting) {
        setting = this.settingRepo.create({ key: dbKey, value, group: 'VOICE' });
      } else {
        setting.value = value;
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }
}
