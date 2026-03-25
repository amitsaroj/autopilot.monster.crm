import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class AdminHealthService {
  async getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: process.memoryUsage(),
      },
      cpu: {
        load: os.loadavg(),
        count: os.cpus().length,
      },
      platform: os.platform(),
      nodeVersion: process.version,
    };
  }
}
