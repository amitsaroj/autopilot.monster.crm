import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '@autopilot/core/database/entities/platform-setting.entity';
import { Invoice } from '@autopilot/core/database/entities/invoice.entity';

@Injectable()
export class AdminBillingService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepo: Repository<PlatformSetting>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async getSettings() {
    return this.settingRepo.find({
      where: { group: 'BILLING' },
    });
  }

  async updateSettings(settings: Record<string, any>) {
    const promises = Object.entries(settings).map(async ([key, value]) => {
      let setting = await this.settingRepo.findOne({ where: { key } });
      if (setting) {
        setting.value = value;
      } else {
        setting = this.settingRepo.create({ key, value, group: 'BILLING' });
      }
      return this.settingRepo.save(setting);
    });
    return Promise.all(promises);
  }

  async getStats() {
    const totalRevenue = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amount)', 'total')
      .where('invoice.status = :status', { status: 'PAID' })
      .getRawOne();

    const pendingRevenue = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amount)', 'total')
      .where('invoice.status = :status', { status: 'PENDING' })
      .getRawOne();

    return {
      totalRevenue: parseFloat(totalRevenue?.total || 0),
      pendingRevenue: parseFloat(pendingRevenue?.total || 0),
    };
  }
}
