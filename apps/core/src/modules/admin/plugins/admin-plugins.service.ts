import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminPluginsService {
  async findAll() {
    // This would typically read from a plugins directory or database
    return [
      { id: 'zapier', name: 'Zapier Integration', version: '1.0.0', status: 'ACTIVE' },
      { id: 'slack', name: 'Slack Notifications', version: '2.1.0', status: 'ACTIVE' },
      { id: 'hubspot', name: 'HubSpot Sync', version: '0.9.0', status: 'INACTIVE' },
    ];
  }
}
